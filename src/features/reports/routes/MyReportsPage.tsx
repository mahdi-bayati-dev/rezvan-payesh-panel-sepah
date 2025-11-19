import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { getEcho, leaveChannel } from "@/lib/echoService";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
    type OnChangeFn, // تایپ مورد نیاز
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { toast } from "react-toastify";

import { useMyLogs, reportKeys } from "../hooks/hook";
import { myReportsColumns } from "@/features/reports/components/myReportsPage/MyReportsTableColumns";
import { type MyLogFilters } from "@/features/reports/api/api";
import { type ApiAttendanceLog } from "../types";
import { mapApiLogToActivityLog } from "../utils/dataMapper";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { MyActivityFilters } from "@/features/reports/components/myReportsPage/MyActivityFilters";
import Input from "@/components/ui/Input";

export default function MyReportsPage() {
    const queryClient = useQueryClient();
    const user = useAppSelector(selectUser);
    const userId = user?.id;

    // --- ۱. استیت فیلتر (Single Source of Truth) ---
    // صفحه‌بندی را مستقیماً همینجا مدیریت می‌کنیم
    const [filters, setFilters] = useState<MyLogFilters>({
        page: 1,
        per_page: 10,
        sort_by: "timestamp",
        sort_dir: "desc",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [sorting, setSorting] = useState<SortingState>([
        { id: "timestamp", desc: true },
    ]);

    // محاسبه Pagination State از روی Filters برای نمایش در جدول
    const paginationState = useMemo(() => ({
        pageIndex: (filters.page || 1) - 1, // تبدیل ۱-محور به ۰-محور
        pageSize: filters.per_page || 10,
    }), [filters.page, filters.per_page]);


    // --- ۲. هندلر هوشمند Pagination (جایگزین useEffect) ---
    const handlePaginationChange: OnChangeFn<PaginationState> = useCallback((updaterOrValue) => {
        setFilters((old) => {
            // محاسبه مقدار جدید بر اساس لاجیک TanStack Table
            const newPagination = typeof updaterOrValue === 'function'
                ? updaterOrValue({
                    pageIndex: (old.page || 1) - 1,
                    pageSize: old.per_page || 10
                })
                : updaterOrValue;

            return {
                ...old,
                page: newPagination.pageIndex + 1, // برگرداندن به ۱-محور برای API
                per_page: newPagination.pageSize
            };
        });
    }, []);


    // --- ۳. هندلر هوشمند Sorting (جایگزین useEffect) ---
    const handleSortingChange: OnChangeFn<SortingState> = useCallback((updaterOrValue) => {
        setSorting((old) => {
            const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(old) : updaterOrValue;

            // بلافاصله فیلتر را آپدیت می‌کنیم (بدون useEffect)
            setFilters(prev => {
                if (!newSorting.length) {
                    return { ...prev, sort_by: "timestamp", sort_dir: "desc" };
                }
                const sort = newSorting[0];
                return {
                    ...prev,
                    sort_by: sort.id as MyLogFilters["sort_by"],
                    sort_dir: sort.desc ? "desc" : "asc"
                };
            });

            return newSorting;
        });
    }, []);


    // Debounce برای جستجو (این یکی چون تایپ کاربر است، useEffect منطقی است)
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => {
                // اگر چیزی تغییر نکرده، آپدیت نکن (جلوگیری از رندر اضافه)
                if (prev.search === searchTerm) return prev;
                return { ...prev, search: searchTerm || undefined, page: 1 };
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);


    const {
        data: queryResult,
        isLoading,
        isFetching,
    } = useMyLogs(filters);

    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    // هندل کردن ساختار متفاوت meta در لاراول
    const pageCount = meta ? (typeof meta.last_page === 'number' ? meta.last_page : 1) : 1;


    // --- ۴. سوکت با Optimistic Update (حذف setTimeout) ---
    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) return;

        const channelName = `App.User.${userId}`;
        const eventName = ".attendance.created";
        const privateChannel = echo.private(channelName);

        privateChannel.listen(eventName, (event: { log: ApiAttendanceLog }) => {
            if (!event.log) return;

            const newActivityLog = mapApiLogToActivityLog(event.log);
            const logText = newActivityLog.activityType === "entry" ? "ورود شما" : "خروج شما";
            toast.success(`✅ ${logText} ثبت شد.`);

            // ✅ آپدیت دستی کش (Optimistic Update)
            // به جای اینکه صبر کنیم سرور جواب بده، خودمون لیست رو آپدیت می‌کنیم
            queryClient.setQueryData(reportKeys.myList(filters), (oldData: any) => {
                if (!oldData) return oldData;

                // لاگ جدید رو به اول آرایه اضافه می‌کنیم
                const newData = [newActivityLog, ...oldData.data];

                // اگر طول آرایه بیشتر از pageSize شد، آخری رو حذف می‌کنیم
                if (newData.length > (filters.per_page || 10)) {
                    newData.pop();
                }

                return {
                    ...oldData,
                    data: newData,
                    meta: {
                        ...oldData.meta,
                        total: (oldData.meta?.total || 0) + 1
                    }
                };
            });
        });

        return () => {
            privateChannel.stopListening(eventName);
            leaveChannel(channelName);
        };
    }, [queryClient, userId, filters]); // filters رو اضافه کردیم تا کش درست رو آپدیت کنه


    const table = useReactTable({
        data: logsData,
        columns: myReportsColumns,
        pageCount: pageCount,
        state: {
            pagination: paginationState, // استفاده از استیت محاسبه شده
            sorting,
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        // اتصال مستقیم هندلرها
        onPaginationChange: handlePaginationChange,
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
    });


    const handleFilterChange = (
        newApiFilters: Pick<MyLogFilters, "start_date" | "end_date" | "type">
    ) => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            ...newApiFilters,
        }));
    };

    return (
        <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-6">
            <div className="w-full md:w-64 lg:w-72 md:sticky md:top-4 md:self-start flex-shrink-0">
                <MyActivityFilters onFilterChange={handleFilterChange} />
            </div>

            <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 sm:p-6 space-y-4 min-w-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                        گزارش آخرین فعالیت‌های من
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-60">
                            <Input
                                label=""
                                type="text"
                                placeholder="جستجو در ملاحظات..."
                                className="w-full pr-10 py-2 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} className="absolute right-3 top-1/3" />
                        </div>
                    </div>
                </header>

                <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                    <DataTable
                        table={table}
                        isLoading={isLoading || isFetching}
                        notFoundMessage="هیچ فعالیتی یافت نشد."
                    />
                </section>

                <DataTablePagination table={table} />
            </main>
        </div>
    );
}