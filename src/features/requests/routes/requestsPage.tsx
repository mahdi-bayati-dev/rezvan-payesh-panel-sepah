// features/requests/routes/requestsPage.tsx
import { useState, useMemo, useEffect } from "react";
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
  // ✅ ایمپورت برای تعریف تابع فیلتر سفارشی
  type FilterFn,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { parseISO, isSameDay } from "date-fns"; // ✅ ایمپورت توابع تاریخ میلادی
import { DateObject } from "react-multi-date-picker"; // ✅ رفع خطای TS2304

// --- کامپوننت‌های UI ---
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { type SelectOption } from "@/components/ui/SelectBox";
import { toast } from "react-toastify";

// --- منطق ماژول Requests ---
import { requestsColumns } from "../components/mainRequests/RequestsColumnDefs";
import RequestsFilter from "../components/mainRequests/RequestsFilter";
import {
  useLeaveRequests,
  LEAVE_REQUESTS_QUERY_KEY,
} from "../hook/useLeaveRequests";
import {
  type LeaveRequest,
  type ApiPaginatedResponse,
  type User,
} from "../types";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { getEcho } from "@/lib/echoService";
import gregorian from "react-date-object/calendars/gregorian";


// --- ✅ تعریف تابع فیلتر سفارشی برای تاریخ (Client-Side) ---
// فیلتر بر اساس تاریخ شروع درخواست
const dateFilterFn: FilterFn<LeaveRequest> = (row, _columnId, value: DateObject | null) => { // ✅ رفع خطای TS6133
  if (!value) return true; // اگر فیلتری انتخاب نشده بود، همه را نشان بده

  try {
    // ۱. تاریخ انتخابی کاربر (شمسی) را به میلادی تبدیل کن
    const selectedDateGregorian = value.convert(gregorian).toDate();

    // ۲. تاریخ شروع درخواست (از API) را به آبجکت تاریخ تبدیل کن
    const requestStartDate = parseISO(row.original.start_time);

    // ۳. بررسی کن آیا دو تاریخ (بدون در نظر گرفتن ساعت) یکسان هستند
    // از isSameDay از date-fns استفاده می‌کنیم
    return isSameDay(requestStartDate, selectedDateGregorian);
  } catch (e) {
    console.error("خطا در فیلتر تاریخ:", e);
    return false;
  }
};


