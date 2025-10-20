// features/requests/requestsPage.tsx
import React, { useState, useMemo } from 'react';
import { Search, CirclePlus } from "lucide-react";

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
    // کامنت: استفاده از متغیرهای رنگی CSS در کامپوننت
    <div

      className="requests-page-container p-4 bg-backgroundL-500 dark:bg-backgroundD rounded-t-2xl"
    >
      {/* بخش فیلترها در سمت راست (طبق فیگما) */}
      {/* <RequestsFilters onFilterChange={...} /> */}

      <main className="table-content">

        {/* هدر جدول (جستجو و دکمه جدید) */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className='text-lg font-bold text-borderD dark:text-borderL'>
              درخواست ها
            </h2>
          </div>
          <div className='flex gap-4 items-center'>

            <div className="relative max-w-xs">
              <label htmlFor="search" className="sr-only">
                جستجو
              </label>
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                type="text"
                id="search"
                placeholder="جستجو..."
                className="w-full py-1.5 px-3 pr-10 rounded-lg text-sm bg-inputL text-foregroundL border border-borderL focus:outline-none focus:ring-2 focus:ring-primaryL placeholder:text-muted-foregroundL dark:bg-inputD dark:text-foregroundD dark:border-borderD dark:focus:ring-primaryD dark:placeholder:text-muted-foregroundD"
              />
              <span className="absolute inset-y-0 right-2 flex items-center">
                <button
                  type="submit"
                  aria-label="جستجو"
                  className="p-1.5 rounded-full text-muted-foregroundL hover:bg-secondaryL dark:text-muted-foregroundD dark:hover:bg-secondaryD"
                >
                  <Search size={18} />
                </button>
              </span>
            </div>
            <button

              className="bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-blue hover:text-backgroundL-500 text-sm"
            >
              <CirclePlus size={20} /> درخواست جدید
            </button>
          </div>
        </div>


        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
          <DataTable table={table} />
        </div>



        <DataTablePagination table={table} />
      </main>
    </div>
  );
};


export default RequestsPage