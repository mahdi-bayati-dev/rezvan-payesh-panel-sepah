import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactElement } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type PaginationState,
} from "@tanstack/react-table";
import { toast } from "react-toastify";

import { Loader2, Users, ArrowRight, Search, UserPlus, UserMinus, AlertTriangle } from "lucide-react";

// hooks & api
import { useUsers } from "@/features/User/hooks/hook";
import {
    useUpdateUserWorkPattern,
    useUpdateUserShiftSchedule,
} from "@/features/User/hooks/hook";
import { useWeekPatternDetails } from "@/features/work-pattern/hooks/useWeekPatternDetails";
import { useShiftSchedule } from "@/features/shift-schedule/hooks/hook";
import { type User } from "@/features/User/types/index";

// ui components
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
// ✅ ایمپورت اعداد فارسی
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

// ==============================
// Debounce hook
// ==============================
const useDebounce = (value: string, delay = 500) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
};

// ==============================
// Table Wrapper
// ==============================
const UserManagementTable: React.FC<{
    users: User[];
    columns: ColumnDef<User>[];
    isLoading: boolean;
    notFoundMessage: string;
}> = ({ users, columns, isLoading, notFoundMessage }) => {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 6,
    });

    const table = useReactTable({
        data: users,
        columns,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: false,
        manualFiltering: false,
    });

    const pageCount = table.getPageCount();

    return (
        <div className="space-y-4">
            <DataTable table={table} isLoading={isLoading} notFoundMessage={notFoundMessage} />
            {pageCount > 1 && <DataTablePagination table={table} />}
        </div>
    );
};

