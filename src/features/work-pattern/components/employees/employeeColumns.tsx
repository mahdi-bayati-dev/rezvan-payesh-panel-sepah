// کامنت: این فایل صرفاً ستون‌های جداول را تعریف می‌کند و کاملاً Stateless است.
import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/features/User/types/index";
import { Button } from "@/components/ui/Button";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

// تایپ برای اکشن‌ها (Dependency Injection)
type ActionHandler = (userId: number) => void;

/**
 * ستون‌های جدول کاربران تخصیص یافته (لیست متصل)
 */
export const getAssignedColumns = (
    onRemove: ActionHandler,
    isPending: boolean
): ColumnDef<User>[] => [
        {
            header: "کارمند",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </span>
                    <span className="text-[10px] text-muted-foregroundL truncate max-w-[150px]">
                        {row.original.email}
                    </span>
                </div>
            ),
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm  text-muted-foregroundL">
                    {toPersianDigits(String(getValue() ?? "-"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-left text-xs">عملیات</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        onClick={() => onRemove(row.original.id)}
                        disabled={isPending}
                        title="لغو تخصیص"
                    >
                        {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <UserMinus className="h-3.5 w-3.5 ml-1.5" />
                                <span className="text-xs">حذف</span>
                            </>
                        )}
                    </Button>
                </div>
            ),
        },
    ];

/**
 * ستون‌های جدول کاربران در دسترس (لیست سایرین)
 */
export const getAvailableColumns = (
    onAdd: ActionHandler,
    isPending: boolean,
    // currentPatternId: number
): ColumnDef<User>[] => [
        {
            header: "کارمند",
            accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
            cell: ({ row }) => {
                // نمایش وضعیت فعلی کاربر (اگر به جای دیگری متصل است)
                const currentPatternName = row.original.employee?.week_pattern?.name || row.original.employee?.shift_schedule?.name;

                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                            {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                        </span>
                        {currentPatternName ? (
                            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded w-fit border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                                فعلی: {currentPatternName}
                            </span>
                        ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                آزاد
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => (
                <div className="text-sm  text-muted-foregroundL">
                    {toPersianDigits(String(getValue() ?? "-"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-left text-xs">عملیات</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                        onClick={() => onAdd(row.original.id)}
                        disabled={isPending}
                        title="تخصیص به این الگو"
                    >
                        {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="h-3.5 w-3.5 ml-1.5" />
                                <span className="text-xs">افزودن</span>
                            </>
                        )}
                    </Button>
                </div>
            ),
        },
    ];