import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
} from "@tanstack/react-table";
import { toast } from 'react-toastify';
import { Loader2, UserPlus, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- هوک‌ها و تایپ‌ها ---
import { type User } from '@/features/User/types/index';
import { useUsers } from '@/features/User/hooks/hook';
import { useAddEmployeeToGroup } from '@/features/work-group/hooks/hook';

// --- کامپوننت‌های UI ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface AvailableEmployeesTableProps {
    groupId: number;
    groupName: string;
}

// (هوک Debounce)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


/**
 * جدول نمایش کارمندانی که در حال حاضر عضو گروه نیستند.
 */
// ✅ حل خطای TS6133: groupName با _ جایگزین شد چون استفاده نمی‌شود
export default function AvailableEmployeesTable({ groupId, groupName: _groupName }: AvailableEmployeesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- ۱. فچ کردن کارمندان خارج از گروه ---
    const { data: userResponse, isLoading, } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search: debouncedSearch,
        // ✅ استفاده از فیلتر جدید (کارمندان آزاد)
        is_not_assigned_to_group: true,
    });

    const addMutation = useAddEmployeeToGroup();
    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

    // ✅ تعریف selectedCount
    const selectedCount = Object.keys(rowSelection).length;

    // --- ۲. افزودن دسته‌ای / تکی کارمند به گروه ---
    const handleAddEmployees = (employeeIds: number[]) => {
        if (employeeIds.length === 0) return;

        addMutation.mutate(
            { groupId, employeeIds },
            {
                // onSuccess اکنون پیام را از هوک دریافت می‌کند
                onSuccess: (message) => {
                    toast.success(message);
                    setRowSelection({}); // پاک کردن انتخاب‌ها
                },
                onError: (error) => {
                    // پیام خطا در هوک مدیریت می‌شود، اینجا فقط یک fallback است
                    toast.error(`خطا در افزودن: ${(error as any)?.message || 'خطای سرور'}`);
                }
            }
        );
    };

    // افزودن تکی (از دکمه درون ردیف)
    const handleAddSingleEmployee = (user: User) => {
        // ✅ اصلاح کلیدی: اطمینان از وجود employee.id
        if (!user.employee?.id) {
            toast.error("پروفایل کارمندی یا ID کارمند یافت نشد.");
            return;
        }
        // ✅ ارسال employee.id
        handleAddEmployees([user.employee.id]);
    };

    // افزودن انتخابی (از دکمه بالا)
    const handleAddSelectedEmployees = () => {
        // ✅ اصلاح کلیدی: جمع‌آوری employee.id از ردیف‌های انتخاب شده
        const selectedEmployeeIds = Object.keys(rowSelection)
            .map(Number)
            .map(index => users[index]?.employee?.id)
            .filter((id): id is number => id !== undefined && id !== null);

        if (selectedEmployeeIds.length > 0) {
            handleAddEmployees(selectedEmployeeIds);
        } else {
            toast.warn("هیچ کارمند دارای پروفایل برای افزودن انتخاب نشده است.");
        }
    };

    // --- ۳. تعریف ستون‌ها ---
    const columns: ColumnDef<User>[] = useMemo(() => [
        // ستون Checkbox
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
                    aria-label="Select all"
                    className="w-4 h-4 rounded text-primaryL focus:ring-primaryL"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={(value) => row.toggleSelected(!!value.target.checked)}
                    aria-label="Select row"
                    className="w-4 h-4 rounded text-primaryL focus:ring-primaryL"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorFn: (row) => `${row.employee?.first_name || ''} ${row.employee?.last_name || ''}`,
            id: "full_name",
            header: "نام کارمند",
            cell: ({ row }) => (
                <Link to={`/organizations/users/${row.original.id}`} className="font-medium hover:text-primaryL dark:hover:text-primaryD transition-colors">
                    {row.getValue('full_name') as string || row.original.user_name}
                </Link>
            ),
        },
        {
            accessorFn: (row) => row.employee?.personnel_code,
            id: "personnel_code",
            header: "کد پرسنلی",
            cell: info => info.getValue() || "---",
        },
        {
            id: "actions",
            header: "افزودن",
            cell: ({ row }) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAddSingleEmployee(row.original); }}
                    disabled={addMutation.isPending || !row.original.employee?.id} // غیرفعال کردن اگر employee.id نباشد
                    className='w-20 justify-center'
                >
                    {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                </Button>
            ),
        },
    ], [addMutation.isPending]);


    // --- ۴. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns,
        pageCount: pageCount,
        state: { pagination, rowSelection },
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        manualPagination: true,
        manualFiltering: true,
    });

    return (
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-xl shadow-inner border border-borderL dark:border-borderD space-y-4">
            {/* نوار ابزار بالا (جستجو و دکمه افزودن دسته‌ای) */}
            <div className="flex justify-between items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Input
                        label=''
                        placeholder="جستجو در کارمندان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                </div>

                <Button
                    variant="primary"
                    onClick={handleAddSelectedEmployees}
                    disabled={selectedCount === 0 || addMutation.isPending}
                >
                    {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                    {selectedCount > 0 ? `افزودن ${selectedCount} کارمند` : "افزودن انتخاب‌شده‌ها"}
                </Button>
            </div>

            <DataTable
                table={table}
                isLoading={isLoading || addMutation.isPending}
                notFoundMessage="هیچ کارمند آزادی برای افزودن یافت نشد."
            />
            {pageCount > 0 && <DataTablePagination table={table} />}
        </div>
    );
}