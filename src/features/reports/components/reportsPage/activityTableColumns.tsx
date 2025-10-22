// این فایل ستون‌های جدول گزارش را تعریف می‌کند
// این کامپوننت مستقیماً از کامپوننت‌های ماژولار Badge و Dropdown شما استفاده می‌کند

import { type ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { type ActivityLog } from '@/features/reports/types/index';
// ایمپورت کامپوننت‌های ماژولار شما از پوشه ui
// مسیر ایمپورت را بر اساس ساختار واقعی پروژه خود تنظیم کنید
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '@/components/ui/Dropdown';

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
    cell: ({ row }) => {
      // در اینجا می‌توانید منطق ویرایش و حذف را پیاده‌سازی کنید
      const handleEdit = () => {
        console.log('Edit row:', row.original);
      };
      const handleDelete = () => {
        console.log('Delete row:', row.original);
      };

      return (
        <div className="text-left">
          <Dropdown>
            <DropdownTrigger>
              <button
                type="button"
                className="p-2 rounded-md hover:bg-secondaryL dark:hover:bg-secondaryD
                           text-muted-foregroundL dark:text-muted-foregroundD transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem onClick={handleEdit} icon={<Edit className="w-4 h-4" />}>
                ویرایش
              </DropdownItem>
              <DropdownItem
                onClick={handleDelete}
                icon={<Trash2 className="w-4 h-4" />}
                className="text-destructiveL dark:text-destructiveD"
              >
                حذف
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      );
    },
  },
];

