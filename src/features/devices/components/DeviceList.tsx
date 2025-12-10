import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type PaginationState,
} from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";

import { useDevices } from '../hooks/useDevices';
import { columns } from './deviceColumns';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';

import { toPersianNumber } from '@/features/User/utils/numberHelper';

export function DeviceList() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const {
        data: apiResponse,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useDevices(30000);

    const devicesData = useMemo(() => apiResponse?.cameras ?? [], [apiResponse]);

    const table = useReactTable({
        data: devicesData,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (isError) {
        return (
            <div className="p-6 text-center rounded-lg border border-destructiveL-foreground/20 bg-destructiveL-background text-destructiveL-foreground dark:bg-destructiveD-background dark:text-destructiveD-foreground">
                <p className="font-bold text-lg">خطا در برقراری ارتباط با سرور</p>
                <p className="text-sm mt-2 opacity-80">{(error as Error).message}</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-destructiveL-foreground/10 hover:bg-destructiveL-foreground/20 rounded-md text-sm font-medium transition-colors"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* هدر اطلاعات و خلاصه وضعیت */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-xl border border-borderL dark:border-borderD shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">تعداد کل دستگاه‌ها</span>
                        <span className="text-2xl font-bold text-foregroundL dark:text-foregroundD">
                            {isLoading ? "..." : toPersianNumber(apiResponse?.total ?? 0)}
                        </span>
                    </div>
                    {/* جداکننده */}
                    <div className="h-8 w-px bg-borderL dark:bg-borderD mx-2 hidden sm:block"></div>

                    {!isLoading && apiResponse && (
                        <div className="text-xs text-muted-foregroundL dark:text-muted-foregroundD flex flex-col">
                            <span>آخرین بروزرسانی دیتا:</span>
                            <span className="" dir="ltr">
                                {toPersianNumber(apiResponse.generated_at)}
                            </span>
                        </div>
                    )}
                </div>

                {/* دکمه رفرش دستی */}
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching || isLoading}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isRefetching
                            ? "bg-secondaryL text-muted-foregroundL cursor-wait dark:bg-secondaryD dark:text-muted-foregroundD"
                            : "bg-primaryL/10 text-primaryL hover:bg-primaryL/20 dark:bg-primaryD/10 dark:text-primaryD dark:hover:bg-primaryD/20"
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                    {isRefetching ? "در حال بروزرسانی..." : "بروزرسانی لیست"}
                </button>
            </div>

            {/* جدول اصلی */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD rounded-xl border border-borderL dark:border-borderD overflow-hidden">
                <DataTable
                    table={table}
                    isLoading={isLoading}
                    notFoundMessage="هیچ دستگاهی یافت نشد."
                    skeletonRowCount={pagination.pageSize}
                />
            </div>

            {/* صفحه‌بندی */}
            {!isLoading && devicesData.length > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}