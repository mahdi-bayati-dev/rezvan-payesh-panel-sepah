import { useState, useMemo } from 'react';

// --- ابزارهای جدول ---
import {
    useReactTable,
    getCoreRowModel,
    // getPaginationRowModel, // نیازی نیست چون دستی هندل می‌کنیم
    type PaginationState,
} from "@tanstack/react-table";

// ✅ استفاده از alias ها
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { columns } from '@/features/User/components/userList/UserTableColumns';

// --- هوک‌ها و تایپ‌ها ---
import { useUsers } from '@/features/User/hooks/hook';
import { type FetchUsersParams } from '@/features/User/types';
import { normalizePaginationValue } from '@/features/User/utils/dateHelper'; // ✅ ایمپورت تابع کمکی

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
        // organization_id ارسال نمی‌شود تا همه کاربران بیایند
    };

    const {
        data: userResponse,
        isLoading: isLoadingUsers,
        isError,
        error
    } = useUsers(fetchParams);

    // داده‌های کاربران (آرایه)
    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);

    // ✅ ۳. نرمال‌سازی داده‌های متا (تعداد کل صفحات و تعداد کل رکوردها)
    const pageCount = useMemo(() => {
        return normalizePaginationValue(userResponse?.meta?.last_page);
    }, [userResponse]);

    const totalRows = useMemo(() => {
        return normalizePaginationValue(userResponse?.meta?.total);
    }, [userResponse]);

    // --- ۴. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns,

        // ✅ تنظیمات حیاتی برای Pagination سمت سرور
        pageCount: pageCount, // تعداد کل صفحات
        rowCount: totalRows,  // تعداد کل رکوردها (خیلی مهم برای نمایش صحیح "نمایش 1 از 10")

        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, // چون جستجو و پیجینیشن سمت سرور است
        manualFiltering: true,
    });

    // مدیریت خطا
    if (isError) {
        return (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-lg border border-red-100">
                <h3>خطا در بارگذاری لیست</h3>
                <p className="text-sm mt-2">{(error as any)?.message || "خطای ناشناخته در ارتباط با سرور"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* کامپوننت جدول */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="کاربری با این مشخصات یافت نشد."
            />

            {/* ✅ شرط نمایش: اگر تعداد کل رکوردها بیشتر از 0 باشد، پیجینیشن نمایش داده شود.
               قبلاً شرط روی pageCount بود که گاهی دقیق نیست، totalRows مطمئن‌تر است.
            */}
            {totalRows > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}