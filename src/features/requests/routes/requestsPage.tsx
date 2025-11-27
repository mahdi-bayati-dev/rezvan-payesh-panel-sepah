// features/requests/routes/requestsPage.tsx
import { useState, useMemo } from "react";
import { Download, ListFilter } from "lucide-react";
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
// ✅ ایمپورت تابع تبدیل اعداد
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
    <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-4 min-h-[calc(100vh-80px)]">

      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <div className="w-full md:w-64 lg:w-72 md:sticky md:top-6 md:self-start">
        <RequestsFilter
          currentUser={currentUser}
          organization={organizationFilter} onOrganizationChange={setOrganizationFilter}
          category={categoryFilter} onCategoryChange={setCategoryFilter}
          leaveType={leaveTypeFilter} onLeaveTypeChange={setLeaveTypeFilter}
          status={statusFilter} onStatusChange={setStatusFilter}
          date={dateFilter} onDateChange={setDateFilter}
        />
      </div>

      <main className="flex-1 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD p-5 sm:p-4 shadow-sm border border-borderL dark:border-borderD flex flex-col gap-4">
        <div className=" flex gap-4 p-4 sm:p-2">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl">
                <ListFilter className="w-5 h-5 text-primaryL dark:text-primaryD" />
              </div>
              <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                {isLoading ? "در حال بارگذاری..." : `لیست درخواست‌ها (${toPersianNumbers(totalRows)})`}
              </h2>

              {!isLoading && pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm animate-in fade-in zoom-in duration-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  {toPersianNumbers(pendingCount)} در انتظار
                </span>
              )}
            </div>

            {isManager && (
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 hover:bg-secondaryL dark:hover:bg-secondaryD"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download size={16} />
                <span>خروجی اکسل</span>
              </Button>
            )}
          </div>
        </div>

        {isError && <p className="text-sm text-destructiveL bg-destructiveL/10 p-3 rounded-lg border border-destructiveL/20">خطا در دریافت اطلاعات. لطفا اتصال اینترنت خود را بررسی کنید.</p>}

        {(organizationFilter || leaveTypeFilter) && (
          <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800">
            (توجه: فیلتر سازمان/نوع در حال حاضر آزمایشی است)
          </p>
        )}

        <div className="border border-borderL dark:border-borderD rounded-2xl overflow-hidden shadow-sm">
          <DataTable table={table} isLoading={isLoading} />
        </div>

        {pageCount > 1 && <DataTablePagination table={table} />}
      </main>
    </div>
  );
};

export default RequestsPage;