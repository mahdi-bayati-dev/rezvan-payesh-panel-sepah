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

    public function chunkSize(): int
    {
        return 100;
    }

    public function onRow(Row $row)
    {
        $rowRaw = $row->toArray();

        try {
            DB::transaction(function () use ($rowRaw) {

                // --- پیش‌پردازش داده‌های حیاتی ---

                // 1. نرمال‌سازی کد ملی و کد پرسنلی (تبدیل اعداد فارسی به انگلیسی)
                $nationalCode = isset($rowRaw['nationality_code']) ? $this->convertPersianToEnglishNumbers($rowRaw['nationality_code']) : null;
                $personnelCode = isset($rowRaw['personnel_code']) ? $this->convertPersianToEnglishNumbers($rowRaw['personnel_code']) : null;

                // 2. منطق ساخت پسورد
                $password = null;
                if($this->settings["default_password"]) {
                    // اولویت با کد ملی، بعد پرسنلی
                    $passSource = $nationalCode ?: $personnelCode;
                    if($passSource) {
                        $password = Hash::make($passSource);
                    }
                } elseif(!empty($rowRaw["password"])) {
                    $password = Hash::make($rowRaw["password"]);
                }

                if(!$password) {
                    throw new \Exception("پسورد ساخته نشد (کد ملی/پرسنلی یا ستون پسورد خالی است).");
                }

                // 3. ایجاد کاربر
                // اگر یوزرنیم خالی بود، از کد پرسنلی یا کد ملی استفاده کن
                $userName = !empty($rowRaw['user_name']) ? $rowRaw['user_name'] : ($personnelCode ?: $nationalCode);

                $user = User::create([
                    'user_name' => $userName,
                    'email'     => $rowRaw['email'],
                    'status'    => 'active',
                    'password'  => $password,
                ]);

                // 4. تنظیمات سازمانی
                $orgId = !empty($rowRaw['organization_id']) ? $rowRaw['organization_id'] : $this->settings['organization_id'];
                $workGroupId = !empty($rowRaw['work_group_id']) ? $rowRaw['work_group_id'] : $this->settings['work_group_id'];
                $shiftScheduleId = !empty($rowRaw['shift_schedule_id']) ? $rowRaw['shift_schedule_id'] : ($this->settings['shift_schedule_id'] ?? null);

                // 5. ایجاد کارمند (با تضمین پر بودن فیلدهای اجباری)
                Employee::create([
                    'user_id'           => $user->id,
                    'first_name'        => $rowRaw['first_name'],
                    'last_name'         => $rowRaw['last_name'],
                    'personnel_code'    => $personnelCode,
                    'organization_id'   => $orgId,
                    'work_group_id'     => $workGroupId,
                    'shift_schedule_id' => $shiftScheduleId,

                    // فیلدهای اختیاری در فرم، ولی اجباری در دیتابیس (جایگزینی با خط تیره)
                    'father_name'       => !empty($rowRaw['father_name']) ? $rowRaw['father_name'] : '-',
                    'address'           => !empty($rowRaw['address']) ? $rowRaw['address'] : '-',
                    'house_number'      => !empty($rowRaw['house_number']) ? $rowRaw['house_number'] : '-',
                    'sos_number'        => !empty($rowRaw['sos_number']) ? $rowRaw['sos_number'] : '-',
                    'position'          => !empty($rowRaw['position']) ? $rowRaw['position'] : 'کارمند',

                    // فیلدهای خاص
                    'nationality_code'  => $nationalCode, // می‌تواند نال باشد (اگر دیتابیس اجازه دهد)
                    'phone_number'      => !empty($rowRaw['phone_number']) ? $this->convertPersianToEnglishNumbers($rowRaw['phone_number']) : null,

                    'gender'            => $this->normalizeGender($rowRaw['gender'] ?? 'male'),
                    'is_married'        => $this->transformBoolean($rowRaw['is_married'] ?? 0),
                    'education_level'   => !empty($rowRaw['education_level']) ? $rowRaw['education_level'] : 'diploma',

                    // تاریخ‌ها (اگر خالی بودند، تاریخ امروز یا null)
                    // نکته: اگر دیتابیس نال نمی‌پذیرد، باید now() بگذارید
                    'birth_date'        => $this->transformDate($rowRaw['birth_date']) ?: '1990-01-01', // تاریخ تولد پیش‌فرض
                    'starting_job'      => $this->transformDate($rowRaw['starting_job']) ?: now()->format('Y-m-d'), // شروع کار پیش‌فرض
                ]);

                $user->assignRole("user");
            });

        } catch (\Exception $e) {
            Log::error("Import Row Failed", [
                'row_index' => $row->getIndex(),
                'error' => $e->getMessage(),
                'data' => $rowRaw
            ]);
        }
    }

    // --- هندل کردن خطاهای ولیدیشن ---
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

    public function onError(Throwable $e)
    {
        Log::error("Import General Error: " . $e->getMessage());
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            // اینجا سخت‌گیری نمی‌کنیم تا لاجیک داخل onRow مدیریت کند
        ];
    }

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
        return in_array($value, [1, '1', 'true', 'yes', 'بله', 'متاهل'], true);
    }

    private function normalizeGender($value) {
        return in_array($value, ['female', 'زن', 'خانم']) ? 'female' : 'male';
    }
}