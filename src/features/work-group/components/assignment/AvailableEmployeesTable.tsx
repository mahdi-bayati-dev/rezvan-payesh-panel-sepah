import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
} from "@tanstack/react-table";
import { Loader2, UserPlus, Check, Search, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface AvailableEmployeesTableProps {
    groupId: number;
    groupName: string;
}

// هوک Debounce برای بهینه‌سازی جستجو
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

export default function AvailableEmployeesTable({ groupId }: AvailableEmployeesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
    // در اینجا keys آبجکت rowSelection برابر با employee.id خواهند بود (نه ایندکس)
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // 1. دریافت لیست کارمندان آزاد (بدون گروه)
    const { data: userResponse, isLoading } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search: debouncedSearch,
        is_not_assigned_to_group: true, // فیلتر بسیار مهم سمت سرور
    });

    const { mutate: addEmployees, isPending: isAdding } = useAddEmployeeToGroup();

    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

    // تعداد آیتم‌های انتخاب شده
    const selectedCount = Object.keys(rowSelection).length;

    // --- هندلر افزودن ---
    const handleAddEmployees = (ids: number[]) => {
        addEmployees(
            {
                groupId,
                payload: {
                    employee_ids: ids,
                    action: 'attach'
                }
            },
            {
                onSuccess: () => {
                    setRowSelection({}); // پاک کردن انتخاب‌ها پس از موفقیت
                }
            }
        );
    };

    // افزودن دسته‌ای (Bulk Action)
    const handleAddSelectedEmployees = () => {
        // چون getRowId را تنظیم کردیم، کلیدهای rowSelection همان employeeId هستند
        const selectedIds = Object.keys(rowSelection).map(Number);
        handleAddEmployees(selectedIds);
    };

    // --- تعریف ستون‌ها ---
    const columns: ColumnDef<User>[] = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                    className="w-4 h-4 rounded accent-primaryL dark:accent-primaryD cursor-pointer"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={(e) => row.toggleSelected(!!e.target.checked)}
                    className="w-4 h-4 rounded accent-primaryL dark:accent-primaryD cursor-pointer disabled:opacity-50"
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
                <div className="flex flex-col">
                    <Link to={`/organizations/users/${row.original.id}`} className="font-medium hover:text-primaryL dark:hover:text-primaryD transition-colors">
                        {row.getValue('full_name') as string || row.original.user_name}
                    </Link>
                    {!row.original.employee && (
                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            فاقد پروفایل کارمندی
                        </span>
                    )}
                </div>
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
            header: "عملیات",
            cell: ({ row }) => {
                const empId = row.original.employee?.id;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        // جلوگیری از کلیک روی دکمه وقتی در حال افزودن هستیم یا پروفایل ناقص است
                        disabled={isAdding || !empId}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (empId) handleAddEmployees([empId]);
                        }}
                        className="hover:bg-primaryL hover:text-white dark:hover:bg-primaryD transition-colors"
                    >
                        {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                        <span className="ml-1 text-xs">افزودن</span>
                    </Button>
                );
            },
        },
    ], [isAdding]); // فقط وقتی وضعیت لودینگ تغییر کرد ستون‌ها را بازسازی کن

    // --- تنظیمات جدول ---
    const table = useReactTable({
        data: users,
        columns,
        pageCount: pageCount,
        state: { pagination, rowSelection },
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        
        // ✅✅✅ نکته حیاتی: تعریف شناسه منحصر به فرد برای هر سطر بر اساس Employee ID
        // این کار باعث می‌شود selection state با مقادیر واقعی کار کند نه ایندکس آرایه
        getRowId: (row) => row.employee?.id ? String(row.employee.id) : `user-${row.id}`,
        
        // غیرفعال کردن انتخاب برای کاربرانی که employee profile ندارند
        enableRowSelection: (row) => !!row.original.employee?.id,
    });

    return (
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-5 rounded-xl shadow-sm border border-borderL dark:border-borderD space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-xs">
                    <Input
                        label=""
                        placeholder="جستجو (نام، کد پرسنلی)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-9"
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                </div>

                {selectedCount > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                            {selectedCount} کارمند انتخاب شده
                        </span>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddSelectedEmployees}
                            disabled={isAdding}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                            افزودن گروهی
                        </Button>
                    </div>
                )}
            </div>

            {/* راهنما برای حالت خالی بودن */}
            {!isLoading && users.length === 0 && (
                <Alert className="bg-muted/50 border-none">
                    <AlertDescription className="flex items-center text-muted-foregroundL">
                        <AlertCircle className="h-4 w-4 ml-2" />
                        هیچ کارمند آزادی یافت نشد. تمام کارمندان دارای پروفایل، هم‌اکنون عضو گروه‌های کاری هستند.
                    </AlertDescription>
                </Alert>
            )}

            <DataTable
                table={table}
                isLoading={isLoading}
                notFoundMessage="کارمندی یافت نشد."
            />
            
            {pageCount > 1 && <div className="mt-4"><DataTablePagination table={table} /></div>}
        </div>
    );
}