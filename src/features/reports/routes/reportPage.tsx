import { useState, useMemo, useEffect } from 'react'; // [اصلاح] ایمپورت useEffect
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from '@tanstack/react-table';
import { Search, Plus } from 'lucide-react';
import { type DateObject } from "react-multi-date-picker";
import { type SelectOption } from '@/components/ui/SelectBox';

// [اصلاح ۱] ایمپورت تقویم میلادی
import gregorian from "react-date-object/calendars/gregorian";

// --- ۱. ایمپورت هوک‌های واقعی ---
import {
    useLogs,
    useApproveLog,
    // useUpdateLog, // (فعلا کامنت شده)
    useEmployeeOptions,
} from '../hooks/hook';

// --- ۲. ایمپورت تایپ‌ها و توابع API ---
import { columns as createColumns } from '@/features/reports/components/reportsPage/TableColumns';
import { type ActivityLog } from '../types';
// [رفع خطا ۱۱] - تایپ UpdateLogPayload استفاده نشده بود و حذف شد
import { type LogFilters } from '../api/api';

// --- ۴. کامپوننت‌های UI (بدون تغییر) ---
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { ActivityFilters } from '@/features/reports/components/reportsPage/activityFilters';
import Input from '@/components/ui/Input'; // (ایمپورت Input شما)
import { Button } from '@/components/ui/Button'; // (ایمپورت Button شما)
// import { EditLogModal } from '../components/EditLogModal'; 

// [اصلاح ۲] تابع کمکی pad (مانند NewReportPage)
function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

// =============================
// 🧾 کامپوننت صفحه
// =============================
export default function ActivityReportPage() {
    const navigate = useNavigate();

    // --- ۵. استیت برای فیلترهای API ---
    // (این استیت اصلی است که useLogs به آن گوش می‌دهد)
    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        sort_by: 'timestamp',
        sort_dir: 'desc',
    });

    // [اصلاح] استیت محلی فقط برای فیلد جستجو (برای Debouncing)
    const [searchTerm, setSearchTerm] = useState('');

    // --- ۶. استیت برای صفحه‌بندی (کنترل شده) ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0, // صفحه ۰ در جدول = صفحه ۱ در API
        pageSize: 10,
    });

    // ۷. همگام‌سازی استیت صفحه‌بندی با فیلترهای API
    useMemo(() => {
        setFilters(prev => ({
            ...prev,
            page: pageIndex + 1,
        }));
    }, [pageIndex, pageSize]);


    // [اصلاح] هوک useEffect برای Debouncing جستجو
    useEffect(() => {
        // یک تایمر 500 میلی‌ثانیه‌ای تنظیم می‌کند
        const timer = setTimeout(() => {
            // وقتی کاربر تایپ را متوقف کرد، فیلتر اصلی (filters) را آپدیت کن
            setFilters(prevFilters => ({
                ...prevFilters,
                search: searchTerm || undefined, // اگر خالی بود، undefined بفرست
                page: 1, // با هر جستجوی جدید، به صفحه اول برگرد
            }));
            setPageIndex(0); // ریست کردن صفحه‌بندی جدول
        }, 500); // 500 میلی‌ثانیه تاخیر

        // اگر کاربر قبل از 500ms دوباره تایپ کرد، تایمر قبلی را پاک کن
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]); // این افکت فقط زمانی اجرا می‌شود که searchTerm تغییر کند


    // --- ۸. واکشی داده‌ها با useQuery ---
    // (این هوک اکنون به صورت خودکار به تغییرات 'filters' (شامل search) واکنش نشان می‌دهد)
    const {
        data: queryResult,
        isLoading,
        isFetching
    } = useLogs(filters);

    // واکشی لیست کارمندان برای فیلتر
    const { data: employeeOptions, isLoading: isLoadingEmployees } = useEmployeeOptions();

    // داده‌های جدول (مپ شده)
    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    // اطلاعات صفحه‌بندی از API
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const pageCount = meta?.last_page || 1; // تعداد کل صفحات از API

    // --- ۹. تعریف هوک‌های Mutation ---
    const approveMutation = useApproveLog();
    // const updateMutation = useUpdateLog();

    // استیت برای مودال ویرایش
    const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);

    // --- ۱۰. تعریف هندلرها ---
    const handleApprove = (log: ActivityLog) => {
        approveMutation.mutate(log.id);
    };

    const handleEdit = (log: ActivityLog) => {
        setEditingLog(log); // باز کردن مودال ویرایش
    };

    // --- ۱۱. ساخت ستون‌ها و جدول ---
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

    // --- ۱۳. [اصلاح نهایی] هندلر فیلترها ---
    const handleFilterChange = (newApiFilters: {
        employee: SelectOption | null;
        date_from: DateObject | null;
        date_to: DateObject | null;
    }) => {

        // ... (توابع formatApiDateStart و formatApiDateEnd بدون تغییر)
        const formatApiDateStart = (date: DateObject | null): string | undefined => {
            if (!date) return undefined;
            const gregorianDate = date.convert(gregorian);
            const year = gregorianDate.year;
            const month = gregorianDate.month.number;
            const day = gregorianDate.day;
            return `${year}-${pad(month)}-${pad(day)}`;
        };

        const formatApiDateEnd = (date: DateObject | null): string | undefined => {
            if (!date) return undefined;
            const gregorianDate = date.convert(gregorian);
            const year = gregorianDate.year;
            const month = gregorianDate.month.number;
            const day = gregorianDate.day;
            return `${year}-${pad(month)}-${pad(day)} 23:59:59`;
        };

        setFilters({
            ...filters, // حفظ فیلترهای قبلی (مثل مرتب‌سازی و جستجو)
            page: 1, // ریست کردن به صفحه ۱
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

                        {/* [اصلاح] اتصال فیلد جستجو به استیت محلی searchTerm */}
                        <div className="relative w-full sm:w-60">
                            <Input
                                label=''
                                type="text"
                                placeholder="جستجو (نام، کد پرسنلی)..."
                                className="w-full pr-10 py-2 text-sm" // کلاس‌های ... حذف شد
                                // مقدار Input از استیت محلی خوانده می‌شود
                                value={searchTerm}
                                // onChange استیت محلی را آپدیت می‌کند (نه فیلتر اصلی)
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} className="absolute right-3 top-1/3" />
                        </div>

                        <Button
                            variant='primary'
                            onClick={handelNewReport}
                            type="button"
                            className="flex items-center"> {/* کلاس ... حذف شد */}
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

                {/* --- ۱۴. مودال ویرایش --- */}
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