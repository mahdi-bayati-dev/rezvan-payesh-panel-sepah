import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    // getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";

// --- Redux & Hooks ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { useUsers } from '@/features/User/hooks/hook';
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';

// ✅ هوک برای آپدیت لحظه‌ای (سوکت)
import { useUserImportListener } from '@/features/User/hooks/useUserImportListener';

// --- Components ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserImportModal } from '@/features/User/components/userImport/UserImportModal';
import { columns } from './UserTableColumns';

// --- Icons ---
import { Search, ArrowRight, Loader2, UserPlus, FileUp } from 'lucide-react';

// (هوک Debounce داخلی برای بهینه‌سازی جستجو)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// ✅ تابع کمکی برای نرمال‌سازی داده‌های متا (حل مشکل آرایه بودن [42, 42])
const normalizeMetaValue = (value: any): number => {
    if (Array.isArray(value)) {
        // اگر آرایه بود، مقدار اول را برگردان
        return Number(value[0]) || 0;
    }
    // اگر عدد یا رشته بود، تبدیل کن و برگردان
    return Number(value) || 0;
};

interface UserListPageProps {
    organizationId: number;
}

/**
 * صفحه لیست کاربران سازمان
 */
export function UserListPage({ organizationId }: UserListPageProps) {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);

    // فعال‌سازی لیسنر سوکت برای رفرش خودکار پس از ایمپورت
    useUserImportListener();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // --- استیت‌های جدول (سمت کلاینت) ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- بررسی دسترسی‌ها ---
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const canCreateUser = user?.roles?.some(
        r => ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(r)
    ) ?? false;

    // --- دریافت اطلاعات خود سازمان ---
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

    // --- 🔥 دریافت لیست کاربران (Server-Side Pagination) ---
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

    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);

    // ✅ دریافت و نرمال‌سازی تعداد کل رکوردها
    const totalRows = useMemo(() => {
        return normalizeMetaValue(userResponse?.meta?.total);
    }, [userResponse]);

    // ✅ دریافت و نرمال‌سازی تعداد کل صفحات
    const pageCount = useMemo(() => {
        return normalizeMetaValue(userResponse?.meta?.last_page);
    }, [userResponse]);

    // --- تنظیمات جدول ---
    const table = useReactTable({
        data: users,
        columns,
        // پاس دادن مقادیر نرمال‌سازی شده
        rowCount: totalRows,
        pageCount: pageCount,

        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

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
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL flex items-center gap-2">
                        {isLoadingOrg ? <Loader2 className="h-6 w-6 animate-spin" /> : `کارمندان: ${organization?.name}`}
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        لیست کارمندان تخصیص‌یافته به این واحد سازمانی.
                    </p>
                </div>
            </div>

            {/* نوار ابزار */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                <div className='flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto'>
                    <Button variant="outline" size="md" onClick={() => navigate('/organizations')} className="w-full sm:w-auto">
                        <ArrowRight className="h-4 w-4 ml-2" />
                        بازگشت
                    </Button>

                    <div className="relative w-full sm:w-80">
                        <Input
                            label=''
                            placeholder="جستجو (نام، ایمیل، کد ملی...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
                    {/* دکمه ایمپورت اکسل */}
                    {isSuperAdmin && (
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setIsImportModalOpen(true)}
                            className="gap-2 border-dashed border-primaryL text-primaryL hover:bg-primaryL/5 w-full sm:w-auto"
                        >
                            <FileUp className="h-4 w-4" />
                            بارگذاری اکسل
                        </Button>
                    )}

                    {/* دکمه ایجاد کاربر */}
                    {canCreateUser && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(`/organizations/${organizationId}/create-user`)}
                            className="w-full sm:w-auto"
                        >
                            <UserPlus className="h-4 w-4 ml-2" />
                            ایجاد کارمند جدید
                        </Button>
                    )}

                    {/* دکمه تخصیص کاربر */}
                    {isSuperAdmin && (
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => navigate(`/organizations/${organizationId}/assign-user`)}
                            className="w-full sm:w-auto"
                        >
                            <UserPlus className="h-4 w-4 ml-2" />
                            تخصیص کارمند
                        </Button>
                    )}
                </div>
            </div>

            {/* جدول */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="هیچ کارمندی یافت نشد."
            />

            {/* ✅ حالا totalRows یک عدد صحیح است و شرط به درستی کار می‌کند */}
            {totalRows > 0 && <DataTablePagination table={table} />}

            {/* مودال ایمپورت */}
            {isSuperAdmin && (
                <UserImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    organizationId={organizationId}
                    organizationName={organization?.name}
                />
            )}
        </div>
    );
}