import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";

// --- ۱. ایمپورت‌های Redux (مسیرها باید صحیح باشند) ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- ۲. کامپوننت‌های UI ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// --- ۳. هوک‌ها و تایپ‌ها ---
import { useUsers } from '@/features/User/hooks/hook';
import { columns } from './UserTableColumns';
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';

// --- ۴. آیکون‌ها ---
import { Search, ArrowRight, Loader2, UserPlus, FileUp } from 'lucide-react';

import { UserImportModal } from '@/features/User/components/userImport/UserImportModal'; // ایمپورت مودال جدید

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

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // --- ✅ خطای شما اینجاست ---
    // ۱. این خط *باید* قبل از استفاده از متغیر `user` تعریف شده باشد.
    const user = useAppSelector(selectUser);

    // ۲. این خطوط از متغیر `user` که در بالا تعریف شد، استفاده می‌کنند.
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;

    // ۳. این خط جدیدی بود که اضافه شد و مستقیماً به `user` وابسته است.
    // اگر خط ۱ نباشد، این خط خطا می‌دهد.
    const canCreateUser = user?.roles?.some(
        r => ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(r)
    ) ?? false;

    const navigate = useNavigate();

    // --- ۱. مدیریت State صفحه‌بندی ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- ۲. مدیریت State جستجو ---
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- ۳. فچ کردن داده‌های سازمان (فقط برای نمایش نام) ---
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

    // --- ۴. فچ کردن داده‌های کاربران (بر اساس فیلترها) ---
    const {
        data: userResponse,
        isLoading: isLoadingUsers,
        isError,
        error
    } = useUsers({
        organization_id: organizationId,
        page: pageIndex + 1,
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
        pageCount: pageCount,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualFiltering: true,
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                {/* بخش جستجو و بازگشت */}
                <div className='flex items-center gap-2'>
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate('/organizations')}
                    >
                        <ArrowRight className="h-4 w-4 ml-2" />
                        بازگشت
                    </Button>

                    <div className="relative w-full max-w-sm">
                        <Input
                            label=''
                            placeholder="جستجو در نام، ایمیل، کد پرسنلی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                    </div>
                </div>

                {/* بخش دکمه‌ها (اصلاح شده در پاسخ قبلی) */}
                <div className="flex items-center gap-2">
                    {/* --- دکمه جدید ایمپورت (فقط برای Super Admin طبق داکیومنت) --- */}
                    {isSuperAdmin && (
                        <Button
                            variant="outline" // استایل متفاوت برای تمایز
                            size="md"
                            onClick={() => setIsImportModalOpen(true)}
                            className="gap-2 border-dashed border-primaryL text-primaryL hover:bg-primaryL/5"
                        >
                            <FileUp className="h-4 w-4" />
                            بارگذاری اکسل
                        </Button>
                    )}
                    {/* دکمه جدید: ایجاد کاربر */}
                    {canCreateUser && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(`/organizations/${organizationId}/create-user`)}
                        >
                            <UserPlus className="h-4 w-4 ml-2" />
                            ایجاد کارمند جدید
                        </Button>
                    )}

                    {/* دکمه تخصیص (فقط Super Admin) */}
                    {isSuperAdmin && (
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => navigate(`/organizations/${organizationId}/assign-user`)}
                        >
                            <UserPlus className="h-4 w-4 ml-2" />
                            تخصیص کارمند
                        </Button>
                    )}
                </div>
            </div>

            {/* کامپوننت جدول شما */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="کارمندی یافت نشد."
            />
            {/* --- رندر کردن مودال ایمپورت --- */}
            {isSuperAdmin && (
                <UserImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    organizationId={organizationId}
                    organizationName={organization?.name}
                />
            )}

            {/* کامپوننت صفحه‌بندی شما */}
            {pageCount > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}