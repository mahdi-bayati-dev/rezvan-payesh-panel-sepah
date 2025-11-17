<?php

namespace App\Services;

use App\Models\LicenseKey;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use stdClass;
use Illuminate\Encryption\Encrypter;

class LicenseService
{
    private string $trialEncryptionKey = 'mpN3gJUJh2XMGXOlbP7BcNgOCKbFuKvZCIssgX7eJO2A320q50';
    private string $trial_file1_path;
    private string $trial_file2_path;

    private string $publicKeyPath;

    public function __construct()
    {
        $this->trial_file1_path = storage_path('app/trial.dat');
        $this->trial_file2_path = storage_path('framework/cache/data/app_trial_config.dat');

        $this->publicKeyPath = storage_path('app/license/license.pubkey');
    }

    /**
     * یک نمونه Encrypter با کلید هاردکد شده آزمایشی برمی‌گرداند
     */
    private function getTrialEncrypter(): Encrypter
    {

        $key = substr($this->trialEncryptionKey, 0, 32);

        if (base64_decode($key, true) !== false) {

            $key = base64_decode($key);
        }

        return new Encrypter($key, 'AES-256-CBC');
    }

    /**
     * شناسه یکتای این نصب را برمی‌گرداند
     */
    public function getInstallationId(): string
    {
        $license = LicenseKey::first();
        if ($license && $license->installation_id)
        {
            return $license->installation_id;
        }

        $newId = Str::uuid();
        LicenseKey::firstOrCreate([], ['installation_id' => $newId, 'status' => 'trial']);
        return $newId;
    }

    /**
     * دریافت اطلاعات لایسنس برای نمایش در UI
     */
    public function getLicenseDetails(): array
    {
        $license = LicenseKey::firstOrCreate(
            ['installation_id' => $this->getInstallationId()],
            ['status' => 'trial']
        );

        $details = [
            'installation_id' => $license->installation_id,
            'status' => $license->status,
            'expires_at' => $license->expires_at ? $license->expires_at->toDateString() : null,
            'user_limit' => $license->user_limit ?? 5,
        ];

        if ($license->status === 'trial')
        {
            $trialData = $this->getMasterTrialRecord();
            $details['trial_days_used'] = $trialData['days_used'];
            $details['trial_last_run'] = $trialData['last_run_date'];
        }

        return $details;
    }


    // ===================================================================
    //  بخش ۱: منطق لایسنس آزمایشی (Trial Logic)
    // ===================================================================

    /**
     * رکورد مستر (قدیمی‌ترین) را از بین ۳ منبع پیدا می‌کند
     */
    public function getMasterTrialRecord(): array
    {
        $record1 = $this->readTrialData($this->trial_file1_path, 'file');
        $record2 = $this->readTrialData(null, 'db');
        $record3 = $this->readTrialData($this->trial_file2_path, 'file');

        $validRecords = array_filter([$record1, $record2, $record3]);

        if (empty($validRecords))
        {
            return [
                'days_used' => 1,
                'last_run_date' => Carbon::today()->toDateString()
            ];
        }

        usort($validRecords, function ($a, $b)
        {
            if ($a['days_used'] != $b['days_used'])
            {
                return $b['days_used'] <=> $a['days_used'];
            }
            return $b['last_run_date'] <=> $a['last_run_date'];
        });

        return $validRecords[0];
    }

    /**
     * داده‌های آزمایشی را در هر سه مکان همگام‌سازی می‌کند
     */
    public function syncTrialData(array $masterRecord): void
    {
        $this->writeTrialData($this->trial_file1_path, $masterRecord, 'file');
        $this->writeTrialData(null, $masterRecord, 'db');
        $this->writeTrialData($this->trial_file2_path, $masterRecord, 'file');
    }

    private function readTrialData(?string $path, string $type): ?array
    {
        try {
            if ($type === 'file')
            {
                if (!file_exists($path)) return null;
                $encryptedData = file_get_contents($path);
            }
            else
            {
                $record = DB::table('license_keys')->where('installation_id', $this->getInstallationId())->first();
                if (!$record || !$record->trial_payload_db) return null;
                $encryptedData = $record->trial_payload_db;
            }

            $decrypted = $this->getTrialEncrypter()->decryptString($encryptedData);

            return json_decode($decrypted, true);
        }
        catch (Exception $e)
        {
            return null;
        }
    }

