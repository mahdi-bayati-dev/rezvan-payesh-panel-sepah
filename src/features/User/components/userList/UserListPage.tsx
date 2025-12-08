import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from "@tanstack/react-table";

// --- Redux & Hooks ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { useUsers } from '@/features/User/hooks/hook';
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';
import { useUserImportListener } from '@/features/User/hooks/useUserImportListener';

// --- Utils ---
// ✅ استفاده از تابع مشترک (ماژولار و تمیز)
import { normalizePaginationValue } from '@/features/User/utils/dateHelper';

// --- Components ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserImportModal } from '@/features/User/components/userImport/UserImportModal';
import { columns } from './UserTableColumns';

// --- Icons ---
import { Search, ArrowRight, Loader2, UserPlus, FileUp } from 'lucide-react';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// ❌ تابع normalizeMetaValue لوکال حذف شد (چون به numberHelper منتقل شد)

interface UserListPageProps {
    organizationId: number;
}

export function UserListPage({ organizationId }: UserListPageProps) {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);

    useUserImportListener();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const canCreateUser = user?.roles?.some(
        r => ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(r)
    ) ?? false;

    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

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

    // ✅ استفاده از Helper مشترک
    const totalRows = useMemo(() => {
        return normalizePaginationValue(userResponse?.meta?.total);
    }, [userResponse]);

    const pageCount = useMemo(() => {
        return normalizePaginationValue(userResponse?.meta?.last_page);
    }, [userResponse]);

    const table = useReactTable({
        data: users,
        columns,
        rowCount: totalRows, // ✅ این خط برای Server-Side Pagination حیاتی است
        pageCount: pageCount,

        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    if (isError) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-4 border border-red-100" dir="rtl">
                <h3 className="font-bold text-lg">خطا در بارگذاری کاربران</h3>
                <p className="mt-2 text-sm opacity-90">{(error as any)?.message || "خطای ناشناخته"}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* Header */}
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

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
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

                    {canCreateUser && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(`/organizations/${organizationId}/create-user`)}
                            className="w-full sm:w-auto shadow-lg shadow-primaryL/20"
                        >
                            <UserPlus className="h-4 w-4 ml-2" />
                            ایجاد کارمند جدید
                        </Button>
                    )}

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

            {/* Table */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="هیچ کارمندی یافت نشد."
            />

            {/* Pagination */}
            {totalRows > 0 && <DataTablePagination table={table} />}

            {/* Import Modal */}
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