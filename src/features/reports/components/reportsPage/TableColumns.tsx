// این فایل ستون‌های جدول گزارش را تعریف می‌کند
import { type ColumnDef } from '@tanstack/react-table';
import { type ActivityLog } from '@/features/reports/types/index';
import { ActionsMenuCell } from '@/features/reports/components/reportsPage/ActionsMenuCell';

import Badge, { type BadgeVariant } from '@/components/ui/Badge';


// مپ کردن نوع فعالیت به نوع ظاهری Badge
const activityVariantMap: Record<ActivityLog['activityType'], BadgeVariant> = {
  entry: 'success',
  exit: 'info',
  delay: 'danger',
  haste: 'warning',
};

// مپ کردن نوع فعالیت به لیبل فارسی
const activityLabelMap: Record<ActivityLog['activityType'], string> = {
  entry: 'ورود',
  exit: 'خروج',
  delay: 'تاخیر',
  haste: 'تعجیل',
};

export const columns: ColumnDef<ActivityLog>[] = [
  // ستون مشخصات کارمند
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      const { name, employeeId, avatarUrl } = row.original.employee;
      return (
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={avatarUrl || 'https://placehold.co/40x40/E2E8F0/64748B?text=??'}
            alt={name}
            // فال‌بک برای زمانی که تصویر لود نشود
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/40x40/E2E8F0/64748B?text=??';
            }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foregroundL dark:text-foregroundD">
              {name}
            </span>
            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">
              {employeeId}
            </span>
          </div>
        </div>
      );
    },
  },
  // ستون نوع فعالیت
  {
    accessorKey: 'activityType',
    header: 'فعالیت',
    cell: ({ row }) => {
      const type = row.original.activityType;
      return (
        <Badge
          label={activityLabelMap[type]}
          variant={activityVariantMap[type]}
        />
      );
    },
  },
  // ستون ناحیه تردد
  {
    accessorKey: 'trafficArea',
    header: 'ناحیه تردد',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.trafficArea}</span>
    ),
  },
  // ستون تاریخ
  {
    accessorKey: 'date',
    header: 'تاریخ',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.date}</span>
    ),
  },
  // ستون ساعت
  {
    accessorKey: 'time',
    header: 'ساعت',
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.time}</span>
    ),
  },
  // ستون عملیات (Dropdown)
  {
    id: 'actions',
    header: '',
    // ۲. ساده‌سازی کامل سلول
    // دیگر نیازی به پارامتر 'table' نیست
    cell: ({ row }) => {
      // ۳. رندر مستقیم کامپوننت و پاس دادن داده ردیف
      return <ActionsMenuCell log={row.original} />;
    },
  },
];


