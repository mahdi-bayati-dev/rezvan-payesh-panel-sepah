// features/requests/requestsPage.tsx

import { useState, useMemo, useEffect } from 'react'; // ۱. useEffect را اضافه کنید
import { Search, CirclePlus } from 'lucide-react';

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
import { type SelectOption } from '@/components/ui/SelectBox'; // ۲. تایپ SelectOption را وارد کنید
import { type DateObject } from 'react-multi-date-picker'; // ✅ ۱. ایمپورت تایپ DateObject

// موارد مخصوص فیچر
import { MOCK_REQUESTS } from '@/features/requests/data/mockData';
import { requestsColumns } from '@/features/requests/components/RequestsColumnDefs';
import RequestsFilter from '@/features/requests/components/RequestsFilter'; // ۳. کامپوننت فیلتر را وارد کنید

const RequestsPage = () => {
  // --- مدیریت State ها برای جدول ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [date, setDate] = useState<DateObject | null>(null); // ✅ ۲. استیت تاریخ اضافه شد

  // --- ۴. مدیریت State ها برای فیلترها (Lifting State Up) ---
  const [globalFilter, setGlobalFilter] = useState(''); // فیلتر جستجوی عمومی
  const [organization, setOrganization] = useState<SelectOption | null>(null);
  const [category, setCategory] = useState<SelectOption | null>(null);
  const [requestType, setRequestType] = useState<SelectOption | null>(null);
  const [status, setStatus] = useState<SelectOption | null>(null);

  // داده‌ها و ستون‌ها
  const data = useMemo(() => MOCK_REQUESTS, []);
  const columns = useMemo(() => requestsColumns, []);

  // --- مقداردهی اولیه جدول ---
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters, // اتصال state فیلتر ستون‌ها
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, // اتصال setter
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });



  // --- ۵. اتصال فیلترها به جدول ---
  useEffect(() => {
    const newFilters: ColumnFiltersState = [];


    // الف) فیلتر جستجوی عمومی (فقط در صورتی که مقداری داشته باشد)
    if (globalFilter) {
      newFilters.push({ id: 'requester', value: globalFilter });
    }

    // ب) فیلترهای SelectBox (اینها از قبل درست بودند)
    if (organization) {
      // (accessorKey ستون سازمان 'organization' است)
      newFilters.push({ id: 'organization', value: organization.name });
    }
    if (category) {
      // (accessorKey ستون دسته‌بندی 'category' است)
      newFilters.push({ id: 'category', value: category.name });
    }
    if (requestType) {
      // (accessorKey ستون نوع 'requestType' است)
      newFilters.push({ id: 'requestType', value: requestType.name });
    }
    if (status) {
      // (accessorKey ستون وضعیت 'status' است)
      newFilters.push({ id: 'status', value: status.name });
    }
    if (date) {
      // نکته: این فیلتر زمانی کار می‌کند که فرمت تاریخ در MOCK_REQUESTS
      // با فرمت خروجی date.format() (یعنی "YYYY/MM/DD") یکی باشد.
      newFilters.push({ id: 'date', value: date.format() });
    }

    // ج) اعمال همزمان همه‌ی فیلترها
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
    // ۶. تغییر لایه‌بندی صفحه برای نمایش ستون فیلتر
    <div className="flex flex-col md:flex-row-reverse  ">
      {/* ستون فیلترها (سایدبار) */}
      <div className="w-full md:w-64 lg:w-72">
        <RequestsFilter
          organization={organization}
          onOrganizationChange={setOrganization}
          category={category}
          onCategoryChange={setCategory}
          requestType={requestType}
          onRequestTypeChange={setRequestType}
          status={status}
          onStatusChange={setStatus}
          date={date}
          onDateChange={setDate}
        />
      </div>

      {/* محتوای اصلی (جدول) */}
      <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-2 py-4">
        {/* هدر جدول (جستجو و دکمه جدید) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-borderD dark:text-borderL">
              درخواست ها
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
            {/* اینپوت جستجو */}
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

            <button className="bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-blue hover:text-backgroundL-500 text-sm justify-center">
              <CirclePlus size={20} /> درخواست جدید
            </button>
          </div>
        </div>

        {/* جدول داده‌ها */}
        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
          <DataTable table={table} />
        </div>

        {/* صفحه‌بندی */}
        <DataTablePagination table={table} />
      </main>
    </div>

  );
};

export default RequestsPage;