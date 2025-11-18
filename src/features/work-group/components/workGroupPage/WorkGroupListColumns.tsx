import { type ColumnDef } from "@tanstack/react-table";
import type { WorkGroup } from "@/features/work-group/types/index";

import { WorkGroupActionsCell } from "@/features/work-group/components/workGroupPage/WorkGroupActionsCell";

// تعریف ستون‌های جدول
export const columns: ColumnDef<WorkGroup>[] = [
    {
        accessorKey: "name",
        header: "نام گروه کاری",
    },
    {
        id: 'type',
        header: "الگو / برنامه شیفتی",
        cell: ({ row }) => {
            const group = row.original;
            
            // نمایش مبتنی بر الگوی کاری (Week Pattern)
            if (group.week_pattern) {
                return (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                            الگوی کاری
                        </span>
                        <span className="text-sm font-medium text-foregroundL dark:text-foregroundD mr-1">
                            {group.week_pattern.name}
                        </span>
                    </div>
                );
            }

            // نمایش مبتنی بر برنامه شیفتی (Shift Schedule)
            if (group.shift_schedule) {
                return (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                         <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                            برنامه شیفتی
                        </span>
                        <span className="text-sm font-medium text-foregroundL dark:text-foregroundD mr-1">
                            {group.shift_schedule.name}
                        </span>
                    </div>
                );
            }

            return <span className="text-muted-foregroundL dark:text-muted-foregroundD text-xs">--- نامشخص ---</span>;
        },
    },
    {
        accessorKey: "created_at",
        header: "تاریخ ایجاد",
        cell: ({ row }) => {
            // TODO: توصیه می‌شود برای تبدیل تاریخ میلادی به شمسی، از یک کتابخانه مانند 'date-fns-jalali' یا 'moment-jalaali' استفاده کنید تا فرمت تاریخ دقیق‌تر باشد.
            return new Date(row.original.created_at).toLocaleDateString('fa-IR');
        }
    },
    {
        id: "actions",
        header: () => <div className="text-center">عملیات</div>,
        cell: ({ row }) => (
            <div className="flex justify-center">
                <WorkGroupActionsCell row={row} />
            </div>
        ),
    },
];