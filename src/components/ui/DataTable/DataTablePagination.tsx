// src/components/ui/DataTable/DataTablePagination.tsx
import { Fragment } from "react";
import { type Table } from "@tanstack/react-table";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check,
  ChevronsUpDown,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  // ✅ گزینه‌های مربوط به تعداد نمایش آیتم‌ها در هر صفحه
  const pageSizeOptions = [10, 20, 30, 40, 50];

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border mt-2 transition-colors duration-300
               dark:bg-backgroundD dark:border-borderD"
      style={{
        borderColor: "borderL",
        backgroundColor: "backgroundL-500",
      }}
    >
      {/* ✅ نمایش تعداد ردیف‌های انتخاب‌شده */}
      <div className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
        {table.getFilteredSelectedRowModel().rows.length} از{" "}
        {table.getFilteredRowModel().rows.length} ردیف انتخاب شده است.
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* ✅ انتخاب تعداد نمایش در هر صفحه با Headless UI */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foregroundL dark:text-foregroundD">ردیف در صفحه:</span>
          <Listbox
            value={table.getState().pagination.pageSize}
            onChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <div className="relative">
              {/* دکمه اصلی که مقدار انتخاب شده را نمایش می‌دهد */}
              <Listbox.Button className="relative w-28 cursor-pointer rounded-md bg-white dark:text-backgroundL-500 dark:bg-zinc-800 py-1.5 pl-3 pr-10 text-left border dark:border-borderD focus:outline-none focus-visible:border-primaryL focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="block truncate">{table.getState().pagination.pageSize}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronsUpDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              {/* انیمیشن باز و بسته شدن لیست */}
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {/* گزینه‌های لیست */}
                <Listbox.Options className="absolute bottom-full mb-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {pageSizeOptions.map((pageSize) => (
                    <Listbox.Option
                      key={pageSize}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900 dark:bg-zinc-700 dark:text-amber-300' : 'text-gray-900 dark:text-gray-200'
                        }`
                      }
                      value={pageSize}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {pageSize}
                          </span>
                          {/* نمایش آیکون چک در صورت انتخاب بودن */}
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 dark:text-amber-400">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>


        {/* ✅ کنترل‌های صفحه‌بندی */}
        <div className="flex items-center gap-2 text-sm">
          {/* شماره صفحه */}
          <span className="px-3 text-foregroundL dark:text-foregroundD">
            صفحه{" "}
            <strong className="text-primaryL dark:text-primaryD">
              {table.getState().pagination.pageIndex + 1}
            </strong>{" "}
            از {table.getPageCount()}
          </span>

          {/* دکمه‌ها */}
          <PaginationButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronsLeft className="w-4 h-4" />}
          />
          <PaginationButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          <PaginationButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight className="w-4 h-4" />}
          />
          <PaginationButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            icon={<ChevronsRight className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
}

/* 🔹 کامپوننت دکمه‌ی تکرارشونده برای صفحه‌بندی */
function PaginationButton({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-md border transition-all duration-200 
               hover:bg-secondaryL
               disabled:opacity-50 disabled:cursor-not-allowed
               dark:border-borderD
               dark:hover:bg-secondaryD"
      style={{ borderColor: "borderL" }}
    >
      <span className="text-primaryL dark:text-primaryD">
        {icon}
      </span>
    </button>
  );
}
