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

// 🔹 تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (num: number | string) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageSizeOptions = [10, 20, 30, 40, 50];

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border mt-2 transition-colors duration-300
      bg-backgroundL-500 dark:bg-backgroundD border-borderL dark:border-borderD"
    >


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full sm:w-auto">
        {/* ✅ انتخاب تعداد ردیف در صفحه */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
          <span className="text-foregroundL dark:text-foregroundD">ردیف در صفحه:</span>
          <Listbox
            value={table.getState().pagination.pageSize}
            onChange={(value) => table.setPageSize(Number(value))}
          >
            <div className="relative w-24">
              <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:text-backgroundL-500 dark:bg-zinc-800 py-1.5 pl-3 pr-8 text-left border dark:border-borderD text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primaryL">
                {/* نمایش عدد سایز صفحه به فارسی */}
                <span className="block truncate text-right">
                  {toPersianDigits(table.getState().pagination.pageSize)}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center pr-1">
                  <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute bottom-full mb-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800 py-1 text-xs sm:text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {pageSizeOptions.map((pageSize) => (
                    <Listbox.Option
                      key={pageSize}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-8 pr-3 ${active
                          ? "bg-amber-100 text-amber-900 dark:bg-zinc-700 dark:text-amber-300"
                          : "text-gray-900 dark:text-gray-200"
                        }`
                      }
                      value={pageSize}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate text-right ${selected ? "font-medium" : "font-normal"
                              }`}
                          >
                            {/* نمایش گزینه‌ها به فارسی */}
                            {toPersianDigits(pageSize)}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-amber-600 dark:text-amber-400">
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
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
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 text-xs sm:text-sm">
          <span className="px-2 text-foregroundL dark:text-foregroundD">
            صفحه{" "}
            <strong className="text-primaryL dark:text-primaryD">
              {/* نمایش شماره صفحه جاری به فارسی */}
              {toPersianDigits(table.getState().pagination.pageIndex + 1)}
            </strong>{" "}
            از{" "}
            {/* نمایش کل صفحات به فارسی */}
            {toPersianDigits(table.getPageCount())}
          </span>

          <div className="flex gap-1" dir="ltr">

            <PaginationButton
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              icon={<ChevronsLeft className="w-4 h-4 cursor-pointerF" />}
            />
            <PaginationButton
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              icon={<ChevronLeft className="w-4 h-4 cursor-pointerF" />}
            />
            <PaginationButton
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              icon={<ChevronRight className="w-4 h-4 cursor-pointerF" />}
            />
            <PaginationButton
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              icon={<ChevronsRight className="w-4 h-4 cursor-pointerF" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 دکمه صفحه‌بندی */
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
      className="p-1.5 sm:p-2 rounded-md border border-borderL dark:border-borderD transition-all duration-200 hover:bg-secondaryL dark:hover:bg-secondaryD disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-primaryL dark:text-primaryD">{icon}</span>
    </button>
  );
}