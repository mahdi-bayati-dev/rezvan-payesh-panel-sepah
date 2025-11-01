"use client";

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- useNavigate
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- کامپوننت‌های جدول شما ---
// (مسیرها را بر اساس پروژه خودتان تنظیم کنید و از حروف کوچک استفاده کنید)
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
// import { Button } from '@/components/ui/button'; // (اگر دکمه دارید)

// --- هوک‌ها و تایپ‌های ما ---
// import { type User } from '@/features/User/types/index';
import { useUsers } from '@/features/User/hooks/hook';
import { columns } from './UserTableColumns';
// (هوک سازمان برای گرفتن نام در هدر)
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';

// --- آیکون‌ها ---
import { Search, ArrowRight, Loader2, UserPlus } from 'lucide-react';

// (یک هوک ساده debounce برای بهینه‌سازی جستجو)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


interface UserListPageProps {
    organizationId: number; // ID سازمانی که از URL می‌آید
}

/**
 * این کامپوننت هسته اصلی نمایش لیست کاربران است.
 * جدول، جستجو و صفحه‌بندی را مدیریت می‌کند.
 */
export function UserListPage({ organizationId }: UserListPageProps) {
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const navigate = useNavigate();

    // --- ۱. مدیریت State صفحه‌بندی ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0, // صفحه اول (API از ۱ شروع می‌شود، در هوک تبدیل می‌کنیم)
        pageSize: 10, // پیش‌فرض ۱۰ آیتم در صفحه
    });

    // --- ۲. مدیریت State جستجو ---
    const [searchTerm, setSearchTerm] = useState("");
    // از debounce استفاده می‌کنیم تا جلوی درخواست‌های مکرر API در حین تایپ را بگیریم
    const debouncedSearch = useDebounce(searchTerm, 500); // 500ms تأخیر

    // --- ۳. فچ کردن داده‌های سازمان (فقط برای نمایش نام) ---
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

    // --- ۴. فچ کردن داده‌های کاربران (بر اساس فیلترها) ---
    const {
        data: userResponse, // پاسخ کامل شامل meta و data
        isLoading: isLoadingUsers,
        isError,
        error
    } = useUsers({
        organization_id: organizationId,
        page: pageIndex + 1, // API از ۱ شروع می‌شود، state جدول از ۰
        per_page: pageSize,
        search: debouncedSearch,
    });

    // داده‌های کاربران (آرایه)
    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    // تعداد کل صفحات
    const pageCount = useMemo(() => userResponse?.meta.last_page ?? 0, [userResponse]);

    // --- ۵. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns,
        pageCount: pageCount, // تعداد کل صفحات برای صفحه‌بندی
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: setPagination, // تابع آپدیت state
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true, // به جدول می‌گوییم صفحه‌بندی سمت سرور است
        manualFiltering: true, // جستجو هم سمت سرور است
    });

    // مدیریت خطایابی
    if (isError) {
        return (
            <div className="p-8 text-center text-red-600" dir="rtl">
                <h1>خطا در بارگذاری کاربران</h1>
                <p>{(error as any)?.message || "خطای ناشناخته"}</p>
            </div>
        );
    }

    // (یک دکمه موقت تا زمانی که کامپوننت دکمه خودتان را ایمپورت کنید)
    const TempButton = ({ children, ...props }: any) => (
        <button className="flex items-center gap-2 justify-center px-4 py-2 border rounded-md text-sm hover:bg-secondaryL dark:hover:bg-secondaryD p-2" {...props}>
            {children}
        </button>
    );


    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL">
                        {isLoadingOrg ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            `کارمندان: ${organization?.name}`
                        )}
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        لیست کارمندان تخصیص‌یافته به این واحد سازمانی (و زیرمجموعه‌ها).
                    </p>
                </div>
                <TempButton asChild >
                    <Link to="/organizations" className='flex gap-2 items-center'>
                        <ArrowRight className="h-4 w-4 ml-2" />
                        بازگشت به چارت
                    </Link>
                </TempButton>
            </div>

            {/* نوار ابزار: جستجو */}
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Input
                        label=''
                        placeholder="جستجو در نام، ایمیل، کد پرسنلی..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10" // (برای RTL)
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                </div>
                {isSuperAdmin && (
                    <TempButton
                        variant="primary"
                        onClick={() => navigate(`/organizations/${organizationId}/assign-user`)}
                        className="w-full sm:w-auto bg-primaryL text-white dark:bg-primaryD p-2 rounded-2xl flex gap-2 items-center hover:bg-successD-foreground cursor-pointer" // (استایل دکمه اصلی)
                    >
                        <UserPlus className="h-4 w-4 ml-2" />
                        تخصیص کارمند به این سازمان
                    </TempButton>
                )}
            </div>

            {/* کامپوننت جدول شما */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="کارمندی یافت نشد."
            />

            {/* کامپوننت صفحه‌بندی شما */}
            {/* فقط زمانی صفحه‌بندی را نشان بده که داده‌ای وجود دارد */}
            {pageCount > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}

