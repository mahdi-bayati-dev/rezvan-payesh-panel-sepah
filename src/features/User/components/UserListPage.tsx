
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // (useNavigate برای دکمه‌ها)
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";

// --- ۱. ایمپورت‌های Redux (با مسیر نسبی) ---
// (مسیرها را بر اساس ساختار پروژه خودتان تنظیم کنید)
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- ۲. کامپوننت‌های UI شما (با مسیر نسبی و حروف کوچک) ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // ✅ استفاده از کامپوننت Button شما

// --- ۳. هوک‌ها و تایپ‌های ما (با مسیر نسبی) ---
import { useUsers } from '../hooks/hook';
import { columns } from './UserTableColumns';
import { useOrganization } from '../../Organization/hooks/useOrganizations';

// --- ۴. آیکون‌ها ---
import { Search, ArrowRight, Loader2, UserPlus } from 'lucide-react';

// (هوک Debounce)
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
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

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
            </div>

            {/* نوار ابزار: جستجو و دکمه‌ها */}
            {/* ✅ بهبود UI: قرار دادن نوار ابزار در یک کانتینر مجزا */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                {/* بخش جستجو و بازگشت */}
                <div className='flex items-center gap-2'>
                    {/* ✅ استفاده از Button شما */}
                    <Button
                        variant="link"
                        size="md"
                        onClick={() => navigate('/organizations')}
                    >
                        <ArrowRight className="h-4 w-4 ml-2 dark:text-primaryD" />
                        بازگشت
                    </Button>

                    <div className="relative w-full max-w-sm">
                        <Input
                            label=''
                            placeholder="جستجو در نام، ایمیل، کد پرسنلی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10" // (برای RTL)
                        />
                        <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-primaryD" />
                    </div>
                </div>

                {/* بخش دکمه تخصیص (فقط Super Admin) */}
                {isSuperAdmin && (
                    // ✅ استفاده از Button شما
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/organizations/${organizationId}/assign-user`)}
                    >
                        <UserPlus className="h-4 w-4 ml-2" />
                        تخصیص کارمند به این سازمان
                    </Button>
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

