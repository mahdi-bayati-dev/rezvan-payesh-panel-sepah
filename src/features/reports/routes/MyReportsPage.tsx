import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
// ✅ اصلاح: حذف leaveChannel از ایمپورت‌ها
import { getEcho } from "@/lib/echoService";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
    type OnChangeFn,
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

    const paginationState = useMemo(() => ({
        pageIndex: (filters.page || 1) - 1,
        pageSize: filters.per_page || 10,
    }), [filters.page, filters.per_page]);

    const handlePaginationChange: OnChangeFn<PaginationState> = useCallback((updaterOrValue) => {
        setFilters((old) => {
            const newPagination = typeof updaterOrValue === 'function'
                ? updaterOrValue({
                    pageIndex: (old.page || 1) - 1,
                    pageSize: old.per_page || 10
                })
                : updaterOrValue;

            return {
                ...old,
                page: newPagination.pageIndex + 1,
                per_page: newPagination.pageSize
            };
        });
    }, []);

    const handleSortingChange: OnChangeFn<SortingState> = useCallback((updaterOrValue) => {
        setSorting((old) => {
            const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(old) : updaterOrValue;
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => {
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
    const pageCount = meta ? (typeof meta.last_page === 'number' ? meta.last_page : 1) : 1;

    // --- سوکت با Optimistic Update ---
    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) return;

        const channelName = `App.User.${userId}`;
        const eventName = ".attendance.created";
        const privateChannel = echo.private(channelName);

        // تعریف لیسنر
        const handleNewLog = (event: { log: ApiAttendanceLog }) => {
            if (!event.log) return;

            const newActivityLog = mapApiLogToActivityLog(event.log);
            const logText = newActivityLog.activityType === "entry" ? "ورود شما" : "خروج شما";
            toast.success(`✅ ${logText} ثبت شد.`);

            // آپدیت کش
            queryClient.setQueryData(reportKeys.myList(filters), (oldData: any) => {
                if (!oldData) return oldData;
                const newData = [newActivityLog, ...oldData.data];
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
        };

        // اتصال
        privateChannel.listen(eventName, handleNewLog);

        // ✅ اصلاح: فقط stopListening می‌کنیم، کانال را leave نمی‌کنیم
        // چون این کانال ممکن است توسط GlobalNotificationHandler برای دانلود استفاده شود.
        return () => {
            privateChannel.stopListening(eventName, handleNewLog);
            // leaveChannel(channelName); <-- حذف شد
        };
    }, [queryClient, userId, filters]);

    const table = useReactTable({
        data: logsData,
        columns: myReportsColumns,
        pageCount: pageCount,
        state: {
            pagination: paginationState,
            sorting,
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
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