<?php

namespace App\Exports;

use App\Models\LeaveRequest;
use App\Models\Organization;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Morilog\Jalali\Jalalian;

class LeaveRequestsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    /**
     * @param User $user کاربر درخواست دهنده برای بررسی دسترسی‌ها
     * @param array $filters فیلترهای اعمال شده روی گزارش
     */
    public function __construct(protected User $user, protected array $filters)
    {
    }

    public function query()
    {
        $query = LeaveRequest::with(['employee.organization', 'leaveType', 'processor']);
        $currentUserEmployee = $this->user->employee;
        $adminOrg = $currentUserEmployee?->organization;

        if (!$adminOrg && ($this->user->hasRole('org-admin-l2') || $this->user->hasRole('org-admin-l3')))
        {
            $query->whereRaw('1 = 0');
        }
        elseif ($this->user->hasRole('org-admin-l2'))
        {
            $allowedOrgIds = $adminOrg->descendantsAndSelf()->pluck('id');
            $query->whereHas('employee', function ($q) use ($allowedOrgIds) {
                $q->whereIn('organization_id', $allowedOrgIds);
            });
        }
        elseif ($this->user->hasRole('org-admin-l3'))
        {
            $query->whereHas('employee', function ($q) use ($adminOrg) {
                $q->where('organization_id', $adminOrg->id);
            });
        }

        if (isset($this->filters['organization_id']))
        {
            $targetOrg = Organization::find($this->filters['organization_id']);
            if ($targetOrg)
            {
                $orgIds = $targetOrg->descendantsAndSelf()->pluck('id');
                $query->whereHas('employee', fn($q) => $q->whereIn('organization_id', $orgIds));
            }
        }

        if (isset($this->filters['search']))
        {
            $searchTerm = $this->filters['search'];
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('personnel_code', 'like', "%{$searchTerm}%");
            });
        }

        if (isset($this->filters['from_date']))
        {
            $query->whereDate('start_time', '>=', $this->filters['from_date']);
        }
        if (isset($this->filters['to_date']))
        {
            $query->whereDate('end_time', '<=', $this->filters['to_date']);
        }
        if (isset($this->filters['status']))
        {
            $query->where('status', $this->filters['status']);
        }
        if (isset($this->filters['leave_type_id']))
        {
            $query->where('leave_type_id', $this->filters['leave_type_id']);
        }

        return $query->latest();
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

    protected function getStatusText($status)
    {
        return match ($status) {
            'pending' => 'در انتظار بررسی',
            'approved' => 'تایید شده',
            'rejected' => 'رد شده',
            default => $status,
        };
    }
}