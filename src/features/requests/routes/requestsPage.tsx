// features/requests/routes/requestsPage.tsx
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type FilterFn,
} from "@tanstack/react-table";
import { parseISO, isSameDay } from "date-fns";
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";

// --- کامپوننت‌های UI ---
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { type SelectOption } from "@/components/ui/SelectBox";

// --- منطق ماژول Requests ---
import { requestsColumns } from "../components/mainRequests/RequestsColumnDefs";
import RequestsFilter from "../components/mainRequests/RequestsFilter";
import { useLeaveRequests } from "../hook/useLeaveRequests";
import { type LeaveRequest, type User } from "../types";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

// ✅ ایمپورت هوک جدید سوکت
import { useLeaveRequestSocket } from "../hook/useLeaveRequestSocket";
// ✅ ایمپورت هوک شمارنده برای نمایش در هدر
import { usePendingRequestsCount } from "../hook/usePendingRequestsCount";

// --- تابع فیلتر تاریخ (Client-Side) ---
const dateFilterFn: FilterFn<LeaveRequest> = (row, _columnId, value: DateObject | null) => {
  if (!value) return true;
  try {
    const selectedDateGregorian = value.convert(gregorian).toDate();
    const requestStartDate = parseISO(row.original.start_time);
    return isSameDay(requestStartDate, selectedDateGregorian);
  } catch (e) {
    console.error("خطا در فیلتر تاریخ:", e);
    return false;
  }
};

const RequestsPage = () => {
  const currentUser = useAppSelector(selectUser) as User | null;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // --- State فیلترها ---
  const [organizationFilter, setOrganizationFilter] = useState<SelectOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SelectOption | null>(null);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<SelectOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [dateFilter, setDateFilter] = useState<DateObject | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- آماده‌سازی پارامترهای API ---
  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      status: statusFilter?.id as "pending" | "approved" | "rejected" | "" | undefined,
      organization_id: organizationFilter?.id ? Number(organizationFilter.id) : undefined,
      leave_type_id: leaveTypeFilter?.id ? Number(leaveTypeFilter.id) : undefined,
    };
  }, [pagination, statusFilter, organizationFilter, leaveTypeFilter]);

  // --- فچ کردن دیتا (React Query) ---
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useLeaveRequests(queryParams);

  // ✅ دریافت تعداد درخواست‌های در انتظار (برای بج هدر)
  // مقدار پیش‌فرض 0 است تا قبل از لود شدن چیزی نشان ندهد یا ارور ندهد
  const { data: pendingCount = 0 } = usePendingRequestsCount();

  // --- فراخوانی هوک سوکت ---
  useLeaveRequestSocket(queryParams);

  // --- آماده‌سازی داده‌های جدول ---
  const data = useMemo(() => paginatedData?.data ?? [], [paginatedData]);
  const pageCount = useMemo(() => paginatedData?.meta.last_page ?? 0, [paginatedData]);
  const totalRows = useMemo(() => paginatedData?.meta.total ?? 0, [paginatedData]);

  const columns = useMemo(() => requestsColumns, []);

  const table = useReactTable({
    data: data,
    columns: columns,
    initialState: {
      columnFilters: [
        { id: 'start_time', value: dateFilter },
      ],
    },
    filterFns: {
      dateFilter: dateFilterFn,
    },
    columnResizeMode: 'onChange',
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters: [
        { id: 'start_time', value: dateFilter }
      ],
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: pageCount,
    enableRowSelection: true,
  });

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-6">
      {/* سایدبار فیلترها */}
      <div className="w-full md:w-64 lg:w-72 md:sticky md:top-4 md:self-start">
        <RequestsFilter
          currentUser={currentUser}
          organization={organizationFilter}
          onOrganizationChange={setOrganizationFilter}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          leaveType={leaveTypeFilter}
          onLeaveTypeChange={setLeaveTypeFilter}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          date={dateFilter}
          onDateChange={setDateFilter}
        />
      </div>

      {/* محتوای اصلی (جدول) */}
      <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 sm:p-6 md:ml-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            {/* ✅ هدر با نمایش بج تعداد در انتظار */}
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-borderD dark:text-borderL">
                {isLoading
                    ? "در حال بارگذاری درخواست‌ها..."
                    : `نمایش ${totalRows} درخواست`}
                </h2>

                {/* نمایش بج فقط اگر درخواستی در انتظار باشد و در حال لودینگ اولیه نباشیم */}
                {!isLoading && pendingCount > 0 && (
                    <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm"
                        title={`${pendingCount} درخواست منتظر بررسی شماست`}
                    >
                        {/* دایره چشمک زن */}
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        {pendingCount} در انتظار
                    </span>
                )}
            </div>

            {isError && (
              <p className="text-sm text-destructiveL">خطا در دریافت اطلاعات.</p>
            )}
            {(organizationFilter || leaveTypeFilter) && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                (توجه: فیلتر سازمان/نوع توسط API پشتیبانی نمی‌شود)
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <input
                placeholder="جستجو (بزودی...)"
                disabled
                className="w-full py-1.5 px-3 pr-10 rounded-lg text-sm bg-inputL text-foregroundL border border-borderL focus:outline-none focus:ring-2 focus:ring-primaryL placeholder:text-muted-foregroundL dark:bg-inputD dark:text-foregroundD dark:border-borderD dark:focus:ring-primaryD dark:placeholder:text-muted-foregroundD disabled:opacity-50"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
          <DataTable table={table} isLoading={isLoading} />
        </div>

        {pageCount > 1 && (
          <DataTablePagination table={table} />
        )}
      </main>
    </div>
  );
};

export default RequestsPage;