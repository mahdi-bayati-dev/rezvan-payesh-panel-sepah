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

class UsersImport implements OnEachRow, WithHeadingRow, WithValidation
{


    // متد سازنده برای دریافت تنظیمات از کنترلر
    public function __construct(protected array $settings){}

    public function onRow(Row $row)
    {
        $row = $row->toArray();

        $status = DB::transaction(function () use ($row)
        {

            if($this->settings["default_password"])
            {
                $password = Hash::make($row["nationality_code"]);
            }
            elseif(isset($row["password"]))
            {
                $password = Hash::make($row["password"]);
            }
            else
            {
                Log::warning("Import Skipped: Password could not be generated for row.", ['row' => $row]);
                return false;
            }

            $user = User::create([
                'user_name' => $row['user_name']?? $row["personnel_code"],
                'email'     => $row['email'],
                'status'    => 'active',
                'password'  => $password,
            ]);

            // تعیین سازمان: اولویت با اکسل، اگر نبود تنظیمات کلی
            $orgId = !empty($row['organization_id']) ? $row['organization_id'] : $this->settings['organization_id'];

            // تعیین گروه کاری
            $workGroupId = !empty($row['work_group_id']) ? $row['work_group_id'] : $this->settings['work_group_id'];

            Employee::create([
                'user_id'           => $user->id,
                'first_name'        => $row['first_name'],
                'last_name'         => $row['last_name'],
                'personnel_code'    => $row['personnel_code'],

                // استفاده از مقادیر ترکیبی (Excel || Global Setting)
                'organization_id'   => $orgId,
                'work_group_id'     => $workGroupId,
                'shift_schedule_id' => $this->settings['shift_schedule_id'] ?? null,

                // سایر فیلدها
                'nationality_code'  => $row['nationality_code'] ?? null,
                'phone_number'      => $row['phone_number'] ?? null,
                'gender'            => $this->normalizeGender($row['gender']),
                'is_married'        => $this->transformBoolean($row['is_married'] ?? 0),
                'birth_date'        => $this->transformDate($row['birth_date']),
                'starting_job'      => $this->transformDate($row['starting_job'] ?? now()),
                'position'          => $row['position'] ?? 'کارمند',
                'address'           => $row['address'] ?? '-',
                'house_number'      => $row['house_number'] ?? '-',
                'sos_number'        => $row['sos_number'] ?? '-',
            ]);
            $user->assignRole("user");
            return true;
        });
        if(!$status)
        {
            Log::error("Failed to import users on row : \n\t ".json_encode($row));
        }
    }

   public function rules(): array
    {
        return [
            // --- User Validation ---
            'user_name' => ['nullable', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users,email'],

            'password'  => ['nullable', 'min:8'],

            // --- Employee Validation ---
            'first_name'     => ['required', 'string', 'max:255'],
            'last_name'      => ['required', 'string', 'max:255'],
            'personnel_code' => ['required', 'string', 'max:50', 'unique:employees,personnel_code'],

            'organization_id'   => ['nullable', 'integer', 'exists:organizations,id'],
            'work_group_id'     => ['nullable', 'integer', 'exists:work_groups,id'],
            'shift_schedule_id' => ['nullable', 'integer', 'exists:shift_schedules,id'],

            'phone_number'     => ['nullable', 'string', 'max:20', 'unique:employees,phone_number'],
            'nationality_code' => ['required', 'string', 'max:20', 'unique:employees,nationality_code'],
            'gender'           => ['nullable', 'string'],
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