// ==============================
// Main Page
// ==============================
export default function ManagePatternEmployeesPage(): ReactElement {
    const navigate = useNavigate();
    const { patternType, patternId } = useParams<{ patternType: string; patternId: string }>();

    // تبدیل ایمن ID به عدد
    const numericPatternId = useMemo(() => Number(patternId), [patternId]);

    // تشخیص نوع الگو (شیفتی یا ثابت)
    const isShiftSchedule = patternType === "schedule";

    // fetch details
    const { data: patternDetails, isLoading: isLoadingPattern } = useWeekPatternDetails(
        !isShiftSchedule ? numericPatternId : 0
    );
    const { data: scheduleDetails, isLoading: isLoadingSchedule } = useShiftSchedule(
        isShiftSchedule ? numericPatternId : 0
    );

    // search
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 450);

    // fetch users
    const {
        data: userResponse,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: usersError,
        refetch: refetchUsers
    } = useUsers({
        page: 1,
        per_page: 9999,
        search: debouncedSearch,
    });

    // mutations
    const assignPatternMutation = useUpdateUserWorkPattern();
    const assignScheduleMutation = useUpdateUserShiftSchedule();
    const mutationPending = assignPatternMutation.isPending || assignScheduleMutation.isPending;

    // ✅ منطق تفکیک کاربران تخصیص‌یافته
    const { assignedUsers, availableUsers } = useMemo(() => {
        const all = userResponse?.data ?? [];

        if (!numericPatternId || all.length === 0) return { assignedUsers: [], availableUsers: all };

        const assigned: User[] = [];
        const available: User[] = [];

        for (const u of all) {
            const emp = u.employee;
            let isAssigned = false;

            if (isShiftSchedule) {
                if (emp?.shift_schedule && Number(emp.shift_schedule.id) === numericPatternId) {
                    isAssigned = true;
                }
            } else {
                if (emp?.week_pattern && Number(emp.week_pattern.id) === numericPatternId) {
                    isAssigned = true;
                }
            }

            if (isAssigned) {
                assigned.push(u);
            } else {
                available.push(u);
            }
        }

        return { assignedUsers: assigned, availableUsers: available };
    }, [userResponse, numericPatternId, isShiftSchedule]);

    // ✅ هندلر تخصیص با اعتبارسنجی پاسخ سرور
    const handleAssign = (userId: number, assignId: number | null) => {
        const mutation = isShiftSchedule ? assignScheduleMutation : assignPatternMutation;

        // پِی‌لود بر اساس نوع الگو
        const payload = isShiftSchedule
            ? { userId, shiftScheduleId: assignId }
            : { userId, workPatternId: assignId };

        // @ts-ignore
        mutation.mutate(payload, {
            onSuccess: (response) => {
                // 🛡️ بررسی امنیتی (Verification)

                const emp = response?.employee;
                const serverPatternId = isShiftSchedule
                    ? emp?.shift_schedule?.id
                    : emp?.week_pattern?.id;

                const targetId = assignId ? Number(assignId) : null;
                const currentId = serverPatternId ? Number(serverPatternId) : null;

                if (targetId !== currentId) {
                    console.error(`⚠️ [Backend Mismatch] Target: ${targetId}, Server Has: ${currentId}`);
                    toast.error(
                        <div className="text-sm">
                            <div className="font-bold flex items-center gap-1">
                                <AlertTriangle size={16} /> عدم اعمال تغییرات!
                            </div>
                            <span>سرور درخواست را پذیرفت اما دیتابیس آپدیت نشد.</span>
                            <br />
                            <span className="text-xs opacity-70">(احتمالا مشکل $fillable در بکند)</span>
                        </div>
                    );
                    return;
                }

                toast.success(assignId ? "کارمند با موفقیت اضافه شد." : "کارمند با موفقیت حذف شد.");
                refetchUsers();
            },
            onError: (err) => {
                const msg = (err as Error)?.message ?? "خطای نامشخص";
                toast.error(msg);
            },
        });
    };

    // Columns Definition
    const assignedColumns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                header: "کارمند",
                accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
                cell: ({ row }) => (
                    <div className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                        {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                    </div>
                ),
            },
            {
                header: "کد پرسنلی",
                accessorKey: "employee.personnel_code",
                // ✅ فارسی کردن کد پرسنلی
                cell: ({ getValue }) => <div className="text-sm ">{toPersianDigits(String(getValue() ?? "-"))}</div>,
            },
            {
                id: "actions",
                header: () => <div className="text-left text-sm">عملیات</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            onClick={() => handleAssign(row.original.id, null)}
                            disabled={mutationPending}
                            title="لغو تخصیص"
                        >
                            {mutationPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserMinus className="h-3 w-3" />}
                            <span className="text-xs">حذف</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [mutationPending]
    );

    const availableColumns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                header: "کارمند",
                accessorFn: (row) => `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`,
                cell: ({ row }) => {
                    const currentPattern = row.original.employee?.week_pattern?.name || row.original.employee?.shift_schedule?.name;
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                                {`${row.original.employee?.first_name ?? ""} ${row.original.employee?.last_name ?? ""}`}
                            </span>
                            {currentPattern && (
                                <span className="text-[10px] text-muted-foregroundL">فعلی: {currentPattern}</span>
                            )}
                        </div>
                    )
                },
            },
            {
                header: "کد پرسنلی",
                accessorKey: "employee.personnel_code",
                // ✅ فارسی کردن کد پرسنلی
                cell: ({ getValue }) => <div className="text-sm ">{toPersianDigits(String(getValue() ?? "-"))}</div>,
            },
            {
                id: "actions",
                header: () => <div className="text-left text-sm">عملیات</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                            onClick={() => handleAssign(row.original.id, numericPatternId)}
                            disabled={mutationPending}
                            title="تخصیص به این الگو"
                        >
                            {mutationPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                            <span className="text-xs">افزودن</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [mutationPending, numericPatternId]
    );

    if (isNaN(numericPatternId)) {
        return (
            <div className="p-8 text-center text-red-600 font-vazir" dir="rtl">
                خطا: شناسهٔ الگو نامعتبر است.
            </div>
        );
    }

    const isLoading = isLoadingPattern || isLoadingSchedule;
    const patternName = isShiftSchedule
        ? scheduleDetails?.name ?? "برنامهٔ شیفتی"
        : patternDetails?.name ?? "الگوی کاری";

    return (
        <div className="p-4 md:p-8 space-y-6 font-vazir" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primaryL" />
                        ) : (
                            <Users className="h-6 w-6 text-foregroundL" />
                        )}
                        <h1 className="text-xl md:text-2xl font-semibold">مدیریت کارمندان</h1>
                    </div>
                    <div className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        مدیریت کاربران متصل به:
                        <span className="mr-2 inline-block px-2 py-0.5 rounded-md bg-primaryL/10 text-primaryL font-medium">
                            {patternName}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate("/work-patterns")}
                        className="flex items-center gap-2"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        label=""
                        placeholder="جستجو در میان همه کارمندان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 focus:ring-2 focus:ring-primaryL/30"
                    />
                </div>
            </div>

            {/* Content */}
            {isErrorUsers ? (
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری کارمندان</AlertTitle>
                    <AlertDescription>{(usersError as Error)?.message ?? "خطای نامشخّص"}</AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assigned Users */}
                    <Card className="rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 bg-green-50/30 dark:bg-green-900/10">
                        <CardHeader className="pb-2 border-b border-green-100 dark:border-green-900/30">
                            <CardTitle className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <UserMinus className="h-5 w-5 text-green-700 dark:text-green-400" />
                                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">کارمندان متصل (تخصیص یافته)</span>
                                </div>
                                {/* ✅ فارسی کردن تعداد */}
                                <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm text-green-600 font-bold">
                                    {toPersianDigits(assignedUsers.length)} نفر
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <UserManagementTable
                                users={assignedUsers}
                                columns={assignedColumns}
                                isLoading={isLoadingUsers || mutationPending}
                                notFoundMessage="هیچ کارمندی به این الگو متصل نیست."
                            />
                        </CardContent>
                    </Card>

                    {/* Available Users */}
                    <Card className="rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
                            <CardTitle className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-semibold">سایر کارمندان</span>
                                </div>
                                {/* ✅ فارسی کردن تعداد */}
                                <span className="text-xs px-2 py-1 rounded-full bg-secondaryL dark:bg-gray-700 text-foregroundL font-bold">
                                    {toPersianDigits(availableUsers.length)} نفر
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <UserManagementTable
                                users={availableUsers}
                                columns={availableColumns}
                                isLoading={isLoadingUsers || mutationPending}
                                notFoundMessage="کارمند دیگری یافت نشد."
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}