import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query'; // ۱. ایمپورت QueryClient
import { Search, Plus } from 'lucide-react';
import { type DateObject } from "react-multi-date-picker";
import { type SelectOption } from '@/components/ui/SelectBox';
import gregorian from "react-date-object/calendars/gregorian";

// --- ۲. [جدید] ایمپورت‌های مورد نیاز ---
// ایمپورت سرویس WebSocket
import { getEchoInstance, leaveChannel } from '../services/echoService';
// ایمپورت هوک Redux برای دسترسی به استور
import { useAppSelector } from '@/store/';
// ایمپورت تایپ RootState (اگر سلکتور جدا نساخته‌اید)
import { type RootState } from '@/store';

// --- ۳. ایمپورت هوک‌های داده (بدون تغییر) ---
import {
    useLogs,
    useApproveLog,
    useEmployeeOptions,
} from '../hooks/hook';

// --- ۴. ایمپورت تایپ‌ها و کامپوننت‌ها (بدون تغییر) ---
import { columns as createColumns } from '@/features/reports/components/reportsPage/TableColumns';
import { type ActivityLog } from '../types';
import { type LogFilters } from '../api/api';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { ActivityFilters } from '@/features/reports/components/reportsPage/activityFilters';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// تابع کمکی (بدون تغییر)
function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

