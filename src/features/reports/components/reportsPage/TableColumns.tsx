import { type ColumnDef } from '@tanstack/react-table';
// استفاده از Alias برای جلوگیری از خطای مسیر
import { type ActivityLog } from '@/features/reports/types/index';
import { ActionsMenuCell } from '@/features/reports/components/reportsPage/ActionsMenuCell';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { toPersianNumbers } from '@/features/reports/utils/toPersianNumbers';
// آیکون‌های وضعیت
import { Clock, AlertCircle, CheckCircle2, Hourglass } from 'lucide-react';

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

interface CreateColumnsProps {
  onEdit: (log: ActivityLog) => void;
  onApprove: (log: ActivityLog) => void;
}

export const createColumns = ({ onEdit, onApprove }: CreateColumnsProps): ColumnDef<ActivityLog>[] => [
  // 1. مشخصات (بدون تغییر)
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      const { name, employeeId, avatarUrl } = row.original.employee;
      return (
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover border border-borderL dark:border-borderD"
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

  // 2. فعالیت (بدون تغییر)
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

  // 3. منبع (بدون تغییر)
  {
    accessorKey: 'trafficArea',
    header: 'منبع',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
        {row.original.trafficArea}
      </span>
    ),
  },

  // 4. تاریخ (بدون تغییر)
  {
    accessorKey: 'date',
    header: 'تاریخ',
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.date}</span>
    )
  },

  // 5. ساعت (بدون تغییر)
  {
    accessorKey: 'time',
    header: 'ساعت',
    cell: ({ row }) => (
      <span className="text-sm font-medium dir-ltr block text-right">
        {row.original.time}
      </span>
    )
  },

  // ✅ 6. ستون وضعیت (اصلاح شده طبق درخواست جدید)
  {
    id: 'status',
    header: 'وضعیت مغایرت',
    cell: ({ row }) => {
      const { is_allowed, lateness_minutes, early_departure_minutes } = row.original;
      
      // شرط اصلی: آیا مغایرتی (تاخیر یا تعجیل) وجود دارد؟
      const hasException = lateness_minutes > 0 || early_departure_minutes > 0;

      // اگر مغایرتی نیست، فقط خط تیره نمایش بده (تمیز نگه داشتن جدول)
      if (!hasException) {
         return <span className="text-muted-foregroundL/30 text-xs">---</span>;
      }

      // اگر مغایرت هست، هم مقدارش رو نشون بده و هم وضعیت تایید رو
      return (
        <div className="flex flex-col gap-1.5 items-start min-w-[100px]">
          
          {/* ۱. نمایش خود مغایرت‌ها */}
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

          {/* ۲. نمایش وضعیت تایید (چون مغایرت وجود دارد، وضعیت تایید مهم است) */}
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