    private function writeTrialData(?string $path, array $data, string $type): void
    {
        $jsonData = json_encode($data);

        $encryptedData = $this->getTrialEncrypter()->encryptString($jsonData);

        if ($type === 'file')
        {
            $directory = dirname($path);
            if (!is_dir($directory))
            {
                mkdir($directory, 0755, true);
            }
            file_put_contents($path, $encryptedData);
        }
        else
        {
            DB::table('license_keys')
              ->where('installation_id', $this->getInstallationId())
              ->update(['trial_payload_db' => $encryptedData]);
        }
    }

    /**
     * داده‌های آزمایشی را پس از ارتقا به لایسنس دائمی پاک می‌کند
     */
    private function cleanupTrialData(): void
    {
        @unlink($this->trial_file1_path);
        @unlink($this->trial_file2_path);
        DB::table('license_keys')
            ->where('installation_id', $this->getInstallationId())
            ->update(['trial_payload_db' => null]);
    }


    // ===================================================================
    //  بخش ۲: منطق لایسنس دائمی (Licensed Logic)
    // ===================================================================

    /**
     * توکن لایسنس جدید (امضا شده) را اعمال می‌کند
     */
    public function applyLicenseToken(string $token): bool
    {
        try
        {
            $payload = $this->verifyAndDecode($token);

            $license = LicenseKey::where('installation_id', $this->getInstallationId())->firstOrFail();

            if (!isset($payload->installation_id) || $payload->installation_id !== $license->installation_id)
            {
                Log::warning('لایسنس نامعتبر: شناسه نصب مطابقت ندارد.');
                return false;
            }

            $expiresAt = Carbon::parse($payload->expires_at);
            if ($expiresAt->isPast())
            {
                Log::warning('لایسنس نامعتبر: تاریخ انقضا گذشته است.');
                return false;
            }

            $license->license_token = $token;
            $license->expires_at = $expiresAt;
            $license->user_limit = $payload->user_limit ?? 5;
            $license->status = 'licensed';
            $license->save();

            $this->cleanupTrialData();

            return true;

        }
        catch (Exception $e)
        {
            Log::error('خطا در اعمال لایسنس: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * وضعیت لایسنس امضا شده را بررسی می‌کند
     */
    public function checkLicensedStatus(LicenseKey $license): string
    {
        if (!$license->license_token)
        {
            return 'tampered';
        }

        try {
            $payload = $this->verifyAndDecode($license->license_token);

            if ($payload->installation_id !== $license->installation_id)
            {
                return 'tampered';
            }
            if (Carbon::parse($payload->expires_at)->timestamp !== $license->expires_at->timestamp)
            {
                return 'tampered';
            }

            if (Carbon::parse($payload->expires_at)->isPast())
            {
                $license->update(['status' => 'license_expired']);
                return 'license_expired';
            }

            return 'licensed';

        }
        catch (Exception $e)
        {
            Log::error('اعتبارسنجی لایسنس ناموفق: ' . $e->getMessage());
            return 'tampered';
        }
    }

    /**
     * اعتبارسنجی امضای توکن با کلید عمومی
     * @return stdClass (Payload)
     * @throws Exception
     */
    public function verifyAndDecode(string $token): stdClass
    {
        if (!File::exists($this->publicKeyPath))
        {
            Log::critical('کلید عمومی لایسنس یافت نشد: ' . $this->publicKeyPath);
            throw new Exception('کلید عمومی لایسنس یافت نشد.');
        }

        $parts = explode('.', $token);
        if (count($parts) !== 2)
        {
            throw new Exception('ساختار توکن لایسنس نامعتبر است.');
        }

        $payloadBase64 = $parts[0];
        $signatureBase64 = $parts[1];

        $payload = base64_decode($payloadBase64);
        $signature = base64_decode($signatureBase64);

        $publicKey = openssl_pkey_get_public(File::get($this->publicKeyPath));

        $isVerified = openssl_verify($payload, $signature, $publicKey, OPENSSL_ALGO_SHA256);

        if ($isVerified === 1)
        {
            return json_decode($payload);
        }

        throw new Exception('امضای لایسنس نامعتبر است (دستکاری شده).');
    }
}