import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type PaginationState,
} from "@tanstack/react-table";
import { toast } from 'react-toastify';
import { Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- هوک‌ها و تایپ‌ها ---
import { type User } from '@/features/User/types/index';
import { useUsers } from '@/features/User/hooks/hook';
import { useRemoveEmployeeFromGroup } from '@/features/work-group/hooks/hook';

// --- کامپوننت‌های UI ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface AssignedEmployeesTableProps {
    groupId: number;
    groupName: string;
}

/**
 * جدول نمایش کارمندانی که در حال حاضر عضو گروه هستند.
 */
export default function AssignedEmployeesTable({ groupId, groupName }: AssignedEmployeesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
    const [modalUser, setModalUser] = useState<User | null>(null);

    // --- ۱. فچ کردن کارمندان عضو گروه ---
    const { data: userResponse, isLoading } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        work_group_id: groupId, // ✅ فیلتر: کارمندانی که work_group_id آن‌ها برابر با groupId است
        // search و role برای سادگی در اینجا حذف شده‌اند اما می‌توانند اضافه شوند.
    });

    const removeMutation = useRemoveEmployeeFromGroup();

    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

    // --- ۲. حذف کارمند از گروه ---
    const handleRemoveEmployee = (user: User) => {
        // ✅ اصلاح کلیدی: اطمینان از وجود employee.id
        if (!user.employee?.id) {
            toast.error("خطا: ID پروفایل کارمندی کاربر یافت نشد.");
            return;
        }
        removeMutation.mutate(
            // ✅ ارسال employee.id
            { groupId, employeeIds: [user.employee.id] },
            {
                // onSuccess اکنون پیام را از هوک دریافت می‌کند
                onSuccess: (message) => { 
                    toast.success(message);
                    setModalUser(null);
                },
                onError: (error) => {
                    // پیام خطا در هوک مدیریت می‌شود، اینجا فقط یک fallback است
                    toast.error(`خطا در حذف: ${(error as any)?.message || 'خطای سرور'}`);
                }
            }
        );
    };

    // --- ۳. تعریف ستون‌ها ---
    const columns: ColumnDef<User>[] = useMemo(() => [
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
            header: "حذف",
            cell: ({ row }) => (
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setModalUser(row.original); }}
                    // ✅ غیرفعال کردن اگر employee.id نباشد
                    disabled={removeMutation.isPending || !row.original.employee?.id}
                >
                    {removeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            ),
        },
    ], [removeMutation.isPending]);

    // --- ۴. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns,
        pageCount: pageCount,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    return (
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-xl shadow-inner border border-borderL dark:border-borderD">
            <DataTable
                table={table}
                isLoading={isLoading || removeMutation.isPending}
                notFoundMessage={`هیچ کارمندی در گروه "${groupName}" یافت نشد.`}
            />
            {pageCount > 0 && <DataTablePagination table={table} />}

            {/* مودال تأیید حذف */}
            <ConfirmationModal
                isOpen={!!modalUser}
                onClose={() => setModalUser(null)}
                onConfirm={() => modalUser && handleRemoveEmployee(modalUser)}
                title={`حذف کارمند از گروه: ${groupName}`}
                message={`آیا مطمئنید که می‌خواهید کارمند "${modalUser?.employee?.first_name} ${modalUser?.employee?.last_name}" را از این گروه حذف کنید؟`}
                confirmText={removeMutation.isPending ? "در حال حذف..." : "حذف کن"}
                variant="danger"
            />
        </div>
    );
}