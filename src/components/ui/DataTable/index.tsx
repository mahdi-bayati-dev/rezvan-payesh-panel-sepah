import { type Table, flexRender } from "@tanstack/react-table";
// ۱. ایمپورت کامپوننت‌های اسکلت
import { DataTableSkeleton } from './DataTableSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

interface DataTableProps<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  notFoundMessage?: string;
  /** تعداد ردیف‌های اسکلتی که در زمان لودینگ نمایش داده می‌شود */
  skeletonRowCount?: number;
}

export function DataTable<TData>({
  table,
  isLoading = false,
  notFoundMessage = "داده‌ای یافت نشد.",
  skeletonRowCount = 8, // استفاده از پراپ جدید با مقدار پیش‌فرض
}: DataTableProps<TData>) {

  // تعداد ستون‌ها را یکبار محاسبه می‌کنیم
  const columnCount = table.getAllColumns().length;

  return (
    <div className="w-full overflow-x-auto rounded-md border border-borderL dark:border-borderD scroll-smooth" style={{ scrollbarWidth: "thin" }}>
      <table className="min-w-full md:w-full divide-y divide-borderL dark:divide-borderD mb-28">
        <thead className="bg-secondaryL dark:bg-secondaryD">
          {/* ۲. منطق هدر: اگر در حال لودینگ بود، هدر اسکلتی نشان بده */}
          {isLoading ? (
            <tr>
              {Array.from({ length: columnCount }).map((_, i) => (
                <th key={`header-skeleton-${i}`} scope="col" className="px-3 py-3 text-right">
                  {/* استفاده از اسکلت پایه برای هدر */}
                  <Skeleton className="h-5 w-3/4" />
                </th>
              ))}
            </tr>
          ) : (
            // در غیر این صورت هدر واقعی را رندر کن
            table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-3 py-3 text-right text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD uppercase tracking-wider whitespace-nowrap transition-all duration-300 ease-in-out"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))
          )}
        </thead>
        <tbody className="bg-backgroundL-500 dark:bg-backgroundD divide-y divide-borderL dark:divide-borderD ">
          {/* ۳. منطق بدنه: اگر در حال لودینگ بود، ردیف‌های اسکلتی نشان بده */}
          {isLoading ? (
            <DataTableSkeleton
              columnCount={columnCount}
              rowCount={skeletonRowCount}
            />
          ) : table.getRowModel().rows.length === 0 ? (
            // (بدون تغییر) نمایش پیام "داده‌ای یافت نشد"
            <tr>
              <td colSpan={columnCount} className="text-center p-4 text-muted-foregroundL dark:text-muted-foregroundD">
                {notFoundMessage}
              </td>
            </tr>
          ) : (
            // (بدون تغییر) نمایش ردیف‌های واقعی داده
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-secondaryL dark:hover:bg-secondaryD transition-colors duration-300 ease-in-out">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-foregroundL dark:text-foregroundD whitespace-nowrap transition-all duration-300 ease-in-out">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}