// =============================
// 🧾 کامپوننت صفحه
// =============================
export default function ActivityReportPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- ۵. [جدید] دریافت توکن دسترسی از استور Redux ---
    // این خط جایگزین هوک فرضی useAuth() می‌شود
    const userToken = useAppSelector((state: RootState) => state.auth.accessToken);

    // --- استیت فیلترها (بدون تغییر) ---
    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        sort_by: 'timestamp',
        sort_dir: 'desc',
    });
    const [searchTerm, setSearchTerm] = useState('');

    // --- استیت صفحه‌بندی (بدون تغییر) ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- هوک‌های useMemo و useEffect برای فیلتر و جستجو (بدون تغییر) ---
    useMemo(() => {
        setFilters(prev => ({
            ...prev,
            page: pageIndex + 1,
        }));
    }, [pageIndex, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prevFilters => ({
                ...prevFilters,
                search: searchTerm || undefined,
                page: 1,
            }));
            setPageIndex(0);
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);


    // --- ۶. [جدید] هوک useEffect برای اتصال به WebSocket ---
    useEffect(() => {
        // اگر کاربر لاگین نکرده (توکن ندارد)، هیچ کاری نکن
        if (!userToken) {
            console.log('[WebSocket] No user token, connection skipped.');
            return;
        }

        console.log('[WebSocket] Attempting to connect...');
        // ۱. دریافت یا ایجاد نمونه Echo با توکن معتبر
        const echo = getEchoInstance(userToken);

        // ۲. تعریف نام کانال و رویداد
        const channelName = 'super-admin-global';
        const eventName = '.AttendanceLogCreated'; // (نقطه در ابتدا مهم است)

        // ۳. اتصال به کانال خصوصی و گوش دادن
        const privateChannel = echo.private(channelName);

        privateChannel.listen(eventName, (event: any) => {
            console.log('✅ [WebSocket] Real-time event received:', event);

            // ۴. [مهم] باطل کردن کش React Query
            // این دستور به useLogs می‌گوید داده‌هایش قدیمی شده و باید مجدد واکشی کند
            queryClient.invalidateQueries({
                queryKey: ['reports', 'list'] // مطابقت با reportKeys.lists() در hook.ts
            });

            // می‌توانید در اینجا یک Toast (پیام) "لیست به‌روز شد" هم نشان دهید
            // toast.info("لیست فعالیت‌ها به‌روز شد!");
        });

        // (اختیاری) لاگ کردن وضعیت اتصال برای دیباگ
        echo.connector.pusher.connection.bind('connected', () => {
            console.log('✅ [WebSocket] Connected Successfully.');
        });
        echo.connector.pusher.connection.bind('error', (err: any) => {
            console.error('❌ [WebSocket] Connection Error:', err);
            // اگر خطای 401 (Auth) بود، احتمالاً توکن منقضی شده
            // authSlice شما باید این مورد را مدیریت کند (مثلاً با checkAuthStatus)
        });

        // ۵. تمیزکاری (Cleanup)
        return () => {
            console.log(`[WebSocket] Leaving channel: ${channelName}`);
            // خروج از کانال هنگام Unmount شدن کامپوننت
            leaveChannel(channelName);
            // ما اتصال کلی را قطع نمی‌کنیم (disconnectEcho)
            // چون ممکن است کاربر به صفحه دیگری برود و برگردد
        };

    }, [userToken, queryClient]); // وابستگی به توکن و queryClient


    // --- ۷. واکشی داده‌ها با useQuery (بدون تغییر) ---
    // این هوک [useLogs] حالا توسط WebSocket به‌روز می‌شود
    // (مطمئن شوید که refetchInterval را از useLogs حذف کرده‌اید)
    const {
        data: queryResult,
        isLoading,
        isFetching
    } = useLogs(filters);

    // --- بقیه موارد (employeeOptions, mutations, table, handlers) بدون تغییر ---
    const { data: employeeOptions, isLoading: isLoadingEmployees } = useEmployeeOptions();
    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const pageCount = meta?.last_page || 1;
    const approveMutation = useApproveLog();
    const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);

    const handleApprove = (log: ActivityLog) => {
        approveMutation.mutate(log.id);
    };

    const handleEdit = (log: ActivityLog) => {
        setEditingLog(log);
    };

    const columns = useMemo(() => createColumns({
        onApprove: handleApprove,
        onEdit: handleEdit,
    }), []);

    const table = useReactTable({
        data: logsData,
        columns,
        pageCount: pageCount,
        state: {
            pagination: { pageIndex, pageSize },
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    });

    const handelNewReport = () => {
        navigate('/reports/new');
    };

    const handleFilterChange = (newApiFilters: {
        employee: SelectOption | null;
        date_from: DateObject | null;
        date_to: DateObject | null;
    }) => {

        const formatApiDateStart = (date: DateObject | null): string | undefined => {
            if (!date) return undefined;
            const gregorianDate = date.convert(gregorian);
            return `${gregorianDate.year}-${pad(gregorianDate.month.number)}-${pad(gregorianDate.day)}`;
        };

        const formatApiDateEnd = (date: DateObject | null): string | undefined => {
            if (!date) return undefined;
            const gregorianDate = date.convert(gregorian);
            return `${gregorianDate.year}-${pad(gregorianDate.month.number)}-${pad(gregorianDate.day)} 23:59:59`;
        };

        setFilters({
            ...filters,
            page: 1,
            employee_id: newApiFilters.employee ? Number(newApiFilters.employee.id) : undefined,
            date_from: formatApiDateStart(newApiFilters.date_from),
            date_to: formatApiDateEnd(newApiFilters.date_to),
        });

        setPageIndex(0);
    };

    const setPageIndex = (index: number) => {
        setPagination(prev => ({ ...prev, pageIndex: index }));
    };


    return (
        <div className="flex flex-col md:flex-row-reverse gap-6 p-4 md:p-6">
            {/* Sidebar Filters */}
            <aside className=" mx-auto">
                <ActivityFilters
                    onFilterChange={handleFilterChange}
                    employeeOptions={employeeOptions || []}
                    isLoadingEmployees={isLoadingEmployees}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 space-y-4 min-w-0">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                        گزارش آخرین فعالیت‌ها
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-60">
                            <Input
                                label=''
                                type="text"
                                placeholder="جستجو (نام، کد پرسنلی)..."
                                className="w-full pr-10 py-2 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} className="absolute right-3 top-1/3" />
                        </div>

                        <Button
                            variant='primary'
                            onClick={handelNewReport}
                            type="button"
                            className="flex items-center">
                            <Plus className="w-5 h-5" />
                            <span>ثبت فعالیت</span>
                        </Button>
                    </div>
                </header>

                {/* Table */}
                <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                    <DataTable
                        table={table}
                        isLoading={isLoading || isFetching} // نمایش لودینگ
                        notFoundMessage="هیچ فعالیتی یافت نشد."
                    />
                </section>

                {/* Pagination */}
                <DataTablePagination table={table} />

                {/* مودال ویرایش (بدون تغییر) */}
                {editingLog && (
                    <p>
                        {/* TODO: کامپوننت مودال ویرایش خود را در اینجا قرار دهید ... */}
                        Placeholder:
                        در حال ویرایش لاگ {editingLog.id}
                        <button onClick={() => setEditingLog(null)}>بستن</button>
                    </p>
                )}
            </main>
        </div>
    );
}