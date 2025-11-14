import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { type DateObject } from "react-multi-date-picker";
import { type SelectOption } from '@/components/ui/SelectBox';
import gregorian from "react-date-object/calendars/gregorian";

// [اصلاح] ایمپورت از مسیر سراسری و مشترک
import { getEcho, leaveChannel } from '@/lib/echoService'; // <-- مسیر اصلاح شد


// --- ایمپورت هوک‌های داده (اصلاح شده) ---
import {
    useLogs,
    useApproveLog,
    useEmployeeOptionsList,
    reportKeys,
} from '../hooks/hook';

// --- ایمپورت تایپ‌ها و کامپوننت‌ها (اصلاح شده) ---
import { columns as createColumns } from '@/features/reports/components/reportsPage/TableColumns';
import { type ActivityLog, type ApiAttendanceLog } from '../types';
import { type LogFilters } from '../api/api';
import { mapApiLogToActivityLog } from '../utils/dataMapper';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { ActivityFilters } from '@/features/reports/components/reportsPage/activityFilters';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ... (تابع کمکی pad بدون تغییر) ...
function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

// =============================
// 🧾 کامپوننت صفحه
// =============================
export default function ActivityReportPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ... (استیت فیلترها، صفحه‌بندی، ... بدون تغییر) ...
    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        sort_by: 'timestamp',
        sort_dir: 'desc',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // ... (هوک‌های useMemo و useEffect برای فیلترها بدون تغییر) ...
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


    // تابع لاگ کمکی مخصوص این کامپوننت
    const logSocket = (level: 'info' | 'error' | 'success', message: string, data: any = '') => {
        const styles = {
            info: 'background: #3498db; color: white; padding: 2px 8px; border-radius: 3px;',
            error: 'background: #e74c3c; color: white; padding: 2px 8px; border-radius: 3px;',
            success: 'background: #2ecc71; color: white; padding: 2px 8px; border-radius: 3px;',
        };
        // لاگ‌ها با [ReportPage] مشخص می‌شوند
        console.log(`%c[ReportPage]%c ${message}`, styles[level], 'font-weight: bold;', data);
    };


    // ... (بقیه کدهای هوک useLogs، useEmployeeOptions, mutations, table, handlers) ...
    const {
        data: queryResult,
        isLoading,
        isFetching
    } = useLogs(filters);

    const { data: employeeOptions, isLoading: isLoadingEmployees } = useEmployeeOptionsList();

    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);


    // --- [اصلاح اساسی] هوک useEffect برای *عضویت در کانال* ---
    useEffect(() => {
        // ۱. دریافت نمونه گلوبال (از مسیر جدید)
        const echo = getEcho();

        // ۲. بررسی اینکه آیا اتصال گلوبال برقرار است
        if (!echo) {
            logSocket('error', 'اتصال Echo هنوز راه‌اندازی نشده است. (GlobalWebSocketHandler باید فعال باشد)');
            return;
        }

        // ۳. نام کانال و رویداد (بدون تغییر)
        const channelName = 'super-admin-global';
        const eventNameFromDocs = '.attendance.created';

        logSocket('info', `در حال تلاش برای عضویت در کانال: private-${channelName} ...`);

        // ۴. عضویت در کانال
        const privateChannel = echo.private(channelName);

        privateChannel.subscribed((data: any) => {
            logSocket('success', `✅ عضویت در کانال 'private-${channelName}' موفقیت‌آمیز بود.`, data);
        });

        privateChannel.error((data: any) => {
            logSocket('error', `❌ خطای عضویت در کانال 'private-${channelName}'. (توکن/دسترسی بررسی شود)`, data);
        });

        // ۵. گوش دادن به رویداد
        privateChannel.listen(eventNameFromDocs, (event: any) => {
            logSocket('success', `✅ رویداد دریافت شد: '${eventNameFromDocs}'`, event);

            const newApiLog = event.log as ApiAttendanceLog;

            if (newApiLog) {
                logSocket('info', `به‌روزرسانی مستقیم کش با لاگ جدید...`, newApiLog);
                const newActivityLog = mapApiLogToActivityLog(newApiLog);

                queryClient.setQueryData(
                    reportKeys.list(filters),
                    (oldData: { data: ActivityLog[], meta: any } | undefined) => {
                        if (!oldData) return;

                        const newData = [newActivityLog, ...oldData.data];

                        if (newData.length > (meta?.per_page || 10)) {
                            newData.pop();
                        }

                        return {
                            ...oldData,
                            data: newData,
                            meta: {
                                ...oldData.meta,
                                total: (oldData.meta.total || 0) + 1
                            }
                        };
                    }
                );
            } else {
                logSocket('info', `رویداد فاقد داده بود. در حال invalidation...`);
                queryClient.invalidateQueries({
                    queryKey: reportKeys.lists()
                });
            }
        });

        logSocket('info', `در حال گوش دادن به رویداد: '${eventNameFromDocs}' ...`);

        // --- ۶. تمیزکاری (Cleanup) ---
        return () => {
            logSocket('info', `در حال خروج از کانال: ${channelName} (اتصال اصلی پابرجا می‌ماند)`);
            privateChannel.stopListening(eventNameFromDocs);
            leaveChannel(channelName); // <-- استفاده از تابع سراسری
        };

    }, [queryClient, filters, meta]);


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


    // ... (بخش JSX و رندر کامپوننت بدون تغییر) ...
    return (
        <div className="flex flex-col md:flex-row-reverse gap-6 p-4 md:p-6">
            <aside className=" mx-auto">
                <ActivityFilters
                    onFilterChange={handleFilterChange}
                    employeeOptions={employeeOptions || []}
                    isLoadingEmployees={isLoadingEmployees}
                />
            </aside>

            <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 space-y-4 min-w-0">
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

                <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                    <DataTable
                        table={table}
                        isLoading={isLoading || isFetching}
                        notFoundMessage="هیچ فعالیتی یافت نشد."
                    />
                </section>

                <DataTablePagination table={table} />

                {editingLog && (
                    <p>
                        Placeholder:
                        در حال ویرایش لاگ {editingLog.id}
                        <button onClick={() => setEditingLog(null)}>بستن</button>
                    </p>
                )}
            </main>
        </div>
    );
}