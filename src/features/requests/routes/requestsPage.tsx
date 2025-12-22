// features/requests/routes/requestsPage.tsx
import { useState, useMemo } from "react";
import { Download, ListFilter,  } from "lucide-react";

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
import { Button } from "@/components/ui/Button";

// --- منطق ماژول Requests ---
import { requestsColumns, toPersianNumbers } from "../components/mainRequests/RequestsColumnDefs";
import RequestsFilter from "../components/mainRequests/RequestsFilter";
import { useLeaveRequests } from "../hook/useLeaveRequests";
import { type LeaveRequest, type User } from "../types";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

import { useLeaveRequestSocket } from "../hook/useLeaveRequestSocket";
import { usePendingRequestsCount } from "../hook/usePendingRequestsCount";
import { ExportSettingsModal } from "../components/mainRequests/ExportSettingsModal";

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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [organizationFilter, setOrganizationFilter] = useState<SelectOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SelectOption | null>(null);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<SelectOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [dateFilter, setDateFilter] = useState<DateObject | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      status: statusFilter?.id as "pending" | "approved" | "rejected" | "" | undefined,
      organization_id: organizationFilter?.id ? Number(organizationFilter.id) : undefined,
      leave_type_id: leaveTypeFilter?.id ? Number(leaveTypeFilter.id) : undefined,
    };
  }, [pagination, statusFilter, organizationFilter, leaveTypeFilter]);

  const { data: paginatedData, isLoading, isError } = useLeaveRequests(queryParams);
  const { data: pendingCount = 0 } = usePendingRequestsCount();
  useLeaveRequestSocket(queryParams);

  const data = useMemo(() => paginatedData?.data ?? [], [paginatedData]);
  const pageCount = useMemo(() => paginatedData?.meta.last_page ?? 0, [paginatedData]);
  const totalRows = useMemo(() => paginatedData?.meta.total ?? 0, [paginatedData]);
  const columns = useMemo(() => requestsColumns, []);

  const table = useReactTable({
    data, columns, initialState: { columnFilters: [{ id: 'start_time', value: dateFilter }] },
    filterFns: { dateFilter: dateFilterFn },
    state: { sorting, pagination, rowSelection, columnFilters: [{ id: 'start_time', value: dateFilter }] },
    onSortingChange: setSorting, onPaginationChange: setPagination, onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, manualFiltering: true, pageCount, enableRowSelection: true,
  });

  const isManager = currentUser?.roles.some(role =>
    ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(role)
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row-reverse gap-6">

        <ExportSettingsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />

        {/* سایدبار فیلترها - عرض و استایل هماهنگ */}
        <div className="w-full lg:w-80 lg:sticky lg:top-6 lg:self-start flex-shrink-0">
          <RequestsFilter
            currentUser={currentUser}
            organization={organizationFilter} onOrganizationChange={setOrganizationFilter}
            category={categoryFilter} onCategoryChange={setCategoryFilter}
            leaveType={leaveTypeFilter} onLeaveTypeChange={setLeaveTypeFilter}
            status={statusFilter} onStatusChange={setStatusFilter}
            date={dateFilter} onDateChange={setDateFilter}
          />
        </div>

        {/* محتوای اصلی - کارت با لبه‌های گرد و استایل هماهنگ */}
        <main className="flex-1 min-w-0">
          <section className="bg-backgroundL-500 dark:bg-backgroundD rounded-3xl border border-borderL dark:border-borderD shadow-sm overflow-hidden transition-all duration-300">

            {/* هدر یکپارچه با بخش گزارش‌ها */}
            <div className="p-4 sm:p-6 border-b border-borderL dark:border-borderD bg-gradient-to-l from-transparent via-transparent to-primaryL/5 dark:to-primaryD/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">

                {/* اطلاعات و وضعیت */}
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className="p-2.5 sm:p-3 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl sm:rounded-2xl flex-shrink-0">
                    <ListFilter className="w-5 h-5 sm:w-6 sm:h-6 text-primaryL dark:text-primaryD" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg md:text-xl font-black text-foregroundL dark:text-foregroundD truncate">
                      مدیریت درخواست‌ها
                    </h1>
                    <div className="text-[10px] sm:text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5 sm:mt-1.5 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="truncate opacity-80">
                        {isLoading ? "در حال دریافت..." : `${toPersianNumbers(totalRows)} درخواست ثبت شده`}
                        {!isLoading && pendingCount > 0 && ` (${toPersianNumbers(pendingCount)} در انتظار)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه‌های عملیاتی */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {isManager && (
                    <Button
                      variant="secondary"
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex-1 sm:flex-none h-9 sm:h-11 px-3 sm:px-5 gap-1.5 sm:gap-2 rounded-xl text-[11px] sm:text-sm font-bold border-borderL dark:border-borderD hover:bg-secondaryL/20 dark:bg-secondaryD/10 bg-secondaryL/40 transition-all active:scale-95"
                    >
                      <Download size={16} />
                      <span className="whitespace-nowrap">خروجی اکسل</span>
                    </Button>
                  )}

                </div>
              </div>
            </div>

            {/* بدنه و جدول */}
            <div className="relative">
              {isError && (
                <div className="m-4 text-sm text-destructiveL bg-destructiveL/10 p-3 rounded-lg border border-destructiveL/20">
                  خطا در دریافت اطلاعات. لطفا اتصال اینترنت خود را بررسی کنید.
                </div>
              )}

              <div className="overflow-x-auto custom-scrollbar">
                <DataTable table={table} isLoading={isLoading} />
              </div>
            </div>

            {/* صفحه‌بندی هماهنگ */}
            <div className="p-4 border-t border-borderL dark:border-borderD bg-secondaryL/5 dark:bg-secondaryD/5">
              <DataTablePagination table={table} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RequestsPage;