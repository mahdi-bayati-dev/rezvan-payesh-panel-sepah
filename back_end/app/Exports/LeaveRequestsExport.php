<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Morilog\Jalali\Jalalian;

class LeaveRequestsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function query()
    {
        return $this->query;
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->employee->personnel_code ?? '---',
            $row->employee->first_name . ' ' . $row->employee->last_name,
            $row->leaveType->title ?? '---',

            $row->start_time ? Jalalian::fromCarbon($row->start_time)->format('Y/m/d H:i:s') : '---',
            $row->end_time ? Jalalian::fromCarbon($row->end_time)->format('Y/m/d H:i:s') : '---',
            $this->getStatusText($row->status),
            $row->reason,
            $row->rejection_reason,
            $row->processor ? ($row->processor->name ?? $row->processor->username) : '---',
            $row->created_at ? Jalalian::fromCarbon($row->created_at)->format('Y/m/d H:i:s') : '---',
        ];
    }

    public function headings(): array
    {
        return [
            'شناسه',
            'کد پرسنلی',
            'نام کارمند',
            'نوع مرخصی',
            'زمان شروع',
            'زمان پایان',
            'وضعیت',
            'توضیحات درخواست',
            'دلیل رد',
            'پردازش شده توسط',
            'تاریخ ثبت',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    private function getStatusText($status): string
    {
        return match ($status) {
            'approved' => 'تایید شده',
            'rejected' => 'رد شده',
            'pending' => 'در انتظار',
            default => $status,
        };
    }
}