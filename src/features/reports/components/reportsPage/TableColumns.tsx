import { type ColumnDef } from '@tanstack/react-table';
import { type ActivityLog } from "@/features/reports/types/index";
import { ActionsMenuCell } from './ActionsMenuCell';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { toPersianNumbers } from '../../utils/toPersianNumbers';
import {
  Clock,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  User
} from 'lucide-react';
import { getFullImageUrl } from '../../../User/utils/imageHelper';

// ✅ تابع هوشمند تبدیل دقیقه به فرمت خوانا
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${toPersianNumbers(minutes)} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${toPersianNumbers(hours)} ساعت`;
  }

  return `${toPersianNumbers(hours)} ساعت و ${toPersianNumbers(remainingMinutes)} دقیقه`;
};

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
  {
    accessorKey: 'employee',
    header: 'مشخصات',
    cell: ({ row }) => {
      const { name, employeeId, avatarUrl } = row.original.employee;
      const fullAvatarUrl = getFullImageUrl(avatarUrl);

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            {fullAvatarUrl ? (
              <img
                src={fullAvatarUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover border border-borderL dark:border-borderD shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-secondaryL', 'dark:bg-secondaryD', 'flex', 'items-center', 'justify-center');
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg class="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                  e.currentTarget.parentElement?.appendChild(icon.firstChild!);
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-secondaryL dark:bg-secondaryD flex items-center justify-center border border-borderL dark:border-borderD shadow-sm">
                <User className="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foregroundL dark:text-foregroundD truncate">
              {name}
            </span>
            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD truncate dir-ltr text-right opacity-80">
              {employeeId}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'activityType',
    header: 'نوع فعالیت',
    cell: ({ row }) => {
      const type = row.original.activityType;
      return (
        <Badge
          label={activityLabelMap[type] || type}
          variant={activityVariantMap[type] || 'secondary'}
          className="shadow-sm"
        />
      );
    },
  },
  {
    accessorKey: 'trafficArea',
    header: 'منبع',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD truncate max-w-[120px] inline-block" title={row.original.trafficArea}>
        {row.original.trafficArea}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'زمان ثبت',
    cell: ({ row }) => (
      <div className="flex flex-col items-start justify-center">
        <span className="text-sm font-medium text-foregroundL dark:text-foregroundD dir-ltr">
          {row.original.date}
        </span>
        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD dir-ltr ">
          {row.original.time}
        </span>
      </div>
    )
  },
  {
    id: 'status',
    header: 'وضعیت تردد',
    cell: ({ row }) => {
      const { is_allowed, lateness_minutes, early_departure_minutes } = row.original;

      const hasException = lateness_minutes > 0 || early_departure_minutes > 0;

      // 🟢 حالت ۱: تایید شده
      if (is_allowed) {
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20 px-2 py-1 rounded-md w-fit border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-xs font-bold">تایید شده</span>
            </div>
            {/* اگر مغایرت داشته، با فرمت ساعت و دقیقه نمایش می‌دهیم */}
            {hasException && (
              <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD opacity-70 pr-1">
                (شامل {lateness_minutes > 0 ? `${formatDuration(lateness_minutes)} تاخیر` : `${formatDuration(early_departure_minutes)} تعجیل`})
              </span>
            )}
          </div>
        );
      }

      // 🔴 حالت ۲: تایید نشده + دارای مغایرت
      if (hasException) {
        return (
          <div className="flex flex-col gap-1.5 items-start">
            {lateness_minutes > 0 && (
              <div className="flex items-center gap-1.5 text-destructiveL dark:text-destructiveD bg-destructiveL/5 dark:bg-destructiveD/10 px-2 py-0.5 rounded border border-destructiveL/10">
                <Clock className="w-3.5 h-3.5" />
                {/* نمایش به صورت ساعت و دقیقه */}
                <span className="text-xs font-medium">{formatDuration(lateness_minutes)} تاخیر</span>
              </div>
            )}

            {early_departure_minutes > 0 && (
              <div className="flex items-center gap-1.5 text-warningL dark:text-warningD bg-warningL/5 dark:bg-warningD/10 px-2 py-0.5 rounded border border-warningL/10">
                <AlertCircle className="w-3.5 h-3.5" />
                {/* نمایش به صورت ساعت و دقیقه */}
                <span className="text-xs font-medium">{formatDuration(early_departure_minutes)} تعجیل</span>
              </div>
            )}

            <span className="text-[10px] text-destructiveL/80 dark:text-destructiveD/80 pr-1 animate-pulse font-medium">
              نیازمند بررسی
            </span>
          </div>
        );
      }

      // ⚪ حالت ۳: عادی
      return (
        <div className="flex items-center gap-1.5 text-muted-foregroundL dark:text-muted-foregroundD opacity-70 bg-secondaryL/50 dark:bg-secondaryD/50 px-2 py-1 rounded w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs">عادی</span>
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