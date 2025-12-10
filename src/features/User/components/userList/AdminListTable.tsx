import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, type PaginationState } from "@tanstack/react-table";
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { columns } from '@/features/User/components/userList/UserTableColumns';
import { useUsers } from '@/features/User/hooks/hook';
import { type FetchUsersParams } from '@/features/User/types';
import { normalizePaginationValue } from '@/features/User/utils/dateHelper';

interface AdminListTableProps {
    role: string;
    globalSearch: string;
}

export function AdminListTable({ role, globalSearch }: AdminListTableProps) {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const fetchParams: FetchUsersParams = {
        page: pageIndex + 1,
        per_page: pageSize,
        search: globalSearch,
        role: role,
    };

    const { data: userResponse, isLoading: isLoadingUsers, isError, error } = useUsers(fetchParams);
    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => normalizePaginationValue(userResponse?.meta?.last_page), [userResponse]);
    const totalRows = useMemo(() => normalizePaginationValue(userResponse?.meta?.total), [userResponse]);

    const table = useReactTable({
        data: users,
        columns,
        pageCount: pageCount,
        rowCount: totalRows,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    if (isError) {
        return (
            <div className="p-8 text-center text-destructiveL-foreground font-bold bg-destructiveL-background rounded-lg border border-destructiveL-foreground/10">
                <h3>خطا در بارگذاری لیست</h3>
                <p className="text-sm mt-2">{(error as any)?.message || "خطای ناشناخته در ارتباط با سرور"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <DataTable table={table} isLoading={isLoadingUsers} notFoundMessage="کاربری با این مشخصات یافت نشد." />
            {totalRows > 0 && <DataTablePagination table={table} />}
        </div>
    );
}