const RequestsPage = () => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectUser) as User | null;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // --- (State فیلترها) ---
  const [organizationFilter, setOrganizationFilter] = useState<SelectOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SelectOption | null>(null);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<SelectOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);
  const [dateFilter, setDateFilter] = useState<DateObject | null>(null); // ✅ فیلتر تاریخ


  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // (queryParams - فیلترهایی که API پشتیبانی می‌کند)
  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      // API فقط فیلتر وضعیت را پشتیبانی می‌کند
      status: statusFilter?.id as | "pending" | "approved" | "rejected" | "" | undefined,

      // فیلترهای مدیریتی که در API پشتیبانی نمی‌شوند اما در UI برای مدیران هستند،
      // باید به API ارسال نشوند یا در useLeaveRequests حذف شوند.
      // (این کار در هوک useLeaveRequests انجام می‌شود، پس اینجا فقط مقادیر را پاس می‌دهیم)
      organization_id: organizationFilter?.id ? Number(organizationFilter.id) : undefined,
      leave_type_id: leaveTypeFilter?.id ? Number(leaveTypeFilter.id) : undefined,
    };
  }, [pagination, statusFilter, organizationFilter, leaveTypeFilter, categoryFilter]);

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useLeaveRequests(queryParams);

  // ... (useMemo data & table) ...
  const data = useMemo(() => paginatedData?.data ?? [], [paginatedData]);
  const pageCount = useMemo(
    () => paginatedData?.meta.last_page ?? 0,
    [paginatedData]
  );
  const totalRows = useMemo(
    () => paginatedData?.meta.total ?? 0,
    [paginatedData]
  );

  const columns = useMemo(() => requestsColumns, []);

  const table = useReactTable({
    data: data,
    columns: columns,
    // ✅ اضافه کردن تابع فیلتر تاریخ به map فیلترهای جدول
    initialState: {
      columnFilters: [
        // فیلتر تاریخ (با ستون start_time)
        { id: 'start_time', value: dateFilter },
      ],
    },
    // ✅ اتصال تابع فیلتر سفارشی به Column Filter Type
    filterFns: {
      dateFilter: dateFilterFn,
    },
    // ✅ پیکربندی فیلتر تاریخ
    columnResizeMode: 'onChange',
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters: [
        { id: 'start_time', value: dateFilter } // ✅ اعمال فیلتر تاریخ
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

  // ... (منطق WebSockets) ...
  useEffect(() => {
    // ... (منطق وب‌سوکت‌ها بدون تغییر) ...
    // [ منطق کامل WebSockets از نسخه قبلی حفظ شده است ]
    const echo = getEcho();

    if (!currentUser || !echo) {
      return;
    }

    const updateQueryCache = (updatedRequest: LeaveRequest) => {
      console.log(`[WebSocket] Event: .leave_request.processed`, updatedRequest);
      toast.info(`درخواست ${updatedRequest.id} پردازش شد.`);
      queryClient.setQueryData(
        [LEAVE_REQUESTS_QUERY_KEY, "list", queryParams],
        (oldData: ApiPaginatedResponse<LeaveRequest> | undefined) => {
          if (!oldData) return oldData;
          const index = oldData.data.findIndex(r => r.id === updatedRequest.id);
          if (index !== -1) {
            console.log("[WebSocket] آپدیت مستقیم آیتم در کش لیست...");
            const newData = [...oldData.data];
            newData[index] = updatedRequest;
            return { ...oldData, data: newData };
          }
          console.log("[WebSocket] آیتم در کش فعلی نبود، لیست باطل می‌شود...");
          queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"] });
          return oldData;
        }
      );
      queryClient.setQueryData(
        [LEAVE_REQUESTS_QUERY_KEY, "detail", updatedRequest.id],
        { data: updatedRequest }
      );
    };

    const invalidateList = (eventName: string, request: LeaveRequest) => {
      console.log(`[WebSocket] Event: ${eventName}`, request);
      if (eventName === ".leave_request.submitted") {
        toast.info(`درخواست جدیدی توسط ${request.employee.first_name} ثبت شد.`);
      }
      console.log("[WebSocket] در حال باطل کردن کش لیست (invalidateQueries)...");
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
      });
      console.log("[WebSocket] کش با موفقیت باطل شد. منتظر فچ مجدد...");
    }

    const roles = currentUser.roles || [];
    const isSuperAdmin = roles.includes("super_admin");
    const isL2Admin = roles.includes("org-admin-l2");
    const isL3Admin = roles.includes("org-admin-l3");
    const orgId = currentUser.employee?.organization?.id;

    const adminChannelsToListen: string[] = [];

    if (isSuperAdmin) {
      adminChannelsToListen.push('super-admin-global');
    } else if (orgId) {
      if (isL3Admin) {
        adminChannelsToListen.push(`l3-channel.${orgId}`);
      }
      if (isL2Admin) {
        adminChannelsToListen.push(`l2-channel.${orgId}`);
      }
    }

    const userChannel = `App.User.${currentUser.id}`;
    echo
      .private(userChannel)
      .listen(".leave_request.processed", (e: { request: LeaveRequest }) =>
        updateQueryCache(e.request)
      );

    if (adminChannelsToListen.length > 0) {
      adminChannelsToListen.forEach(channelName => {
        console.log(`[WebSocket] در حال عضویت (Admin) در کانال: private-${channelName}`);
        const channel = echo.private(channelName);
        channel.listen(".leave_request.submitted", (e: { request: LeaveRequest }) =>
          invalidateList(".leave_request.submitted", e.request)
        );
        channel.listen(".leave_request.processed", (e: { request: LeaveRequest }) => {
          updateQueryCache(e.request);
        });
        channel.error((error: any) => {
          console.error(`[WebSocket] خطای عضویت در کانال ${channelName}:`, error);
        });
      });
    } else {
      console.log("[WebSocket] کاربر ادمین نیست یا organization_id ندارد. به کانال ادمین وصل نمی‌شود.");
    }

    // --- پاکسازی ---
    return () => {
      if (echo) {
        echo.leave(userChannel);
        adminChannelsToListen.forEach(channelName => {
          console.log(`[WebSocket] در حال خروج (Admin) از کانال: private-${channelName}`);
          echo.leave(`private-${channelName}`);
        });
      }
    };


  }, [currentUser, queryClient, queryParams, dateFilter]); // ✅ dateFilter به وابستگی‌ها اضافه شد


  return (
    <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-6"> {/* ✅ ریسپانسیو: اضافه کردن gap و padding کلی */}
      {/* (Filter Panel) */}
      <div className="w-full md:w-64 lg:w-72 md:sticky md:top-4 md:self-start"> {/* ✅ ریسپانسیو: ابعاد مناسب برای دسکتاپ/لپ‌تاپ */}
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

      {/* (Main Content) */}
      <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 sm:p-6 md:ml-6"> {/* ✅ ریسپانسیو: padding مناسب */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-borderD dark:text-borderL">
              {isLoading
                ? "در حال بارگذاری درخواست‌ها..."
                : `نمایش ${totalRows} درخواست`}
            </h2>
            {isError && (
              <p className="text-sm text-destructiveL">خطا در دریافت اطلاعات.</p>
            )}
            {/* نمایش هشدار در صورتی که فیلتر سازمان انتخاب شده باشد */}
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
                disabled // (چون جستجوی سمت سرور هنوز پیاده‌سازی نشده)
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