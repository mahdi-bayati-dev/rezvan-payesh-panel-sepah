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


    // ... (خارج از کامپوننت، تابع کمکی logSocket بدون تغییر باقی می‌ماند)
    const logSocket = (level: 'info' | 'error' | 'success', message: string, data: any = '') => {
        const styles = {
            info: 'background: #007bff; color: white; padding: 2px 8px; border-radius: 3px;',
            error: 'background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;',
            success: 'background: #28a745; color: white; padding: 2px 8px; border-radius: 3px;',
        };
        // [اصلاح جزئی] از console.log برای همه سطوح استفاده می‌کنیم تا در همه مرورگرها کار کند
        console.log(`%c[WebSocket]%c ${message}`, styles[level], 'font-weight: bold;', data);
    };


    // ... (داخل کامپوننت)

    // --- ۶. [جدید] هوک useEffect برای اتصال به WebSocket (نسخه نهایی اصلاح شده) ---
    useEffect(() => {
        if (!userToken) {
            logSocket('info', 'توکن کاربر وجود ندارد، اتصال WebSocket نادیده گرفته شد.');
            return;
        }

        logSocket('info', 'در حال تلاش برای اتصال...');
        const echo = getEchoInstance(userToken);

        // --- لاگ کردن وضعیت‌های اتصال (مرحله ۱ و ۲ مستندات) ---
        // (این بخش بدون تغییر و صحیح است)
        const pusher = echo.connector.pusher;

        pusher.connection.bind('connecting', () => {
            logSocket('info', 'در حال اتصال به ws.eitebar.ir:80 ...');
        });

        pusher.connection.bind('connected', () => {
            const socketId = pusher.connection.socket_id;
            logSocket('success', `✅ اتصال با موفقیت برقرار شد.`, `Socket ID: ${socketId}`);


            const authEp = echo.options.authEndpoint;
            if (authEp !== 'https://payesh.eitebar.ir/broadcasting/auth') {
                logSocket('info', `توجه: authEndpoint روی ${authEp} تنظیم شده است.`);
            }
        });

        pusher.connection.bind('error', (err: any) => {
            logSocket('error', '❌ خطای اتصال Pusher:', err);
        });

        pusher.connection.bind('disconnected', () => {
            logSocket('info', 'ارتباط قطع شد.');
        });

        pusher.connection.bind('unavailable', () => {
            logSocket('error', 'سرور WebSocket در دسترس نیست.');
        });


        // --- لاگ کردن عضویت در کانال (مرحله ۳ و ۴ مستندات) ---
        const channelName = 'super-admin-global';
        logSocket('info', `در حال تلاش برای عضویت در کانال خصوصی: private-${channelName} ...`);

        const privateChannel = echo.private(channelName);

        privateChannel.subscribed((data: any) => {
            // این لاگ یعنی مرحله ۳ (Auth) و ۴ (Subscribe) مستندات با موفقیت انجام شده
            logSocket('success', `✅ عضویت در کانال 'private-${channelName}' موفقیت‌آمیز بود.`, data);
        });

        privateChannel.error((data: any) => {
            // اگر این لاگ را دیدید، یعنی مرحله ۳ (Auth) شکست خورده است.
            logSocket('error', `❌ خطای عضویت در کانال 'private-${channelName}'. (بررسی کنید توکن معتبر باشد و دسترسی به این کانال را داشته باشد)`, data);
        });


        // ✅ [صحیح] این نام کامل کلاس است که سرور ارسال می‌کند
        // (توجه کنید که بک‌اسلش‌ها در رشته جاوا اسکریپت باید escape شوند)
        const eventNameFromDocs = 'App\\Events\\AttendanceLogCreated';

        privateChannel.listen(eventNameFromDocs, (event: any) => {
            logSocket('success', `✅ رویداد (با نام کامل) دریافت شد: '${eventNameFromDocs}'`, event);
            queryClient.invalidateQueries({
                queryKey: ['reports', 'list']
            });
        });

        // (می‌توانید شنونده‌ی eventNameCode را حذف کنید یا نگه دارید)
        const eventNameCode = '.AttendanceLogCreated';
        privateChannel.listen(eventNameCode, (event: any) => {
            logSocket('success', `✅ رویداد (با نقطه) دریافت شد: '${eventNameCode}'`, event);
            queryClient.invalidateQueries({
                queryKey: ['reports', 'list']
            });
        });

        logSocket('info', `در حال گوش دادن به دو رویداد: '${eventNameFromDocs}' و '${eventNameCode}' ...`);

        // --- ۵. تمیزکاری (Cleanup) ---
        return () => {
            logSocket('info', `در حال خروج از کانال: ${channelName}`);
            leaveChannel(channelName);
            pusher.connection.unbind_all();

            // ✅ [اصلاح] شنونده‌ی جدید را هم حذف کنید
            privateChannel.stopListening(eventNameFromDocs);
            privateChannel.stopListening(eventNameCode);
        };

    }, [userToken, queryClient]);


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