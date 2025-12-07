import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/features/User/types/index";
import { Button } from "@/components/ui/Button";
// ✅ اطمینان حاصل کنید که مسیر دقیقاً به CheckboxTable اشاره دارد
import Checkbox from "@/components/ui/CheckboxTable";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

type ActionHandler = (userId: number) => void;

// ستون مشترک چک‌باکس
const getSelectionColumn = (): ColumnDef<User> => ({
    id: "select",
    header: ({ table }) => (
        <div className="px-1">
            <Checkbox
                // ✅ حالا که از CheckboxTable استفاده می‌کنیم، مقدار 'indeterminate' مجاز است
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="انتخاب همه"
            />
        </div>
    ),
    cell: ({ row }) => (
        <div className="px-1">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="انتخاب ردیف"
            />
        </div>
    ),
    enableSorting: false,
    enableHiding: false,
});

export const getAssignedGroupColumns = (
    onRemove: ActionHandler,
    pendingUserId: number | null
): ColumnDef<User>[] => [
        getSelectionColumn(),
        {
            header: "کارمند",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </span>
                    <span className="text-[10px] text-muted-foregroundL truncate max-w-[150px]">
                        {row.original.user_name}
                    </span>
                </div>
            ),
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm text-muted-foregroundL">
                    {toPersianDigits(String(getValue() ?? "-"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-left text-xs">عملیات</div>,
            cell: ({ row }) => {
                const targetId = row.original.employee?.id || row.original.id;
                const isLoading = pendingUserId === targetId;

                return (
                    <div className="flex items-center justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                            onClick={() => onRemove(targetId)}
                            disabled={!!pendingUserId}
                            title="حذف از گروه"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5 ml-1.5" />}
                            <span className="text-xs">حذف</span>
                        </Button>
                    </div>
                )
            },
        },
    ];

export const getAvailableGroupColumns = (
    onAdd: ActionHandler,
    pendingUserId: number | null
): ColumnDef<User>[] => [
        getSelectionColumn(),
        {
            header: "کارمند",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        آزاد
                    </span>
                </div>
            ),
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm text-muted-foregroundL">
                    {toPersianDigits(String(getValue() ?? "-"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-left text-xs">عملیات</div>,
            cell: ({ row }) => {
                const targetId = row.original.employee?.id || row.original.id;
                const isLoading = pendingUserId === targetId;

                return (
                    <div className="flex items-center justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                            onClick={() => onAdd(targetId)}
                            disabled={!!pendingUserId}
                            title="افزودن به گروه"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5 ml-1.5" />}
                            <span className="text-xs">افزودن</span>
                        </Button>
                    </div>
                )
            },
        },
    ];