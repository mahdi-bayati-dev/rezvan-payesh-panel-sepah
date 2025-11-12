// features/requests/routes/requestsPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table';

// کامپوننت‌های عمومی
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { type SelectOption } from '@/components/ui/SelectBox';
import { type DateObject } from 'react-multi-date-picker';

// موارد مخصوص فیچر
import { MOCK_REQUESTS } from '@/features/requests/data/mockData';
import { requestsColumns } from '@/features/requests/components/mainRequests/RequestsColumnDefs';
import RequestsFilter from '@/features/requests/components/mainRequests/RequestsFilter';

const RequestsPage = () => {
  // (استیت‌های جدول - بدون تغییر)
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // (استیت‌های فیلتر - بدون تغییر)
  const [globalFilter, setGlobalFilter] = useState('');
  const [organization, setOrganization] = useState<SelectOption | null>(null);
  const [category, setCategory] = useState<SelectOption | null>(null);
  const [requestType, setRequestType] = useState<SelectOption | null>(null); // استیت نوع مرخصی
  const [status, setStatus] = useState<SelectOption | null>(null);
  const [date, setDate] = useState<DateObject | null>(null);

  // (داده‌ها و ستون‌ها - بدون تغییر)
  const data = useMemo(() => MOCK_REQUESTS, []);
  const columns = useMemo(() => requestsColumns, []);

  // (مقداردهی اولیه جدول - بدون تغییر)
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  // (افکت اتصال فیلترها - بدون تغییر)
  useEffect(() => {
    const newFilters: ColumnFiltersState = [];

    if (globalFilter) {
      newFilters.push({ id: 'requester', value: globalFilter });
    }
    if (organization) {
      newFilters.push({ id: 'organization', value: organization.name });
    }
    if (category) {
      newFilters.push({ id: 'category', value: category.name });
    }
    if (requestType) { // فیلتر بر اساس استیت requestType
      newFilters.push({ id: 'requestType', value: requestType.name });
    }
    if (status) {
      newFilters.push({ id: 'status', value: status.name });
    }
    if (date) {
      newFilters.push({ id: 'date', value: date.format() });
    }

    setColumnFilters(newFilters);
  }, [
    globalFilter,
    organization,
    category,
    requestType,
    status,
    date,
    setColumnFilters,
  ]);

  return (
    <div className="flex flex-col md:flex-row-reverse ">
      {/* ستون فیلترها (سایدبار) */}
      <div className="w-full md:w-64 lg:w-72">
        {/* ✅✅✅ اصلاحیه باگ: نام Propها تصحیح شد */}
        <RequestsFilter
          organization={organization}
          onOrganizationChange={setOrganization}
          category={category}
          onCategoryChange={setCategory}

          // نام Prop از 'requestType' به 'leaveType' تغییر کرد
          leaveType={requestType}
          // نام Prop از 'onRequestTypeChange' به 'onLeaveTypeChange' تغییر کرد
          onLeaveTypeChange={setRequestType}

          status={status}
          onStatusChange={setStatus}
          date={date}
          onDateChange={setDate}
        />
      </div>

      {/* محتوای اصلی (جدول) - (بدون تغییر) */}
      <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD px-2 py-4">
        {/* (هدر جدول - بدون تغییر) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-borderD dark:text-borderL">
              درخواست ها
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
            {/* (اینپوت جستجو - بدون تغییر) */}
            <div className="relative w-full sm:w-60">
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="جستجو در مشخصات..."
                className="w-full py-1.5 px-3 pr-10 rounded-lg text-sm bg-inputL text-foregroundL border border-borderL focus:outline-none focus:ring-2 focus:ring-primaryL placeholder:text-muted-foregroundL dark:bg-inputD dark:text-foregroundD dark:border-borderD dark:focus:ring-primaryD dark:placeholder:text-muted-foregroundD"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* (جدول داده‌ها - بدون تغییر) */}
        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
          <DataTable table={table} />
        </div>

        {/* (صفحه‌بندی - بدون تغییر) */}
        <DataTablePagination table={table} />
      </main>
    </div>
  );
};

export default RequestsPage;