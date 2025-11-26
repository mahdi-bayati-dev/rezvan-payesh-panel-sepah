<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\EmployeeImage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ProcessEmployeeImages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * تعداد تلاش‌های مجدد در صورت شکست
     */
    public $tries = 3;
    public $timeout = 120;
    /**
     * @param Employee $employee کارمند مربوطه
     * @param array $imagesData آرایه‌ای شامل آی‌دی و مسیر فایل اصلی تصاویر جدید
     * @param string $action نوع عملیات (create یا update) برای API هوش مصنوعی
     */
    public function __construct(
        protected Employee $employee,
        protected array $imagesData,
        protected string $action = 'create'
    ) {}

    /**
     * اجرای جاب
     */
    public function handle(): void
    {
        $aiOriginalPaths = [];
        $manager = new ImageManager(new Driver());

        foreach ($this->imagesData as $imageData)
        {
            $id = $imageData['id'];
            $originalPath = $imageData['original_path'];

            $aiOriginalPaths[] = $originalPath;

            try
            {
                if (!Storage::disk('public')->exists($originalPath))
                {
                    Log::warning("Original image not found for processing: {$originalPath}");
                    continue;
                }

                $fileContent = Storage::disk('public')->get($originalPath);
                $image = $manager->read($fileContent);

                if ($image->width() > 2000)
                {
                    $image->scale(width: 2000);
                }

                $encoded = $image->toWebp(quality: 80);

                $pathInfo = pathinfo($originalPath);
                $dirname = $pathInfo['dirname'];
                $filename = $pathInfo['filename'];
                $webpPath = $dirname . '/' . $filename  . '.webp';

                Storage::disk('public')->put($webpPath, (string) $encoded);

                EmployeeImage::where('id', $id)->update([
                    'webp_path' => $webpPath,
                    'mime_type' => 'image/webp',
                    'size' => strlen((string) $encoded),
                ]);

                Log::info("Image processed and converted to WebP: {$webpPath}");

            }
            catch (\Exception $e)
            {
                Log::error("Error processing image ID {$id}: " . $e->getMessage());
            }
        }

        if (!empty($aiOriginalPaths))
        {
            $this->syncWithAi($aiOriginalPaths);
        }
    }

    /**
     * سینک کردن تصاویر با سرویس AI
     */
    protected function syncWithAi(array $imagePaths): void
    {
        try {
            $url = 'http://192.168.1.50/v1/user';
            $payload = [
                'personnel_code' => $this->employee->personnel_code,
                'gender' => $this->employee->gender,
                'images' => $imagePaths,
            ];

            $response = match ($this->action) {
                'update' => Http::put($url, $payload),
                default => Http::post($url, $payload),
            };

            if ($response->failed()) {
                Log::error("AI Service Sync Failed ({$this->action}). Status: " . $response->status() . " Body: " . $response->body());
                // throw new \Exception("AI Service connection failed");
            }
            else
            {
                Log::info("AI Service Synced Successfully ({$this->action}) for user: " . $this->employee->personnel_code);
            }

        }
        catch (\Exception $e)
        {
            Log::error("Exception calling AI service: " . $e->getMessage());
        }
    }
}