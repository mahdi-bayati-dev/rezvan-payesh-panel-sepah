import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateObject } from "react-multi-date-picker";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnFiltersState,
    type PaginationState,
    // type FilterFn,
    type SortingState,
} from '@tanstack/react-table';
import { Search, Plus } from 'lucide-react';

// Components
// import Input from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { type SelectOption } from '@/components/ui/SelectBox';

// Features
import { type ActivityLog } from '../types';
import { mockActivityLogs } from '@/features/reports/data/mockData';
import { columns } from '@/features/reports/components/reportsPage/TableColumns';
import { ActivityFilters } from '@/features/reports/components/reportsPage/activityFilters';

// =============================
// 🔍 Global Filter Function
// =============================
// const globalFilterFn: FilterFn<ActivityLog> = (row,, value) => {
//     const filterValue = value.toLowerCase();
//     // const name = row.original.user.name.toLowerCase();
//     // const mobile = row.original.user.mobile.toLowerCase();
//     const area = row.original.trafficArea.toLowerCase();

//     return (
//         name.includes(filterValue) ||
//         mobile.includes(filterValue) ||
//         area.includes(filterValue)
//     );
// };

// =============================
// 🧾 Component
// =============================
export default function ActivityReportPage() {
    const [date, setDate] = useState<DateObject | null>(null); // ✅ ۲. استیت تاریخ اضافه شد

    const [data] = useState<ActivityLog[]>(() => [...mockActivityLogs]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const navigate = useNavigate()
    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(data.length / pageSize),
        state: { columnFilters, pagination, globalFilter, sorting },
        // globalFilterFn,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handelNewReport = () => {
        navigate('/reports/new')

    }

    // =============================
    // 🎛 Handle Column Filters
    // =============================
    const handleFilterChange = (filters: {
        activityType: SelectOption | null;
        trafficArea: SelectOption | null;
    }) => {
        const { activityType, trafficArea } = filters;

        table
            .getColumn('activityType')
            ?.setFilterValue(activityType?.id !== 'all' ? activityType?.id : '');

        table
            .getColumn('trafficArea')
            ?.setFilterValue(trafficArea?.id !== 'all' ? trafficArea?.name : '');
    };

    // =============================
    // 🧩 UI Layout
    // =============================
    return (
        <div className="flex flex-col md:flex-row-reverse gap-6 p-4 md:p-6">
            {/* Sidebar Filters */}
            <aside className=" mx-auto">
                <ActivityFilters date={date} onDateChange={setDate} onFilterChange={handleFilterChange} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 space-y-4 min-w-0">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                        گزارش آخرین فعالیت‌ها
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-60">
                            <input

                                type="text"
                                placeholder="جستجو در مشخصات..."
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="w-full pr-10 py-2 text-sm bg-inputL dark:bg-inputD text-foregroundL dark:text-foregroundD border border-borderL dark:border-borderD rounded-lg focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD"
                            />
                            <Search
                                size={18}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handelNewReport}
                            type="button"
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD transition-colors  dark:hover:bg-primaryD/90 text-sm font-medium hover:bg-successD-foreground cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span>ثبت فعالیت</span>
                        </button>
                    </div>
                </header>

                {/* Table */}
                <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                    <DataTable table={table} notFoundMessage="هیچ فعالیتی یافت نشد." />
                </section>

                {/* Pagination */}
                <DataTablePagination table={table} />
            </main>
        </div>
    );
}
