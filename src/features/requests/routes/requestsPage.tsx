// features/requests/requestsPage.tsx
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel, // برای صفحه‌بندی کلاینت-ساید
  getSortedRowModel, // برای مرتب‌سازی کلاینت-ساید
  getFilteredRowModel, // برای فیلتر کلاینت-ساید
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table';

// وارد کردن کامپوننت‌های عمومی
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';

// وارد کردن موارد مخصوص این فیچر
import { MOCK_REQUESTS } from '@/features/requests//data/mockData';
import { requestsColumns } from '@/features/requests/components/RequestsColumnDefs';
// import { RequestsFilters } from './components/RequestsFilters';

const RequestsPage = () => {
  // --- مدیریت State ها برای کلاینت-ساید ---
  // (وقتی API بیاید، اینها به state های سرورساید تبدیل می‌شوند)

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // صفحه اول
    pageSize: 10,  // نمایش 10 مورد
  });

  // استفاده از useMemo برای جلوگیری از رندر مجدد داده‌ها و ستون‌ها
  const data = useMemo(() => MOCK_REQUESTS, []);
  const columns = useMemo(() => requestsColumns, []);

  // --- مقداردهی اولیه TanStack Table ---
  const table = useReactTable({
    data: data, // داده‌های فیک
    columns: columns, // ستون‌های تعریف شده

    // --- فعال‌سازی پردازش کلاینت-ساید ---
    // اینها توابع کمکی هستند که جدول خودش آنها را اجرا می‌کند
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // فعال‌سازی صفحه‌بندی
    getSortedRowModel: getSortedRowModel(), // فعال‌سازی مرتب‌سازی
    getFilteredRowModel: getFilteredRowModel(), // فعال‌سازی فیلترینگ

    // --- اتصال State ها ---
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },

    // --- آپدیت کردن State ها ---
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,

    // فعال کردن انتخاب سطر (اختیاری)
    enableRowSelection: true,
  });

  // یک state ساده برای جستجوی گلوبال (مثل فیگما)
  const [globalFilter, setGlobalFilter] = useState('');

  // اتصال جستجوی ما به جدول
  // این کد باعث می‌شود ستون "مشخصات" جستجو شود
  React.useEffect(() => {
    // 'requester' همان accessorKey ستون مشخصات است
    table.getColumn('requester')?.setFilterValue(globalFilter);
  }, [globalFilter, table]);


  return (
    <div className="requests-page-container p-4">
      {/* بخش فیلترها در سمت راست (طبق فیگما) */}
      {/* <RequestsFilters onFilterChange={...} /> */}

      <main className="table-content">
        {/* هدر جدول (جستجو و دکمه جدید) */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="search"
            placeholder="جستجو..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-2 border rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            + درخواست جدید
          </button>
        </div>

        {/* رندر کردن جدول عمومی */}
        <div className="border rounded-lg overflow-hidden">
          <DataTable table={table} />
        </div>

        {/* رندر کردن صفحه‌بندی عمومی */}
        <DataTablePagination table={table} />
      </main>
    </div>
  );
};


export default RequestsPage