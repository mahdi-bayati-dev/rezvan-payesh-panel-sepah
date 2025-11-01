
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    // getFilteredRowModel,
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
} from "@tanstack/react-table";
import { toast } from 'react-toastify'; // (اگر از toast استفاده می‌کنید)

// --- ۱. هوک‌های Redux برای بررسی نقش کاربر ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- ۲. کامپوننت‌های UI شما ---
// (لطفاً مسیرها را بر اساس ساختار پروژه خودتان تنظیم کنید)
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button'; // (فرض می‌کنم کامپوننت Button دارید)
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// --- ۳. هوک‌ها و تایپ‌هایی که ساختیم ---
import { type User } from '@/features/User/types/index';
import { useUsers, useUpdateUserOrganization } from '@/features/User/hooks/hook';
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';

// --- آیکون‌ها ---
import { Search, ArrowRight, Loader2, UserPlus, Check, Info } from 'lucide-react';

// (هوک Debounce که در UserListPage هم استفاده کردیم)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


/**
 * این صفحه در مسیر /organizations/:id/assign-user رندر می‌شود
 * و فقط برای Super Admin قابل دسترسی است.
 */
function AssignUserPage() {
    const navigate = useNavigate();

    // --- ۱. بررسی دسترسی (فقط Super Admin) ---
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;

    // --- ۲. گرفتن ID سازمان از URL ---
    const { id } = useParams<{ id: string }>();
    // (مطمئن می‌شویم که id عددی و معتبر است)
    const organizationId = useMemo(() => id ? Number(id) : NaN, [id]);

    // --- ۳. Stateهای داخلی ---
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [searchTerm, setSearchTerm] = useState("");
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({}); // State برای Checkboxها
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({}); // State برای دکمه‌های "افزودن"

    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- ۴. فچ کردن داده‌ها ---

    // گرفتن نام سازمان (برای نمایش در هدر)
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);
    const organizationName = organization?.name || "...";

    // فچ کردن لیست *همه* کاربران (چون organization_id پاس نمی‌دهیم)
    const {
        data: userResponse,
        isLoading: isLoadingUsers,
    } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search: debouncedSearch,
        // organization_id را پاس *نمی‌دهیم* تا همه کاربران را جستجو کند
    });

    // --- ۵. راه‌اندازی Mutation ---
    const assignMutation = useUpdateUserOrganization();

    // --- ۶. تعریف ستون‌های جدول (مخصوص این صفحه) ---

    // تابع برای افزودن تکی کاربر
    const handleAssignUser = (userId: number) => {
        setLoadingStates(prev => ({ ...prev, [userId]: true })); // فعال کردن لودینگ دکمه

        assignMutation.mutate(
            { userId, organizationId },
            {
                onSuccess: (updatedUser) => {
                    toast.success(`کاربر "${updatedUser.employee?.first_name}" با موفقیت به سازمان "${organizationName}" افزوده شد.`);
                    // (invalidateQueries در خود هوک انجام می‌شود و جدول رفرش می‌شود)
                },
                onError: (err) => {
                    toast.error(`خطا: ${(err as Error).message}`);
                },
                onSettled: () => {
                    setLoadingStates(prev => ({ ...prev, [userId]: false })); // غیرفعال کردن لودینگ
                }
            }
        );
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
        // ستون Checkbox برای انتخاب جمعی
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
                    aria-label="Select all"
                    className="w-4 h-4"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={(value) => row.toggleSelected(!!value.target.checked)}
                    aria-label="Select row"
                    className="w-4 h-4"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // ستون اطلاعات کاربر
        {
            header: 'کاربر',
            cell: ({ row }) => {
                const user = row.original;
                const displayName = (user.employee?.first_name || user.employee?.last_name)
                    ? `${user.employee.first_name || ''} ${user.employee.last_name || ''}`.trim()
                    : user.user_name;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">{user.email}</span>
                    </div>
                );
            },
        },
        // ستون سازمان فعلی
        {
            header: 'سازمان فعلی',
            accessorFn: (row) => row.employee?.organization?.name,
            cell: info => info.getValue() || <span className="text-xs italic text-muted-foregroundL">سازمان ندارد</span>,
        },
        // ستون عملیات (افزودن تکی)
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;
                const isLoading = loadingStates[user.id] || assignMutation.isPending && loadingStates[user.id]; // لودینگ تکی
                const isAlreadyInOrg = user.employee?.organization?.id === organizationId;

                return (
                    <Button
                        size="sm"
                        variant={isAlreadyInOrg ? "outline" : "primary"}
                        disabled={isAlreadyInOrg || isLoading}
                        onClick={() => handleAssignUser(user.id)}
                        className="w-32" // (برای جلوگیری از پرش متن)
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            isAlreadyInOrg ? <Check className="h-4 w-4" /> :
                                <UserPlus className="h-4 w-4" />}

                        <span className="mr-2">
                            {isLoading ? "..." : isAlreadyInOrg ? "تخصیص یافته" : "افزودن"}
                        </span>
                    </Button>
                );
            },
        },
    ], [organizationId, assignMutation.isPending, loadingStates]); // (وابستگی‌ها)

    // --- ۷. راه‌اندازی TanStack Table ---
    const table = useReactTable({

        data: userResponse?.data ?? [],
        columns,
        pageCount: userResponse?.meta.last_page ?? 0,
        state: {
            pagination,
            rowSelection, // اتصال State Checkboxها
        },
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection, // اتصال آپدیت Checkboxها
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true, // فعال‌سازی انتخاب ردیفی
        manualPagination: true,
        manualFiltering: true,
    });

    // --- ۸. مدیریت افزودن "جمعی" ---
    const handleAssignSelected = () => {
        const selectedUserIds = Object.keys(rowSelection)
            .map(Number)
            .map(index => table.getRowModel().rows[index]?.original.id)
            .filter(id => id !== undefined);

        if (selectedUserIds.length === 0) {
            toast.warn("ابتدا حداقل یک کاربر را انتخاب کنید.");
            return;
        }

        // (فعال کردن لودینگ برای همه دکمه‌های انتخاب شده)
        const newLoadingStates: Record<number, boolean> = {};
        selectedUserIds.forEach(id => { newLoadingStates[id] = true; });
        setLoadingStates(newLoadingStates);

        // اجرای Mutationها به صورت همزمان
        const promises = selectedUserIds.map(userId =>
            assignMutation.mutateAsync({ userId, organizationId })
        );

        Promise.allSettled(promises)
            .then(results => {
                const successCount = results.filter(r => r.status === 'fulfilled').length;
                const errorCount = results.filter(r => r.status === 'rejected').length;

                if (successCount > 0) toast.success(`${successCount} کاربر با موفقیت تخصیص یافتند.`);
                if (errorCount > 0) toast.error(`${errorCount} مورد با خطا مواجه شد.`);
            })
            .finally(() => {
                setLoadingStates({}); // پاکسازی همه لودینگ‌ها
                setRowSelection({}); // پاکسازی انتخاب
            });
    };

    // --- ۹. رندر نهایی ---

    // اگر کاربر Super Admin نباشد
    if (!isSuperAdmin) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>عدم دسترسی</AlertTitle>
                    <AlertDescription>
                        شما دسترسی لازم (Super Admin) برای تخصیص کاربران به سازمان‌ها را ندارید.
                        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                            بازگشت
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // اگر ID سازمان نامعتبر باشد
    if (isNaN(organizationId)) {
        return <div className="p-8 text-center text-red-600" dir="rtl">خطا: ID سازمان نامعتبر است.</div>;
    }

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-borderL">
                        {isLoadingOrg ? <Loader2 className="h-6 w-6 animate-spin" /> : `تخصیص کاربر به: ${organizationName}`}
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        لیست همه کاربران سیستم. کاربران مورد نظر را انتخاب و اضافه کنید.
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>

            {/* نوار ابزار */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Input
                        label=''
                        placeholder="جستجو در همه کاربران..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                </div>
                <Button
                    variant="primary"
                    onClick={handleAssignSelected}
                    disabled={selectedCount === 0 || assignMutation.isPending}
                    className="bg-primaryL text-white dark:bg-primaryD"
                >
                    {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <UserPlus className="h-4 w-4 ml-2" />}
                    {selectedCount > 0 ? `افزودن ${selectedCount} کاربر انتخاب شده` : "افزودن کاربران انتخاب شده"}
                </Button>
            </div>

            {/* جدول */}
            <DataTable
                table={table}
                isLoading={isLoadingUsers}
                notFoundMessage="هیچ کاربری یافت نشد."
            />

            {/* صفحه‌بندی */}
            {userResponse && userResponse.meta.last_page > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}

export default AssignUserPage;


