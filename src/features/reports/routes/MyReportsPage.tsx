import { useState, useMemo, useEffect, useCallback } from "react";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
    type OnChangeFn,
} from "@tanstack/react-table";
import { Search, FileClock } from "lucide-react";

import { useMyLogs } from "../hooks/hook";
import { myReportsColumns } from "@/features/reports/components/myReportsPage/MyReportsTableColumns";
import { type MyLogFilters } from "@/features/reports/api/api";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { MyActivityFilters } from "@/features/reports/components/myReportsPage/MyActivityFilters";
import Input from "@/components/ui/Input";
import { useReportSocket } from "../hooks/useReportSocket";
// ایمپورت تابع تبدیل عدد
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";

export default function MyReportsPage() {
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
    // تعداد کل رکوردها برای نمایش در هدر
    const totalRows = meta?.total || 0;

    useReportSocket(filters);

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
        <div className="flex flex-col lg:flex-row-reverse gap-6 p-4 md:p-6 min-h-screen">
            <div className="w-full lg:w-72 lg:sticky lg:top-6 lg:self-start flex-shrink-0">
                <MyActivityFilters onFilterChange={handleFilterChange} />
            </div>

            <main className="flex-1 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD p-5 sm:p-6 shadow-sm border border-borderL dark:border-borderD flex flex-col gap-6">

                {/* هدر بهبود یافته با چیدمان صحیح */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl">
                            <FileClock className="w-6 h-6 text-primaryL dark:text-primaryD" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                                فعالیت‌های من
                            </h2>
                            <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5">
                                {isLoading ? "در حال بارگذاری..." : `${toPersianNumbers(totalRows)} فعالیت ثبت شده`}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Input
                            label=""
                            type="text"
                            placeholder="جستجو در توضیحات..."
                            className="w-full pr-10 py-2 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none" />
                    </div>
                </header>

                <section className="border border-borderL dark:border-borderD rounded-2xl overflow-hidden shadow-sm">
                    <DataTable
                        table={table}
                        isLoading={isLoading || isFetching}
                        notFoundMessage="هنوز فعالیتی ثبت نکرده‌اید."
                    />
                </section>

                <DataTablePagination table={table} />
            </main>
        </div>
    );
}