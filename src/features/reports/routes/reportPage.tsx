/* reports/routes/reportPage.tsx */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReactTable, getCoreRowModel, type PaginationState } from "@tanstack/react-table";
import { Plus, Download, ShieldCheck, FileText } from "lucide-react";
import { type DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";

import { ActivityFilters, type ApiFilters } from "@/features/reports/components/reportsPage/activityFilters";
import { useLogs, useApproveLog } from "../hooks/hook";
import { useReportSocket } from "../hooks/useReportSocket";
import { columns as createColumns } from "@/features/reports/components/reportsPage/TableColumns";
import { type ActivityLog } from "../types";
import { type LogFilters } from "../api/api";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ExportModal } from "@/features/reports/components/Export/ExportModal";
import { toast } from "react-toastify";
import { toPersianNumbers } from "../utils/toPersianNumbers";

function pad(num: number): string { return num < 10 ? "0" + num : num.toString(); }

const formatApiDate = (date: DateObject | null): string | undefined => {
    if (!date) return undefined;
    const gregorianDate = date.convert(gregorian);
    return `${gregorianDate.year}-${pad(gregorianDate.month.number)}-${pad(gregorianDate.day)}`;
};

export default function ActivityReportPage() {
    const navigate = useNavigate();
    const [isExportFormModalOpen, setIsExportFormModalOpen] = useState(false);
    const [logToApprove, setLogToApprove] = useState<ActivityLog | null>(null);

    const [filters, setFilters] = useState<LogFilters>({
        page: 1, per_page: 10, sort_by: "timestamp", sort_dir: "desc",
        localDateFrom: null as DateObject | null,
        localDateTo: null as DateObject | null,
    });

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    // هماهنگ‌سازی فیلترها با صفحه‌بندی
    useEffect(() => {
        setFilters((prev) => ({ ...prev, page: pageIndex + 1, per_page: pageSize }));
    }, [pageIndex, pageSize]);

    // دریافت داده‌ها از هوک React Query
    const { data: queryResult, isLoading, isFetching } = useLogs(filters);
    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const totalRows = meta?.total || 0;

    // اتصال به سوکت برای آپدیت زنده
    useReportSocket(filters);

    const pageCount = meta?.last_page || 1;

    // هوک تایید (Mutation)
    const approveMutation = useApproveLog();

    const handleApprove = (log: ActivityLog) => {
        setLogToApprove(log);
    };

    // استفاده از _ برای پارامتر بلااستفاده (رفع ارور Build) - منطق تغییری نکرده
    const handleEdit = (_log: ActivityLog) => {
        toast.info("قابلیت ویرایش به زودی فعال می‌شود.");
    };

    const handleConfirmApprove = () => {
        if (!logToApprove) return;
        approveMutation.mutate(logToApprove.id, {
            onSuccess: () => {
                setLogToApprove(null);
            },
            onError: () => {
                console.error("Failed to approve log.");
            }
        });
    };

    const columns = useMemo(() => createColumns({ onApprove: handleApprove, onEdit: handleEdit }), []);

    const table = useReactTable({
        data: logsData,
        columns,
        pageCount: pageCount,
        state: { pagination: { pageIndex, pageSize } },
        manualPagination: true,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleFilterChange = (newLocalFilters: ApiFilters) => {
        const apiDateFrom = formatApiDate(newLocalFilters.date_from);
        const apiDateTo = formatApiDate(newLocalFilters.date_to);
        setFilters((prev) => ({
            ...prev, page: 1,
            employee_id: newLocalFilters.employee ? Number(newLocalFilters.employee.id) : undefined,
            date_from: apiDateFrom, date_to: apiDateTo,
            localDateFrom: newLocalFilters.date_from, localDateTo: newLocalFilters.date_to,
        }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handleExportFormSubmitted = () => {
        setIsExportFormModalOpen(false);
    };

    const exportFilters: LogFilters = useMemo(() => ({
        date_from: filters.date_from,
        date_to: filters.date_to,
    }), [filters.date_from, filters.date_to]);

    return (
        <div className="p-3 md:p-6 min-h-screen">
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row-reverse gap-2">

                {/* سایدبار فیلتر (ریسپانسیو داخلی) */}
                <div className="w-full lg:w-80 lg:sticky lg:top-6 lg:self-start">
                    <ActivityFilters onFilterChange={handleFilterChange} />
                </div>

                {/* محتوای اصلی */}
                <main className="flex-1 min-w-0">
                    <section className="bg-backgroundL-500 dark:bg-backgroundD rounded-3xl border border-borderL dark:border-borderD shadow-sm overflow-hidden transition-all duration-300">

                        {/* --- هدر اصلاح شده و کاملاً ریسپانسیو --- */}
                        <div className="p-4 sm:p-6 border-b border-borderL dark:border-borderD bg-gradient-to-l from-transparent via-transparent to-primaryL/5 dark:to-primaryD/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">

                                {/* بخش سمت راست: عنوان، آیکون و وضعیت داده‌ها */}
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    {/* باکس آیکون با ابعاد متغیر */}
                                    <div className="p-2.5 sm:p-3 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl sm:rounded-2xl flex-shrink-0">
                                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primaryL dark:text-primaryD" />
                                    </div>

                                    {/* متن عنوان و تعداد رکوردها */}
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-base sm:text-lg md:text-xl font-black text-foregroundL dark:text-foregroundD truncate">
                                            گزارش فعالیت‌ها
                                        </h1>

                                        <div className="text-[10px] sm:text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5 sm:mt-1.5 flex items-center gap-2">
                                            {/* نشانگر وضعیت زنده (Live Indicator) */}
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="truncate opacity-80">
                                                {isLoading
                                                    ? "در حال دریافت اطلاعات..."
                                                    : `${toPersianNumbers(totalRows)} مورد در سیستم ثبت شده`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* بخش سمت چپ: دکمه‌های عملیاتی (Actions) */}
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    {/* دکمه خروجی اکسل */}
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsExportFormModalOpen(true)}
                                        className="flex-1 sm:flex-none h-9 sm:h-11 px-3 sm:px-5 gap-1.5 sm:gap-2 rounded-xl text-[11px] sm:text-sm font-bold border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/10 hover:bg-secondaryL/40 transition-all active:scale-95"
                                    >
                                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="whitespace-nowrap">خروجی اکسل</span>
                                    </Button>

                                    {/* دکمه ثبت فعالیت جدید */}
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate("/reports/new")}
                                        className="flex-1 sm:flex-none h-9 sm:h-11 px-3 sm:px-5 gap-1.5 sm:gap-2 rounded-xl text-[11px] sm:text-sm font-bold shadow-lg shadow-primaryL/20 dark:shadow-primaryD/10 transition-all active:scale-95"
                                    >
                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="whitespace-nowrap">ثبت فعالیت</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* جدول داده‌ها */}
                        <div className="relative">
                            <div className="overflow-x-auto custom-scrollbar">
                                <DataTable
                                    table={table}
                                    isLoading={isLoading || isFetching}
                                    notFoundMessage="رکوردی با مشخصات انتخاب شده یافت نشد."
                                />
                            </div>
                        </div>

                        {/* صفحه‌بندی */}
                        <div className="p-4 border-t border-borderL dark:border-borderD bg-secondaryL/5 dark:bg-secondaryD/5">
                            <DataTablePagination table={table} />
                        </div>
                    </section>
                </main>
            </div>

            {/* مودال خروجی */}
            {isExportFormModalOpen && (
                <ExportModal
                    isOpen={isExportFormModalOpen}
                    onClose={() => setIsExportFormModalOpen(false)}
                    currentFilters={exportFilters}
                    onExportStarted={handleExportFormSubmitted}
                    formatApiDate={formatApiDate}
                />
            )}

            {/* مودال تأیید (با بازگشت تمام جزئیات منطقی نسخه اول تو) */}
            <ConfirmationModal
                isOpen={!!logToApprove}
                onClose={() => setLogToApprove(null)}
                onConfirm={handleConfirmApprove}
                title="تأیید نهایی تردد"
                message={
                    <div className="text-right flex flex-col gap-3" dir="rtl">
                        <p className="leading-7">
                            آیا از تأیید تردد مربوط به
                            <strong className="text-foregroundL dark:text-foregroundD mx-1 bg-secondaryL/50 dark:bg-secondaryD px-1 rounded">
                                {logToApprove?.employee.name}
                            </strong>
                            مطمئن هستید؟
                        </p>

                        <div className="text-sm bg-secondaryL/30 dark:bg-secondaryD/20 p-3 rounded-lg border border-borderL dark:border-borderD space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foregroundL">تاریخ:</span>
                                <span dir="ltr">{logToApprove?.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foregroundL">ساعت:</span>
                                <span dir="ltr" >{logToApprove?.time}</span>
                            </div>
                            {(logToApprove?.lateness_minutes ?? 0) > 0 && (
                                <div className="flex justify-between text-destructiveL dark:text-destructiveD">
                                    <span>میزان تاخیر:</span>
                                    <span>{toPersianNumbers(logToApprove?.lateness_minutes)} دقیقه</span>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            با تایید این مورد، وضعیت آن به «مجاز» تغییر کرده و در گزارش‌ها سبز می‌شود.
                        </p>
                    </div>
                }
                variant="success"
                icon={<ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                confirmText={approveMutation.isPending ? "در حال ثبت..." : "بله، تایید و مجاز شود"}
                cancelText="انصراف"
                isLoading={approveMutation.isPending}
            />
        </div>
    );
}