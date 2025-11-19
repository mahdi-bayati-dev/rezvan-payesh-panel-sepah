// src/features/devices/components/DeviceList.tsx

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
import { RefreshCw } from "lucide-react"; // آیکون رفرش

import { useDevices } from '../hooks/useDevices';
import { columns } from './deviceColumns';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';

/**
 * 💡 کامپوننت اصلی لیست دستگاه‌ها
 * بازنویسی شده برای هندل کردن لیست کامل (Client-Side Pagination)
 */
export function DeviceList() {
    // ۱. مدیریت استیت‌های جدول (مرتب‌سازی و صفحه‌بندی)
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // ۲. دریافت داده‌ها (رفرش خودکار هر ۳۰ ثانیه فعال است)
    const { 
        data: apiResponse, 
        isLoading, 
        isError, 
        error,
        refetch,
        isRefetching 
    } = useDevices(30000);

    // ۳. آماده‌سازی داده‌ها (استخراج آرایه cameras)
    // استفاده از useMemo برای جلوگیری از محاسبه مجدد در هر رندر
    const devicesData = useMemo(() => apiResponse?.cameras ?? [], [apiResponse]);

    // ۴. کانفیگ جدول TanStack
    const table = useReactTable({
        data: devicesData,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        
        // فعال‌سازی ماژول‌های کلاینت‌ساید:
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // صفحه‌بندی داخلی
        getSortedRowModel: getSortedRowModel(),         // مرتب‌سازی داخلی
        getFilteredRowModel: getFilteredRowModel(),     // فیلترینگ داخلی
    });

    // ۵. هندل کردن ارور
    if (isError) {
        return (
            <div className="p-6 text-center rounded-lg border border-red-200 bg-red-50 text-red-700">
                <p className="font-bold text-lg">خطا در برقراری ارتباط با سرور</p>
                <p className="text-sm mt-2 opacity-80">{(error as Error).message}</p>
                <button 
                    onClick={() => refetch()} 
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* هدر اطلاعات و خلاصه وضعیت */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">تعداد کل دستگاه‌ها</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {isLoading ? "..." : apiResponse?.total ?? 0}
                        </span>
                    </div>
                    {/* جداکننده */}
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                    
                    {!isLoading && apiResponse && (
                        <div className="text-xs text-gray-400 flex flex-col">
                            <span>آخرین بروزرسانی دیتا:</span>
                            <span className="font-mono" dir="ltr">{apiResponse.generated_at}</span>
                        </div>
                    )}
                </div>

                {/* دکمه رفرش دستی */}
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching || isLoading}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isRefetching 
                            ? "bg-gray-100 text-gray-400 cursor-wait" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                    {isRefetching ? "در حال بروزرسانی..." : "بروزرسانی لیست"}
                </button>
            </div>

            {/* جدول اصلی */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
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