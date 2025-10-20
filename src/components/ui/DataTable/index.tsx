// src/components/ui/DataTable/index.tsx
import { type Table, flexRender } from '@tanstack/react-table';

// از Generics استفاده می‌کنیم تا این جدول بتواند هر نوع داده‌ای را بپذیرد
interface DataTableProps<TData> {
  table: Table<TData>; // نمونه (instance) جدول که از useReactTable می‌آید
  isLoading?: boolean; // برای نمایش وضعیت لودینگ
  notFoundMessage?: string; // پیامی برای زمانی که داده‌ای وجود ندارد
}

export function DataTable<TData>({
  table,
  isLoading = false,
  notFoundMessage = 'داده‌ای یافت نشد.',
}: DataTableProps<TData>) {
  return (
    /*
      کامنت: برای زیبایی و استاندارد شدن، یک حاشیه (border)
      و گوشه‌های گرد به wrapper اضافه می‌کنیم.
      این کلاس‌ها مستقیماً از متغیرهای CSS شما برای حالت لایت و دارک استفاده می‌کنند.
    */
    <div className="data-table-wrapper rounded-md border border-borderL dark:border-borderD overflow-hidden">
      {/*
        کامنت: جایگزینی divide-gray-200 با متغیرهای border شما
      */}
      <table className="min-w-full divide-y divide-borderL dark:divide-borderD">
        {/*
          کامنت: هدر جدول
          جایگزینی bg-gray-50 با متغیرهای secondary شما
        */}
        <thead className="bg-secondaryL dark:bg-secondaryD">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  /*
                    کامنت: جایگزینی text-gray-500 با متغیرهای muted-foreground شما
                  */
                  className="px-6 py-3 text-right text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD uppercase tracking-wider"
                  // در اینجا می‌توانیم منطق مرتب‌سازی (sorting) را هم اضافه کنیم
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header, // رندر کردن هدر تعریف شده
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/*
          کامنت: بدنه جدول
          جایگزینی bg-white با متغیرهای background شما
          جایگزینی divide-gray-200 با متغیرهای border شما
        */}
        <tbody className="bg-backgroundL-500 dark:bg-backgroundD divide-y divide-borderL dark:divide-borderD">
          {/* مدیریت وضعیت لودینگ */}
          {isLoading ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                /*
                  کامنت: استفاده از رنگ muted-foreground برای پیام‌ها
                */
                className="text-center p-4 text-muted-foregroundL dark:text-muted-foregroundD"
              >
                درحال بارگذاری...
              </td>
            </tr>
          ) : /* مدیریت وضعیت نبود داده */
          !isLoading && table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                /*
                  کامنت: استفاده از رنگ muted-foreground برای پیام‌ها
                */
                className="text-center p-4 text-muted-foregroundL dark:text-muted-foregroundD"
              >
                {notFoundMessage}
              </td>
            </tr>
          ) : (
            /* رندر کردن سطرها */
            table.getRowModel().rows.map((row) => (
              /*
                کامنت: جایگزینی hover:bg-gray-50 با متغیرهای secondary شما
                و اضافه کردن transition-colors برای انیمیشن نرم
              */
              <tr
                key={row.id}
                className="hover:bg-secondaryL dark:hover:bg-secondaryD transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    /*
                      کامنت: استفاده از رنگ foreground اصلی برای متن سلول‌ها
                    */
                    className="px-6 py-4 whitespace-nowrap text-sm text-foregroundL dark:text-foregroundD"
                  >
                    {flexRender(
                      cell.column.columnDef.cell, // رندر کردن سلول تعریف شده
                      cell.getContext()
                    )}
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