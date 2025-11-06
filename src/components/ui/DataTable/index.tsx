import { type Table, flexRender } from "@tanstack/react-table";

interface DataTableProps<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  notFoundMessage?: string;
}

export function DataTable<TData>({
  table,
  isLoading = false,
  notFoundMessage = "داده‌ای یافت نشد.",
}: DataTableProps<TData>) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-borderL dark:border-borderD scroll-smooth" style={{ scrollbarWidth: "thin" }}>
      <table className="min-w-full md:w-full divide-y divide-borderL dark:divide-borderD mb-28">
        <thead className="bg-secondaryL dark:bg-secondaryD">
          {table.getHeaderGroups().map(headerGroup => (
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
          ))}
        </thead>
        <tbody className="bg-backgroundL-500 dark:bg-backgroundD divide-y divide-borderL dark:divide-borderD ">
          {isLoading ? (
            <tr>
              <td colSpan={table.getAllColumns().length} className="text-center p-4 text-muted-foregroundL dark:text-muted-foregroundD">
                درحال بارگذاری...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllColumns().length} className="text-center p-4 text-muted-foregroundL dark:text-muted-foregroundD">
                {notFoundMessage}
              </td>
            </tr>
          ) : (
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
