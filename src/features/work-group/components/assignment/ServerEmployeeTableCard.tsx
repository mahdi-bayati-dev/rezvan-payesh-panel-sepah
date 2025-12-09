import {
    useReactTable,
    getCoreRowModel,
    type ColumnDef,
    type PaginationState,
    type OnChangeFn,
    type RowSelectionState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface BulkActionProps {
    label: string;
    onClick: () => void;
    isLoading: boolean;
    variant?: 'primary' | 'destructive';
}

interface ServerEmployeeTableCardProps<TData> {
    title: string;
    icon: React.ReactNode;
    count: number;
    description: string;
    data: TData[];
    columns: ColumnDef<TData, any>[];
    isLoading: boolean;
    emptyMessage: string;
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: OnChangeFn<PaginationState>;
    headerClassName?: string;
    rowSelection: RowSelectionState;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
    bulkAction?: BulkActionProps;
}

export function ServerEmployeeTableCard<TData extends { id: number; employee?: { id: number } | null }>({
    title,
    icon,
    count,
    description,
    data,
    columns,
    isLoading,
    emptyMessage,
    pageCount,
    pagination,
    onPaginationChange,
    headerClassName,
    rowSelection,
    onRowSelectionChange,
    bulkAction,
}: ServerEmployeeTableCardProps<TData>) {

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: { pagination, rowSelection },
        onPaginationChange: onPaginationChange,
        onRowSelectionChange: onRowSelectionChange,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.employee?.id || row.id),
        enableRowSelection: (row) => !!row.original.employee?.id,
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <Card className="rounded-xl shadow-sm border border-borderL dark:border-borderD overflow-hidden flex flex-col h-full min-h-[500px] transition-all duration-200 hover:shadow-md bg-backgroundL-500 dark:bg-backgroundD">
            <CardHeader className={clsx("pb-3 border-b border-borderL/50 dark:border-borderD/50", headerClassName || 'bg-secondaryL/10 dark:bg-secondaryD/10')}>
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                                {icon}
                                {title}
                            </CardTitle>
                            <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD leading-relaxed opacity-90">{description}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-backgroundL-500 dark:bg-backgroundD text-xs font-bold shadow-sm border border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD">
                            {toPersianDigits(count)} نفر
                        </span>
                    </div>

                    {selectedCount > 0 && bulkAction && (
                        <div className="flex items-center justify-between bg-backgroundL-500/50 dark:bg-black/20 p-2 rounded-lg animate-in fade-in slide-in-from-top-1 border border-borderL/50 dark:border-borderD/50">
                            <span className="text-xs font-medium text-foregroundL dark:text-foregroundD mr-1">
                                {toPersianDigits(selectedCount)} مورد انتخاب شده
                            </span>
                            <Button
                                size="sm"
                                variant={bulkAction.variant || 'primary'}
                                onClick={bulkAction.onClick}
                                disabled={bulkAction.isLoading}
                                className="h-7 text-xs px-3"
                            >
                                {bulkAction.isLoading && <Loader2 className="w-3 h-3 ml-1.5 animate-spin" />}
                                {bulkAction.label}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col bg-backgroundL-500/50 dark:bg-backgroundD/50">
                <div className="flex-1">
                    <DataTable
                        table={table}
                        isLoading={isLoading}
                        notFoundMessage={emptyMessage}
                        skeletonRowCount={6}
                    />
                </div>
                {(pageCount > 1 || isLoading) && (
                    <div className="p-2 border-t border-borderL dark:border-borderD bg-secondaryL/5 dark:bg-secondaryD/5 mt-auto backdrop-blur-sm">
                        <DataTablePagination table={table} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};