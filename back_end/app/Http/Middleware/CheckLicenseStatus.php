<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Response as ResponseFacade;

class CheckLicenseStatus
{
    private $encryptionKey = 'mpN3gJUJh2XMGXOlbP7BcNgOCKbFuKvZCIssgX7eJO2A320q50';

    private int $max_days_allowed = 2;
        private string $file1_path;
    private string $file2_path;
    private string $db_key;

    public function __construct()
    {
        $this->file1_path = storage_path('app/license.dat');
        $this->file2_path = storage_path('framework/cache/data/app_config.dat');
        $this->db_key     = 'app.core.license_key';
    }
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $record1 = $this->readFromFile($this->file1_path);
        $record2 = $this->readFromDB($this->db_key);
        $record3 = $this->readFromFile($this->file2_path);

        $masterRecord = $this->findMasterRecord([$record1, $record2, $record3]);

        $currentDate = Carbon::today()->toDateString();
        if ($currentDate < $masterRecord['last_run_date'])
        {
            return $this->abort('LICENSE_TAMPERING', 'System clock has been set back.');
        }

        if ($currentDate > $masterRecord['last_run_date'])
        {
            $masterRecord['days_used']++;
            $masterRecord['last_run_date'] = $currentDate;
        }

        if ($masterRecord['days_used'] > $this->max_days_allowed)
        {
            return $this->abort('LICENSE_EXPIRED', 'License has expired.');
        }

        try {
            $this->writeToFile($this->file1_path, $masterRecord);
            $this->writeToDB($this->db_key, $masterRecord);
            $this->writeToFile($this->file2_path, $masterRecord);
        } catch (\Exception $e)
        {
            return $this->abort('LICENSE_WRITE_ERROR', 'License check failed (write error).');
        }
        return $next($request);

    }

    private function findMasterRecord(array $records): array
    {
        $validRecords = array_filter($records);
        if (empty($validRecords))
        {
            return [
                'days_used' => 1,
                'last_run_date' => Carbon::today()->toDateString()
            ];
        }
        usort($validRecords, function ($a, $b) {
            if ($a['days_used'] != $b['days_used']) {
                return $b['days_used'] <=> $a['days_used'];
            }
            return $b['last_run_date'] <=> $a['last_run_date'];
        });
        return $validRecords[0];
    }

    private function readFromFile(string $path): ?array
    {
        if (!file_exists($path)) {
            return null;
        }
        try {
            $encryptedData = file_get_contents($path);
            $decrypted = Crypt::decryptString($encryptedData, $this->encryptionKey);
            return json_decode($decrypted, true);
        }
        catch (\Exception $e)
        {
            return null;
        }
    }

    private function writeToFile(string $path, array $data): void
    {
        $jsonData = json_encode($data);
        $encryptedData = Crypt::encryptString($jsonData, $this->encryptionKey);

        $directory = dirname($path);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        file_put_contents($path, $encryptedData);
    }

    private function readFromDB(string $key): ?array
    {
        try
        {
            $record = DB::table('license_keys')->where('key_hash', md5($key))->first();
            if (!$record) return null;

            $decrypted = Crypt::decryptString($record->payload, $this->encryptionKey);
            return json_decode($decrypted, true);
        }
        catch (\Exception $e)
        {
            return null;
        }
    }

    private function writeToDB(string $key, array $data): void
    {
        $jsonData = json_encode($data);
        $encryptedData = Crypt::encryptString($jsonData, $this->encryptionKey);
        $keyHash = md5($key);

        DB::table('license_keys')->updateOrInsert(
            ['key_hash' => $keyHash],
            ['payload' => $encryptedData, 'updated_at' => now()]
        );
    }
    private function abort(string $code, string $message): Response
    {
        return ResponseFacade::json([
            'error_code' => $code,
            'message' => $message
        ], 499);
    }
}
