import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type PaginationState,
} from "@tanstack/react-table";
import { UserX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { type User } from '@/features/User/types/index';
import { useUsers } from '@/features/User/hooks/hook';
import { useRemoveEmployeeFromGroup } from '@/features/work-group/hooks/hook';

import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface AssignedEmployeesTableProps {
    groupId: number;
    groupName: string;
}

export default function AssignedEmployeesTable({ groupId, groupName }: AssignedEmployeesTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
    const [userToRemove, setUserToRemove] = useState<User | null>(null);

    const { data: userResponse, isLoading } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        work_group_id: groupId,
    });

    const { mutate: removeEmployee, isPending: isRemoving } = useRemoveEmployeeFromGroup();

    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);

    const handleConfirmRemove = () => {
        if (!userToRemove?.employee?.id) return;

        removeEmployee(
            {
                groupId,
                payload: {
                    employee_ids: [userToRemove.employee.id],
                    action: 'detach'
                }
            },
            {
                onSuccess: () => setUserToRemove(null)
            }
        );
    };

    const columns: ColumnDef<User>[] = useMemo(() => [
        {
            accessorFn: (row) => `${row.employee?.first_name || ''} ${row.employee?.last_name || ''}`,
            id: "full_name",
            header: "نام سرباز",
            cell: ({ row }) => (
                <Link to={`/organizations/users/${row.original.id}`} className="font-medium text-foregroundL dark:text-foregroundD hover:text-primaryL dark:hover:text-primaryD transition-colors">
                    {row.getValue('full_name') as string || row.original.user_name}
                </Link>
            ),
        },
        {
            accessorFn: (row) => row.employee?.personnel_code,
            id: "personnel_code",
            header: "کد پرسنلی",
            cell: info => <span className="text-muted-foregroundL dark:text-muted-foregroundD">{info.getValue() as string || "---"}</span>,
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foregroundL hover:text-destructiveL hover:bg-destructiveL-background dark:hover:bg-destructiveD-background transition-colors"
                    onClick={(e) => { e.stopPropagation(); setUserToRemove(row.original); }}
                    disabled={isRemoving || !row.original.employee?.id}
                    title="حذف از گروه"
                >
                    <UserX className="h-4 w-4" />
                </Button>
            ),
        },
    ], [isRemoving]);

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
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-5 rounded-xl shadow-sm border border-borderL dark:border-borderD h-full">
            <DataTable
                table={table}
                isLoading={isLoading}
                notFoundMessage={`هیچ سربازی در گروه "${groupName}" عضو نیست.`}
            />

            {pageCount > 1 && <div className="mt-4"><DataTablePagination table={table} /></div>}

            <ConfirmationModal
                isOpen={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                onConfirm={handleConfirmRemove}
                title="حذف سرباز از گروه"
                message={
                    <>
                        <span>
                            آیا از حذف سرباز <strong className="text-destructiveL dark:text-destructiveD">{userToRemove?.employee?.first_name} {userToRemove?.employee?.last_name}</strong> از گروه <strong>{groupName}</strong> اطمینان دارید؟
                        </span>
                        <span className="block text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-2">
                            این سرباز پس از حذف در وضعیت "آزاد" قرار می‌گیرد.
                        </span>
                    </>
                }
                confirmText={isRemoving ? "در حال انجام..." : "بله، حذف شود"}
                variant="danger"
            />
        </div>
    );
}