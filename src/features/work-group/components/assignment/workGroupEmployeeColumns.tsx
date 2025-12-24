import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/features/User/types/index";
import { Button } from "@/components/ui/Button";
import Checkbox from "@/components/ui/CheckboxTable";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

type ActionHandler = (userId: number) => void;

const getSelectionColumn = (): ColumnDef<User> => ({
    id: "select",
    header: ({ table }) => (
        <div className="px-1">
            <Checkbox
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
            header: "سرباز",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </span>
                    <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD truncate max-w-[150px]">
                        {row.original.user_name}
                    </span>
                </div>
            ),
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
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
                            className="h-8 px-2 text-destructiveL hover:bg-destructiveL-background hover:text-destructiveL-foreground dark:hover:bg-destructiveD-background dark:text-destructiveD transition-colors"
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
            header: "سرباز",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </span>
                    <span className="text-[10px] text-successL-foreground dark:text-successD-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-successL-foreground"></span>
                        آزاد
                    </span>
                </div>
            ),
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
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
                            className="h-8 px-2 text-successL-foreground hover:bg-successL-background hover:text-successL-foreground dark:hover:bg-successD-background dark:text-successD-foreground transition-colors"
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