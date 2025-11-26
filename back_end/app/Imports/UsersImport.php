<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;
use Morilog\Jalali\Jalalian;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Throwable;
use Maatwebsite\Excel\Validators\Failure;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;

class UsersImport  implements OnEachRow,
    WithHeadingRow,
    WithValidation,
    ShouldQueue,
    WithChunkReading,
    SkipsOnFailure,
    SkipsOnError
{


    // متد سازنده برای دریافت تنظیمات از کنترلر
    public function __construct(protected array $settings){}

    public function chunkSize(): int
    {
        return 100; // هر بار ۱۰۰ یوزر را پردازش کن
    }
    public function onRow(Row $row): void
    {
        $rowRaw = $row->toArray();
        try {
            DB::transaction(function () use ($rowRaw) {
                $password = null;
                if ($this->settings["default_password"]) {
                    $password = Hash::make($rowRaw["nationality_code"]);
                } elseif (isset($rowRaw["password"])) {
                    $password = Hash::make($rowRaw["password"]);
                } else {
                    Log::warning("Import Skipped: Password could not be generated for row.", ['row' => $rowRaw]);
                    return false;
                }
                $user = User::create([
                    'user_name' => $rowRaw['user_name'] ?? $rowRaw["personnel_code"],
                    'email' => $rowRaw['email'],
                    'status' => 'active',
                    'password' => $password,
                ]);

                $orgId = !empty($rowRaw['organization_id']) ? $rowRaw['organization_id'] : $this->settings['organization_id'];
                $workGroupId = !empty($rowRaw['work_group_id']) ? $rowRaw['work_group_id'] : $this->settings['work_group_id'];
                $shiftScheduleId = !empty($rowRaw['shift_schedule_id']) ? $rowRaw['shift_schedule_id'] : ($this->settings['shift_schedule_id'] ?? null);

                Employee::create([
                    'user_id' => $user->id,
                    'first_name' => $rowRaw['first_name'],
                    'last_name' => $rowRaw['last_name'],
                    'personnel_code' => $rowRaw['personnel_code'],
                    'organization_id' => $orgId,
                    'work_group_id' => $workGroupId,
                    'shift_schedule_id' => $shiftScheduleId,
                    'nationality_code' => $rowRaw['nationality_code'] ?? null,
                    'phone_number' => $rowRaw['phone_number'] ?? null,
                    'gender' => $this->normalizeGender($rowRaw['gender'] ?? 'male'),
                    'is_married' => $this->transformBoolean($rowRaw['is_married'] ?? 0),
                    'birth_date' => $this->transformDate($rowRaw['birth_date']),
                    'starting_job' => $this->transformDate($rowRaw['starting_job'] ?? now()),
                    'position' => $rowRaw['position'] ?? 'کارمند',
                    'address' => $rowRaw['address'] ?? '-',
                    'house_number' => $rowRaw['house_number'] ?? '-',
                    'sos_number' => $rowRaw['sos_number'] ?? '-',
                ]);
                $user->assignRole("user");
            });


        } catch (\Exception $e) {
            Log::error("Import Row Transaction Failed", [
                'error' => $e->getMessage(),
                'row_data' => $rowRaw
            ]);
        } catch (Throwable $e) {
            Log::error("Import Row Transaction Failed", [
                'error' => $e->getMessage(),
                'row_data' => $rowRaw
            ]);
        }
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            Log::warning("Import Validation Failed", [
                'row_number' => $failure->row(),
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
            // --- User Validation ---
            'user_name' => ['nullable', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users,email'],

            'password'  => ['nullable', 'min:8'],

            // --- Employee Validation ---
            'first_name'     => ['required'],
            'last_name'      => ['required'],
            'personnel_code' => ['required'],

            'organization_id'   => ['nullable'],
            'work_group_id'     => ['nullable'],
            'shift_schedule_id' => ['nullable'],

            'phone_number'     => ['nullable'],
            'nationality_code' => ['required'],
            'gender'           => ['nullable'],
            'birth_date'       => ['nullable'],
        ];
    }

    /**
     * تبدیل تاریخ‌های اکسل (که ممکن است عدد یا رشته باشند) به فرمت Y-m-d
     */
    private function transformDate($value)
    {
        if (!$value) return null;

        $value = $this->convertPersianToEnglishNumbers($value);

        try {

            if (is_numeric($value))
            {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }

            if (preg_match('/^(13|14)[0-9]{2}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2}$/', $value))
            {
                $cleanDate = str_replace('-', '/', $value);

                return Jalalian::fromFormat('Y/m/d', $cleanDate)->toCarbon()->format('Y-m-d');
            }

            return Carbon::parse($value)->format('Y-m-d');

        }
        catch (\Exception $e)
        {
            return null;
        }
    }

    /**
     * تبدیل اعداد فارسی و عربی به انگلیسی
     */
    private function convertPersianToEnglishNumbers($string)
    {
        if (!is_string($string)) return $string;

        $persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        $english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $string = str_replace($persian, $english, $string);
        return str_replace($arabic, $english, $string);
    }


    /**
     * تبدیل مقادیر مختلف (بله/خیر/Yes/1) به Boolean
     */
    private function transformBoolean($value)
    {
        $trueValues = [1, '1', 'true', 'True', 'TRUE', 'yes', 'Yes', 'بله', 'متاهل'];
        return in_array($value, $trueValues, true);
    }

    /**
     * استانداردسازی جنسیت (چون ممکن است در اکسل فارسی بنویسند "مرد/زن")
     */
    private function normalizeGender($value): string
    {
        if (in_array($value, ['female', 'زن', 'خانم', 'f']))
        {
            return 'female';
        }
        return 'male';
    }
}