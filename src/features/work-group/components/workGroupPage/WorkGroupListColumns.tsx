import { type ColumnDef } from "@tanstack/react-table";
import type { WorkGroup } from "@/features/work-group/types/index";

import { WorkGroupActionsCell } from "@/features/work-group/components/workGroupPage/WorkGroupActionsCell";

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
            
            if (group.week_pattern) {
                return (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="px-2 py-0.5 text-xs font-medium bg-primaryL/10 text-primaryL rounded-full dark:bg-primaryD/10 dark:text-primaryD">
                            الگوی کاری
                        </span>
                        <span className="text-sm font-medium text-foregroundL dark:text-foregroundD mr-1">
                            {group.week_pattern.name}
                        </span>
                    </div>
                );
            }

            if (group.shift_schedule) {
                return (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                         <span className="px-2 py-0.5 text-xs font-medium bg-successL-background text-successL-foreground rounded-full dark:bg-successD-background dark:text-successD-foreground">
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