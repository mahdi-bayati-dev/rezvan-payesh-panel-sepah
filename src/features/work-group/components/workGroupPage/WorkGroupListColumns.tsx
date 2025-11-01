
import { type ColumnDef } from "@tanstack/react-table";
// ۱. تایپ WorkGroup حالا آپدیت شده
import type { WorkGroup } from "@/features/work-group/types/index";

// ۲. این کامپوننت نیازی به تغییر ندارد
import { WorkGroupActionsCell } from "@/features/work-group/components/workGroupPage/WorkGroupActionsCell";

// تعریف ستون‌های جدول
export const columns: ColumnDef<WorkGroup>[] = [
    {
        accessorKey: "name",
        header: "نام گروه کاری",
    },
    {
        id: 'type',
        header: "نوع الگو/برنامه", // ۳. عنوان هدر را دقیق‌تر کردم
        cell: ({ row }) => {
            const group = row.original;

            // --- ۴. اصلاحیه اصلی ---
            // حالا از فیلدهای week_pattern و shift_schedule که از API میان استفاده می‌کنیم

            // چک می‌کنیم آبجکت week_pattern وجود داشته باشد
            if (group.week_pattern) {
                return (
                    <div className="flex flex-col">
                        {/* <span className="font-medium">الگوی کاری</span> */}
                        {/* از آبجکت تو در تو، نام را می‌خوانیم */}
                        <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                            {group.week_pattern.name}
                        </span>
                    </div>
                );
            }

            // چک می‌کنیم آبجکت shift_schedule وجود داشته باشد
            if (group.shift_schedule) {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">برنامه شیفتی</span>
                        {/* از آبجکت تو در تو، نام را می‌خوانیم */}
                        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">
                            {group.shift_schedule.name}
                        </span>
                    </div>
                );
            }
            // --- پایان اصلاحیه ---

            return <span className="text-muted-foregroundL dark:text-muted-foregroundD">---</span>;
        },
    },
    {
        accessorKey: "created_at",
        header: "تاریخ ایجاد",
        cell: ({ row }) => {
            // TODO: از پکیج date-fns یا jalali-moment برای فرمت بهتر استفاده کنید
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

