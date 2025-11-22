import { type ColumnDef } from '@tanstack/react-table';
import { type ActivityLog } from '@/features/reports/types/index';
import { ActionsMenuCell } from '@/features/reports/components/reportsPage/ActionsMenuCell';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { toPersianNumbers } from '@/features/reports/utils/toPersianNumbers';
import { Clock, AlertCircle, CheckCircle2, Hourglass } from 'lucide-react';

// ✅ ایمپورت کامپوننت آواتار جدید
import { Avatar } from '@/components/ui/Avatar';

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

interface CreateColumnsProps {
  onEdit: (log: ActivityLog) => void;
  onApprove: (log: ActivityLog) => void;
}

export const createColumns = ({ onEdit, onApprove }: CreateColumnsProps): ColumnDef<ActivityLog>[] => [
  // 1. مشخصات (بهینه‌سازی شده با Avatar Component)
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      const { name, employeeId, avatarUrl } = row.original.employee;
      return (
        <div className="flex items-center gap-3">
          {/* استفاده از کامپوننت جدید برای هندل کردن مسیرهای نسبی و ارورها */}
          <Avatar 
            src={avatarUrl} 
            alt={name}
            className="h-10 w-10 rounded-full border border-borderL dark:border-borderD"
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

  // 2. فعالیت
  {
    accessorKey: 'activityType',
    header: 'فعالیت',
    cell: ({ row }) => {
      const type = row.original.activityType;
      return (
        <Badge
          label={activityLabelMap[type] || type}
          variant={activityVariantMap[type] || 'secondary'}
        />
      );
    },
  },

  // 3. منبع
  {
    accessorKey: 'trafficArea',
    header: 'منبع',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
        {row.original.trafficArea}
      </span>
    ),
  },

  // 4. تاریخ
  {
    accessorKey: 'date',
    header: 'تاریخ',
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.date}</span>
    )
  },

  // 5. ساعت
  {
    accessorKey: 'time',
    header: 'ساعت',
    cell: ({ row }) => (
      <span className="text-sm font-medium dir-ltr block text-right">
        {row.original.time}
      </span>
    )
  },

  // 6. وضعیت مغایرت
  {
    id: 'status',
    header: 'وضعیت مغایرت',
    cell: ({ row }) => {
      const { is_allowed, lateness_minutes, early_departure_minutes } = row.original;
      const hasException = lateness_minutes > 0 || early_departure_minutes > 0;

      if (!hasException) {
         return <span className="text-muted-foregroundL/30 text-xs">---</span>;
      }

      return (
        <div className="flex flex-col gap-1.5 items-start min-w-[100px]">
          {lateness_minutes > 0 && (
            <div className="flex items-center gap-1 text-destructiveL dark:text-destructiveD px-1">
              <Clock className="w-3 h-3" />
              <span className="text-[11px] font-medium">{toPersianNumbers(lateness_minutes)} دقیقه تاخیر</span>
            </div>
          )}

          {early_departure_minutes > 0 && (
            <div className="flex items-center gap-1 text-warningL dark:text-warningD px-1">
              <AlertCircle className="w-3 h-3" />
              <span className="text-[11px] font-medium">{toPersianNumbers(early_departure_minutes)} دقیقه تعجیل</span>
            </div>
          )}

          {is_allowed ? (
            <div className="flex items-center gap-1 text-[10px] font-medium text-successL dark:text-successD bg-successL/10 dark:bg-successD/10 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              <span>تایید شده</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-muted-foregroundL dark:text-muted-foregroundD bg-secondaryL dark:bg-secondaryD px-1.5 py-0.5 rounded">
              <Hourglass className="w-3 h-3" />
              <span>در انتظار تایید</span>
            </div>
          )}
        </div>
      );
    },
  },

  // 7. عملیات
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return (
        <ActionsMenuCell
          log={row.original}
          onEdit={onEdit}
          onApprove={onApprove}
        />
      );
    },
  },
];

export const columns = createColumns;