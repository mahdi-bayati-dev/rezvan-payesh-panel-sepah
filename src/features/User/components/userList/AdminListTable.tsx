"use client";

import { useState, useMemo } from 'react';

// --- ابزارهای جدول ---
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table"; // (پکیج نود ماژول)

// ✅ بازگشت به استفاده از alias ها
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
// ✅ استفاده از alias برای ستون‌ها
import { columns } from '@/features/User/components/userList/UserTableColumns';

// --- کامپوننت‌های UI ---
// import Input from '@/components/ui/Input'; // ✅ استفاده از alias و I بزرگ
// import { Search } from 'lucide-react';

// --- هوک‌ها و تایپ‌ها ---
import { useUsers } from '@/features/User/hooks/hook'; // ✅ استفاده از alias
import { type FetchUsersParams } from '@/features/User/types'; // ✅ استفاده از alias

interface AdminListTableProps {
    role: string;
    globalSearch: string;
}

/**
 * این کامپوننت یک جدول قابل استفاده مجدد است
 * که لیست کاربران را بر اساس نقش فیلتر شده نمایش می‌دهد.
 */
export function AdminListTable({ role, globalSearch }: AdminListTableProps) {

    // --- ۱. مدیریت State صفحه‌بندی ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- ۲. فچ کردن داده‌های کاربران (بر اساس فیلترها) ---
    const fetchParams: FetchUsersParams = {
        page: pageIndex + 1,
        per_page: pageSize,
        search: globalSearch,
        role: role,
        // ما organization_id را ارسال نمی‌کنیم تا همه کاربران (طبق دسترسی API) بیایند
    };

    const {
        data: userResponse,
        isLoading: isLoadingUsers,
        isError,
        error
    } = useUsers(fetchParams);

    // داده‌های کاربران (آرایه)
    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    // تعداد کل صفحات
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

    // --- ۳. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns, // ✅ ستون‌های ایمپورت شده
        pageCount: pageCount,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualFiltering: true, // چون جستجو سمت سرور است
    });

    // مدیریت خطایابی
    if (isError) {
        return (
            <div className="p-8 text-center text-red-600">
                <h1>خطا در بارگذاری لیست</h1>
                <p>{(error as any)?.message || "خطای ناشناخته"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* کامپوننت جدول شما */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="کاربری یافت نشد."
            />

            {/* کامپوننت صفحه‌بندی شما */}
            {pageCount > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}