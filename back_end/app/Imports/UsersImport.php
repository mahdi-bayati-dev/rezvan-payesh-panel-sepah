<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Validators\Failure;
use Morilog\Jalali\Jalalian;
use Throwable;

class UsersImport implements
    OnEachRow,
    WithHeadingRow,
    WithValidation,
    ShouldQueue,
    WithChunkReading,
    SkipsOnFailure,
    SkipsOnError
{
    public function __construct(protected array $settings){}

    /**
     * تعداد سطرهایی که در هر جاب پردازش می‌شوند
     */
    public function chunkSize(): int
    {
        return 100;
    }

    public function onRow(Row $row)
    {
        $rowRaw = $row->toArray();

        // استفاده از try-catch برای مدیریت خطاهای منطقی
        try {
            DB::transaction(function () use ($rowRaw) {

                // 1. منطق تعیین پسورد
                $password = null;
                if($this->settings["default_password"]) {
                    // تلاش برای استفاده از کد ملی یا کد پرسنلی به عنوان پسورد
                    $passSource = $rowRaw["nationality_code"] ?? $rowRaw["personnel_code"];
                    if($passSource) {
                        $password = Hash::make($passSource);
                    }
                } elseif(isset($rowRaw["password"]) && !empty($rowRaw["password"])) {
                    $password = Hash::make($rowRaw["password"]);
                }

                // اگر پسورد ساخته نشد، خطا پرتاب کن تا در catch گرفته شود
                if(!$password) {
                    throw new \Exception("پسورد تعیین نشده است (کد ملی یا ستون پسورد خالی است).");
                }

                // 2. ایجاد کاربر
                // نام کاربری: اگر خالی بود -> کد پرسنلی -> اگر خالی بود -> کد ملی
                $userName = $rowRaw['user_name'] ?? ($rowRaw["personnel_code"] ?? $rowRaw["nationality_code"]);

                $user = User::create([
                    'user_name' => $userName,
                    'email'     => $rowRaw['email'],
                    'status'    => 'active',
                    'password'  => $password,
                ]);

                // تعیین تنظیمات (با اولویت مقادیر اکسل)
                $orgId = !empty($rowRaw['organization_id']) ? $rowRaw['organization_id'] : $this->settings['organization_id'];
                $workGroupId = !empty($rowRaw['work_group_id']) ? $rowRaw['work_group_id'] : $this->settings['work_group_id'];
                $shiftScheduleId = !empty($rowRaw['shift_schedule_id']) ? $rowRaw['shift_schedule_id'] : ($this->settings['shift_schedule_id'] ?? null);

                // 3. ایجاد کارمند
                Employee::create([
                    'user_id'           => $user->id,
                    'first_name'        => $rowRaw['first_name'],
                    'last_name'         => $rowRaw['last_name'],
                    'personnel_code'    => $rowRaw['personnel_code'],
                    'organization_id'   => $orgId,
                    'work_group_id'     => $workGroupId,
                    'shift_schedule_id' => $shiftScheduleId,

                    'nationality_code'  => $rowRaw['nationality_code'] ?? null,
                    'phone_number'      => $rowRaw['phone_number'] ?? null,
                    'gender'            => $this->normalizeGender($rowRaw['gender'] ?? 'male'),
                    'is_married'        => $this->transformBoolean($rowRaw['is_married'] ?? 0),
                    'birth_date'        => $this->transformDate($rowRaw['birth_date']),
                    'starting_job'      => $this->transformDate($rowRaw['starting_job'] ?? now()),
                    'position'          => $rowRaw['position'] ?? 'کارمند',
                    'address'           => $rowRaw['address'] ?? '-',
                    'house_number'      => $rowRaw['house_number'] ?? '-',
                    'sos_number'        => $rowRaw['sos_number'] ?? '-',
                ]);

                $user->assignRole("user");
            });

        } catch (\Exception $e) {
            // ثبت خطای دقیق در لاگ
            Log::error("Import Row Failed", [
                'row_index' => $row->getIndex(),
                'error' => $e->getMessage(),
                'data' => $rowRaw
            ]);
        }
    }

    // --- هندل کردن خطاهای ولیدیشن اکسل ---
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            Log::warning("Import Validation Error", [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
                'values' => $failure->values(),
            ]);
        }
    }

    // --- هندل کردن خطاهای کلی (مثل دیتابیس) ---
    public function onError(Throwable $e)
    {
        Log::error("Import General Error: " . $e->getMessage());
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            // سایر ولیدیشن‌ها را اینجا اضافه کنید
            // برای راحتی تست، فعلاً فقط ایمیل را اجباری گذاشتم تا ببینیم کار می‌کند یا نه
        ];
    }

    // متدهای کمکی (تاریخ و ...) بدون تغییر
    private function transformDate($value) {
        if (!$value) return null;
        $value = $this->convertPersianToEnglishNumbers($value);
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            if (preg_match('/^(13|14)[0-9]{2}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2}$/', $value)) {
                $cleanDate = str_replace('-', '/', $value);
                return Jalalian::fromFormat('Y/m/d', $cleanDate)->toCarbon()->format('Y-m-d');
            }
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) { return null; }
    }

    private function convertPersianToEnglishNumbers($string) {
        if (!is_string($string)) return $string;
        $persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return str_replace($persian, $english, $string);
    }

    private function transformBoolean($value) {
        return in_array($value, [1, '1', 'true', 'yes', 'بله'], true);
    }

    private function normalizeGender($value) {
        return in_array($value, ['female', 'زن', 'خانم']) ? 'female' : 'male';
    }
}