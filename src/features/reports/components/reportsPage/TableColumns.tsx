import { type ColumnDef } from '@tanstack/react-table';
// اصلاح مسیر نسبی
import { type ActivityLog } from "@/features/reports/types/index"
import { ActionsMenuCell } from './ActionsMenuCell';
import Badge, { type BadgeVariant } from '../../../../components/ui/Badge';
import { toPersianNumbers } from '../../utils/toPersianNumbers';
import { Clock, AlertCircle, CheckCircle2, Hourglass, User } from 'lucide-react';
// ✅ مسیر نسبی دقیق به helper تصویر
import { getFullImageUrl } from '../../../User/utils/imageHelper';

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
  // 1. مشخصات (همراه با عکس)
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      const { name, employeeId, avatarUrl } = row.original.employee;

      // ✅ تبدیل آدرس ناقص به آدرس کامل سرور
      const fullAvatarUrl = getFullImageUrl(avatarUrl);

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            {fullAvatarUrl ? (
              <img
                src={fullAvatarUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover border border-borderL dark:border-borderD"
                onError={(e) => {
                  // هندل کردن خطای لود عکس
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-secondaryL', 'dark:bg-secondaryD', 'flex', 'items-center', 'justify-center');
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg class="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                  e.currentTarget.parentElement?.appendChild(icon.firstChild!);
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-secondaryL dark:bg-secondaryD flex items-center justify-center border border-borderL dark:border-borderD">
                <User className="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-foregroundL dark:text-foregroundD truncate">
              {name}
            </span>
            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD truncate font-mono">
              {toPersianNumbers(employeeId)}
            </span>
          </div>
        </div>
      );
    },
  },
  // ... (بقیه ستون‌ها بدون تغییر) ...
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
  {
    accessorKey: 'trafficArea',
    header: 'منبع',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD truncate max-w-[150px]">
        {row.original.trafficArea}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'تاریخ',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">{row.original.date}</span>
    )
  },
  {
    accessorKey: 'time',
    header: 'ساعت',
    cell: ({ row }) => (
      <span className="text-sm font-medium dir-ltr block text-right text-foregroundL dark:text-foregroundD">
        {row.original.time}
      </span>
    )
  },
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