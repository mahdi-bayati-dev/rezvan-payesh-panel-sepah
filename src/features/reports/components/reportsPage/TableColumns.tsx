import { type ColumnDef } from '@tanstack/react-table';
import { type ActivityLog } from '@/features/reports/types/index';
import { ActionsMenuCell } from '@/features/reports/components/reportsPage/ActionsMenuCell';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';

// مپ کردن نوع فعالیت
const activityVariantMap: Record<ActivityLog['activityType'], BadgeVariant> = {
  entry: 'success',
  exit: 'info',
  delay: 'danger',
  haste: 'warning',
};

const activityLabelMap: Record<ActivityLog['activityType'], string> = {
  entry: 'ورود',
  exit: 'خروج',
  delay: 'تاخیر',
  haste: 'تعجیل',
};

// تعریف پراپ‌ها برای ستون‌ها
interface CreateColumnsProps {
  onEdit: (log: ActivityLog) => void;
  onApprove: (log: ActivityLog) => void;
}

// ستون‌ها اکنون به عنوان یک تابع سازنده اکسپورت می‌شوند
export const createColumns = ({ onEdit, onApprove }: CreateColumnsProps): ColumnDef<ActivityLog>[] => [
  // ستون مشخصات کارمند
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      // [رفع خطا ۳] - متغیر employeeApiId استفاده نشده بود و حذف شد
      const { name, employeeId, avatarUrl } = row.original.employee;
      return (
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={avatarUrl || './img/avatars/2.png'}
            alt={name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = './img/avatars/2.png';
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
      if (!activityLabelMap[type]) {
        return <Badge label={type} variant="success" />;
      }
      return (
        <Badge
          label={activityLabelMap[type]}
          variant={activityVariantMap[type]}
        />
      );
    },
  },

  {
    accessorKey: 'trafficArea', // (accessorKey همان قبلی ماندگار است چون تایپ ActivityLog را آپدیت کردیم)
    header: 'منبع / ناحیه', // لیبل هدر تغییر کرد
    cell: ({ row }) => (
      // این فیلد اکنون حاوی 'source_name' از API است
      <span className="text-sm">{row.original.trafficArea}</span>
    ),
  },

  // ستون تاریخ
  {
    accessorKey: 'date',
    header: 'تاریخ',
  },
  // ستون ساعت
  {
    accessorKey: 'time',
    header: 'ساعت',
  },

  // --- ستون عملیات (اصلاح شده) ---
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => { // <-- اصلاح شد
      return (
        <ActionsMenuCell
          log={row.original}
          // این هندلرها از 'reportPage.tsx' از طریق 'meta' جدول می‌آیند
          onEdit={onEdit}
          onApprove={onApprove}
        />
      );
    },
  },
];

// اکسپورت تابع سازنده ستون‌ها
export const columns = createColumns;