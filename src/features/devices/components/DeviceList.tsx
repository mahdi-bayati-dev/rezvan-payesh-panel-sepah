// src/features/devices/components/DeviceList.tsx

import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";

import { useDevices } from '../hooks/useDevices';
import { columns } from './deviceColumns'; // ✅ ایمپورت ستون‌ها
import { DataTable } from '@/components/ui/DataTable'; // ✅ ایمپورت DataTable شما
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination'; // ✅ ایمپورت Pagination شما


/**
 * 💡 کامپوننت اصلی مدیریت لیست دستگاه‌ها
 */
export function DeviceList() {
    // ۱. مدیریت حالت صفحه‌بندی
    const [{ pageIndex, pageSize }, setPagination] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: 10,
        });

    // ۲. فچ کردن داده‌ها (انتظار داریم devicesArray یک آرایه باشد)
    const {
        data: devicesArray,
        isLoading,
        isError,
        error
    } = useDevices(pageIndex + 1, pageSize);

    // ۳. مدیریت خطاهای API
    if (isError) {
        const status = (error as any).response?.status;
        if (status === 403) {
            return <div className='p-4 text-red-600 font-bold'>🚫 دسترسی غیرمجاز: شما اجازه مشاهده این لیست را ندارید (فقط super_admin).</div>;
        }
        return <div className='p-4 text-red-600'>خطا در دریافت داده‌ها: {(error as Error).message}</div>;
    }

    // ۴. آماده‌سازی داده‌ها (مستقیماً از آرایه)
    const devicesData = useMemo(() => devicesArray ?? [], [devicesArray]);

    // ۵. چون API صفحه‌بندی ندارد، صفحه‌بندی را سمت کلاینت انجام می‌دهیم
    const totalPages = Math.ceil(devicesData.length / pageSize);

    // ۵. راه‌اندازی instance جدول (useReactTable)
    const table = useReactTable({
        data: devicesData,
        columns: columns,
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        // 💡 نکته: چون API صفحه‌بندی ندارد، manualPagination را برمیداریم
        // تا tanstack-table خودش صفحه‌بندی کلاینت-ساید را انجام دهد.
        // manualPagination: false, // (پیش‌فرض false است)
        pageCount: totalPages, // تعداد صفحات بر اساس داده‌های کلاینت
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // صفحه‌بندی کلاینت-ساید
    });

    // ۶. رندر کردن کامپوننت‌های شما
    return (
        <div className="space-y-4">
            <DataTable
                table={table}
                isLoading={isLoading}
                notFoundMessage="هیچ دستگاهی یافت نشد."
                skeletonRowCount={pageSize}
            />

            {/* 💡 حالا می‌توانیم صفحه‌بندی را (بر اساس کلاینت) نمایش دهیم */}
            {!isLoading && devicesData.length > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}