// features/requests/routes/requestsPage.tsx
import { useState, useMemo } from "react";
import {  Download } from "lucide-react";
// ❌ Link حذف شد چون دیگر به روت جداگانه نمی‌رویم
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
import { requestsColumns } from "../components/mainRequests/RequestsColumnDefs";
import RequestsFilter from "../components/mainRequests/RequestsFilter";
import { useLeaveRequests } from "../hook/useLeaveRequests";
import { type LeaveRequest, type User } from "../types";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

import { useLeaveRequestSocket } from "../hook/useLeaveRequestSocket";
import { usePendingRequestsCount } from "../hook/usePendingRequestsCount";

// ✅ ایمپورت مدال جدید
import { ExportSettingsModal } from "../components/mainRequests/ExportSettingsModal";

// ... (dateFilterFn بدون تغییر) ...
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

  // ✅ استیت کنترل مدال خروجی
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // ... (سایر استیت‌ها بدون تغییر) ...
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

  // ... (queryParams و هوک‌ها بدون تغییر) ...
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

  // ... (تنظیمات جدول بدون تغییر) ...
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
    <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-6">

      {/* ✅ رندر کردن مدال خروجی */}
      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <div className="w-full md:w-64 lg:w-72 md:sticky md:top-4 md:self-start">
        <RequestsFilter
          currentUser={currentUser}
          organization={organizationFilter} onOrganizationChange={setOrganizationFilter}
          category={categoryFilter} onCategoryChange={setCategoryFilter}
          leaveType={leaveTypeFilter} onLeaveTypeChange={setLeaveTypeFilter}
          status={statusFilter} onStatusChange={setStatusFilter}
          date={dateFilter} onDateChange={setDateFilter}
        />
      </div>

      <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 sm:p-6 md:ml-6">
        <div className="flex flex-col gap-4 mb-4">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-borderD dark:text-borderL">
                {isLoading ? "در حال بارگذاری..." : `لیست درخواست‌ها (${totalRows})`}
              </h2>

              {!isLoading && pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  {pendingCount} در انتظار
                </span>
              )}
            </div>

            {/* ✅ دکمه خروجی که مدال را باز می‌کند */}
            {isManager && (
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download size={16} />
                <span>خروجی اکسل</span>
              </Button>
            )}
          </div>

          {/* <div className="w-full">
            <div className="relative w-full sm:w-60 mr-auto">
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
          </div> */}

        </div>

        {isError && <p className="text-sm text-destructiveL">خطا در دریافت اطلاعات.</p>}
        {(organizationFilter || leaveTypeFilter) && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 mb-2">
            (توجه: فیلتر سازمان/نوع توسط API پشتیبانی نمی‌شود)
          </p>
        )}

        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
          <DataTable table={table} isLoading={isLoading} />
        </div>

        {pageCount > 1 && <DataTablePagination table={table} />}
      </main>
    </div>
  );
};

export default RequestsPage;