import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

interface EmployeeTableCardProps<TData> {
    title: string;
    icon: React.ReactNode;
    count: number;
    description: string;
    data: TData[];
    columns: ColumnDef<TData, any>[];
    isLoading: boolean;
    emptyMessage: string;
    headerClassName?: string;
}

export function EmployeeTableCard<TData>({
    title, icon, count, description, data, columns, isLoading, emptyMessage, headerClassName
}: EmployeeTableCardProps<TData>) {
    // هر جدول State Pagination مستقل خودش را دارد
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 6 });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { pagination },
        onPaginationChange: setPagination,
        // بهینه‌سازی: جلوگیری از رندرهای اضافی با تعیین rowId دقیق
        getRowId: (row: any) => String(row.id),
    });

    return (
        <Card className="rounded-xl shadow-sm border border-borderL dark:border-borderD overflow-hidden flex flex-col h-full min-h-[500px]">
            <CardHeader className={`pb-3 ${headerClassName || 'bg-secondaryL/20 dark:bg-secondaryD/10'}`}>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            {icon}
                            {title}
                        </CardTitle>
                        <p className="text-xs text-muted-foregroundL">{description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-backgroundD text-xs font-bold shadow-sm border border-borderL dark:border-borderD">
                        {toPersianDigits(count)} نفر
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1">
                    <DataTable
                        table={table}
                        isLoading={isLoading}
                        notFoundMessage={emptyMessage}

                    />
                </div>
                {table.getPageCount() > 1 && (
                    <div className="p-2 border-t border-borderL dark:border-borderD bg-secondaryL/5 dark:bg-secondaryD/5 mt-auto">
                        <DataTablePagination table={table} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};