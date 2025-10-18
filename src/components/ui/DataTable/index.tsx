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
        <div className="data-table-wrapper">
            <table className="min-w-full divide-y divide-gray-200">
                {/* هدر جدول */}
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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

                {/* بدنه جدول */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* مدیریت وضعیت لودینگ */}
                    {isLoading ? (
                        <tr>
                            <td colSpan={table.getAllColumns().length} className="text-center p-4">
                                درحال بارگذاری...
                            </td>
                        </tr>
                    ) :

                        /* مدیریت وضعیت نبود داده */
                        !isLoading && table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={table.getAllColumns().length} className="text-center p-4">
                                    {notFoundMessage}
                                </td>
                            </tr>
                        ) : (

                            /* رندر کردن سطرها */
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
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