// src/components/ui/DataTable/DataTablePagination.tsx
import React from 'react';
import {type Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between p-2">
      {/* نمایش تعداد کل ردیف‌های انتخاب شده (اختیاری) */}
      <div className="text-sm text-gray-700">
        {table.getFilteredSelectedRowModel().rows.length} از{' '}
        {table.getFilteredRowModel().rows.length} ردیف انتخاب شده است.
      </div>

      {/* دکمه‌های صفحه‌بندی */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.setPageIndex(0)} // رفتن به صفحه اول
          disabled={!table.getCanPreviousPage()}
          className="p-2 disabled:opacity-50"
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()} // صفحه قبل
          disabled={!table.getCanPreviousPage()}
          className="p-2 disabled:opacity-50"
        >
          {'<'}
        </button>
        
        {/* نمایش شماره صفحه فعلی */}
        <span className="text-sm">
          صفحه{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}
          </strong>
        </span>
        
        <button
          onClick={() => table.nextPage()} // صفحه بعد
          disabled={!table.getCanNextPage()}
          className="p-2 disabled:opacity-50"
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)} // رفتن به صفحه آخر
          disabled={!table.getCanNextPage()}
          className="p-2 disabled:opacity-50"
        >
          {'>>'}
        </button>

        {/* انتخاب تعداد نمایش در هر صفحه (مثل فیگما) */}
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="p-2 border rounded"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              نمایش {pageSize} مورد
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}