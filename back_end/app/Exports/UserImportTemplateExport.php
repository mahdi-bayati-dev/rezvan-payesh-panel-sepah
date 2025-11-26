<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UserImportTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    /**
     * داده‌های نمونه برای راهنمایی کاربر
     */
    public function array(): array
    {
        return [
            // نمونه ۱: داده‌های کامل انگلیسی
            [
                'ali_rezaei',           // user_name
                'ali.sample@example.com', // email
                'Password@123',         // password
                'Ali',                  // first_name
                'Rezaei',               // last_name
                '1001',                 // personnel_code
                '0012345678',           // nationality_code
                '09121234567',          // phone_number
                'male',                 // gender
                '1',                    // is_married (true)
                '1990-01-01',           // birth_date
                '2023-01-01',           // starting_job
                'Software Engineer',    // position
                'Hassan',               // father_name
                'Tehran, Street 1',     // address
                '12',                   // house_number
                '09129876543',          // sos_number
                'bachelor',             // education_level
                '1',                    // organization_id (Optional if set in form)
                '1',                    // work_group_id
                '1',                    // shift_schedule_id
                '',                     // week_pattern_id
            ],
            // نمونه ۲: داده‌های فارسی و شمسی (برای تست قابلیت‌های هوشمند سیستم)
            [
                '',                     // user_name (خالی: پر شدن خودکار با کد پرسنلی)
                'maryam.sample@example.com', // email
                '',                     // password (خالی: استفاده از کد ملی به عنوان رمز)
                'مریم',                 // first_name
                'احمدی',                // last_name
                '1002',                 // personnel_code
                '۰۱۲۳۴۵۶۷۸۹',           // nationality_code (اعداد فارسی)
                '۰۹۱۲۹۸۷۶۵۴۳',          // phone_number (اعداد فارسی)
                'زن',                   // gender (تشخیص خودکار)
                'بله',                  // is_married
                '1375/06/31',           // birth_date (تاریخ شمسی)
                '',                     // starting_job (خالی: تاریخ امروز)
                'مدیر منابع انسانی',    // position
                'رضا',                  // father_name
                'شیراز، خیابان آزادی',  // address
                '5',                    // house_number
                '',                     // sos_number
                'master',               // education_level
                '',                     // organization_id (استفاده از تنظیمات فرم)
                '',                     // work_group_id
                '',                     // shift_schedule_id
                '',                     // week_pattern_id
            ]
        ];
    }

    /**
     * نام ستون‌ها (Header)
     * دقیقاً باید با نام‌هایی که در UsersImport استفاده کردیم یکی باشد.
     */
    public function headings(): array
    {
        return [
            'user_name',
            'email',
            'password',
            'first_name',
            'last_name',
            'personnel_code',
            'nationality_code',
            'phone_number',
            'gender',
            'is_married',
            'birth_date',
            'starting_job',
            'position',
            'father_name',
            'address',
            'house_number',
            'sos_number',
            'education_level',
            'organization_id',
            'work_group_id',
            'shift_schedule_id',
            'week_pattern_id',
        ];
    }

    /**
     * استایل‌دهی به فایل اکسل (بولد کردن هدر)
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}