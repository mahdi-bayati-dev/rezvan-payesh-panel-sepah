import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
// [اصلاح ۱] آیکون CheckCircle برای مودال اضافه شد
import { Plus, Download, CheckCircle } from "lucide-react";
import { type DateObject } from "react-multi-date-picker";
// import { type SelectOption } from "@/components/ui/SelectBox";
import gregorian from "react-date-object/calendars/gregorian";
import { getEcho } from "@/lib/echoService";
// [اصلاح] ایمپورت تایپ ApiFilters
import {
    ActivityFilters,
    type ApiFilters,
} from "@/features/reports/components/reportsPage/activityFilters";

// --- ایمپورت هوک‌های داده ---
import {
    useLogs,
    useApproveLog,
    // useEmployeeOptionsList,
    reportKeys,
} from "../hooks/hook";

// --- ایمپورت تایپ‌ها و کامپوننت‌ها ---
import { columns as createColumns } from "@/features/reports/components/reportsPage/TableColumns";
import { type ActivityLog, type ApiAttendanceLog } from "../types";
import { type LogFilters } from "../api/api";
import { mapApiLogToActivityLog } from "../utils/dataMapper";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
// import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// [اصلاح] ایمپورت مودال تایید
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

// [مهم] مودال فرم خروجی همچنان نیاز است
import { ExportModal } from "@/features/reports/components/Export/ExportModal";

// (تابع pad بدون تغییر)
function pad(num: number): string {
    return num < 10 ? "0" + num : num.toString();
}

// (تابع formatApiDate بدون تغییر)
const formatApiDate = (date: DateObject | null): string | undefined => {
    if (!date) return undefined;
    const gregorianDate = date.convert(gregorian);
    return `${gregorianDate.year}-${pad(gregorianDate.month.number)}-${pad(
        gregorianDate.day
    )}`;
};

// =============================
// 🧾 کامپوننت صفحه
// =============================
export default function ActivityReportPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isExportFormModalOpen, setIsExportFormModalOpen] = useState(false);

    // --- استیت برای مدیریت مودال تایید ---
    const [logToApprove, setLogToApprove] = useState<ActivityLog | null>(null);
    // --- ---

    // --- استیت filters (هماهنگ با PaginationState) ---
    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        per_page: 10, // مقدار اولیه باید با pageSize یکی باشد
        sort_by: "timestamp",
        sort_dir: "desc",
        localDateFrom: null as DateObject | null,
        localDateTo: null as DateObject | null,
    });

    // const [searchTerm, setSearchTerm] = useState("");

    // --- استیت pagination (هماهنگ با filters) ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- [اصلاح کلیدی] ---
    // ۱. استفاده از useEffect به جای useMemo برای همگام‌سازی استیت جدول با فیلتر API
    // ۲. آپدیت کردن همزمان per_page و page
    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            page: pageIndex + 1, // صفحه برای API (از ۱ شروع می‌شود)
            per_page: pageSize,   // تعداد آیتم در صفحه
        }));
    }, [pageIndex, pageSize]); // این افکت فقط به تغییرات جدول (کلیک روی دکمه‌های Pagination) واکنش نشان می‌دهد
    // --- [پایان اصلاح] ---


    // --- افکت جستجو (Debounce) ---
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         // وقتی کاربر تایپ می‌کند، فیلترها را آپدیت کن و به صفحه ۱ برگرد
    //         setFilters((prevFilters) => ({
    //             ...prevFilters,
    //             search: searchTerm || undefined,
    //             page: 1, // ریست کردن صفحه در فیلترها
    //         }));
    //         // استیت خود جدول را هم به صفحه ۰ (اول) برگردان
    //         setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    //     }, 500);
    //     return () => {
    //         clearTimeout(timer);
    //     };
    // }, [searchTerm]); // فقط به جستجو واکنش نشان می‌دهد

    // (تابع logSocket - [اصلاح] متغیر styles اضافه شد)
    const logSocket = (
        level: "info" | "error" | "success",
        message: string,
        data: any = ""
    ) => {
        // [اصلاح] تعریف متغیر styles
        const styles = {
            info: "background: #3498db; color: white; padding: 2px 8px; border-radius: 3px;",
            error: "background: #e74c3c; color: white; padding: 2px 8px; border-radius: 3px;",
            success: "background: #2ecc71; color: white; padding: 2px 8px; border-radius: 3px;",
        };
        console.log(
            `%c[ReportPage]%c ${message}`,
            styles[level], // حالا متغیر styles در دسترس است
            "font-weight: bold;",
            data
        );
    };

    // --- (واکشی داده‌ها و وب‌سوکت بدون تغییر) ---
    const { data: queryResult, isLoading, isFetching } = useLogs(filters);

    // const { data: employeeOptions, isLoading: isLoadingEmployees } =
    //     useEmployeeOptionsList();

    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);

    useEffect(() => {
        const echo = getEcho();
        if (!echo) {
            logSocket("error", "اتصال Echo برقرار نیست.");
            return;
        }

        const channelName = "super-admin-global";
        const eventNameFromDocs = ".attendance.created";

        // ✅ تغییر ۱: ما اینجا کانال را "ترک" نمی‌کنیم، فقط لیسنر اضافه/حذف می‌کنیم
        // چون این کانال توسط GlobalRequestSocketHandler (یا هندلر مشابه ادمین) باز نگه داشته می‌شود.

        logSocket("info", `در حال گوش دادن به رویداد: '${eventNameFromDocs}' روی کانال ${channelName}...`);

        const privateChannel = echo.private(channelName);

        // تعریف لیسنر
        const handleEvent = (event: any) => {
            logSocket("success", `✅ رویداد دریافت شد: '${eventNameFromDocs}'`, event);
            const newApiLog = event.log as ApiAttendanceLog;

            if (newApiLog) {
                logSocket("info", `به‌روزرسانی مستقیم کش با لاگ جدید...`, newApiLog);
                const newActivityLog = mapApiLogToActivityLog(newApiLog);

                // آپدیت Optimistic
                queryClient.setQueryData(
                    reportKeys.list(filters),
                    (oldData: { data: ActivityLog[]; meta: any } | undefined) => {
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
                                total: (oldData.meta.total || 0) + 1,
                            },
                        };
                    }
                );
            } else {
                queryClient.invalidateQueries({
                    queryKey: reportKeys.lists(),
                });
            }
        };

        // اتصال لیسنر
        privateChannel.listen(eventNameFromDocs, handleEvent);

        // ✅ تغییر ۲: در Cleanup فقط stopListening می‌کنیم
        return () => {
            logSocket("info", `توقف گوش دادن به: ${eventNameFromDocs} (کانال باز می‌ماند)`);
            privateChannel.stopListening(eventNameFromDocs);
            // ❌ حذف شد: leaveChannel(channelName); <--- این خط باعث باگ بود
        };
    }, [queryClient, filters, meta]); // وابستگی‌ها


    const pageCount = meta?.last_page || 1;
    const approveMutation = useApproveLog();
    const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);

    // --- (هندلرهای Approve و Edit و مودال تایید، بدون تغییر) ---
    const handleApprove = (log: ActivityLog) => {
        setLogToApprove(log);
    };

    const handleEdit = (log: ActivityLog) => {
        setEditingLog(log);
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
    // --- ---

    const columns = useMemo(
        () =>
            createColumns({
                onApprove: handleApprove,
                onEdit: handleEdit,
            }),
        []
    );

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
        onPaginationChange: setPagination, // این تابع setPagination را مستقیماً فراخوانی می‌کند
        getCoreRowModel: getCoreRowModel(),
    });

    const handelNewReport = () => {
        navigate("/reports/new");
    };

    // --- هندلر فیلترها (هماهنگ با تایپ ApiFilters) ---
    const handleFilterChange = (newLocalFilters: ApiFilters) => {
        const apiDateFrom = formatApiDate(newLocalFilters.date_from);
        const apiDateTo = formatApiDate(newLocalFilters.date_to);

        setFilters((prev) => ({
            ...prev,
            page: 1, // ریست کردن صفحه در فیلترها
            employee_id: newLocalFilters.employee
                ? Number(newLocalFilters.employee.id)
                : undefined,
            date_from: apiDateFrom,
            date_to: apiDateTo,
            localDateFrom: newLocalFilters.date_from,
            localDateTo: newLocalFilters.date_to,
        }));

        // استیت خود جدول را هم به صفحه ۰ (اول) برگردان
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    // [حذف] تابع setPageIndex(0) چون با setPagination ادغام شد

    const handleExportFormSubmitted = () => {
        setIsExportFormModalOpen(false);
    };

    const exportFilters: LogFilters = useMemo(() => ({
        date_from: filters.date_from,
        date_to: filters.date_to,
    }), [filters.date_from, filters.date_to]);

    // --- JSX (بخش رندر) ---
    return (
        <>
            {/* (رندر مودال فرم خروجی اکسل) */}
            {isExportFormModalOpen && (
                <ExportModal
                    isOpen={isExportFormModalOpen}
                    onClose={() => setIsExportFormModalOpen(false)}
                    currentFilters={exportFilters}
                    onExportStarted={handleExportFormSubmitted}
                    formatApiDate={formatApiDate}
                />
            )}

            {/* (رندر مودال تایید تردد) */}
            <ConfirmationModal
                isOpen={!!logToApprove}
                onClose={() => setLogToApprove(null)}
                onConfirm={handleConfirmApprove}
                title="تأیید تردد"
                message={
                    <div className="text-right" dir="rtl">
                        <p>
                            آیا از تأیید این تردد برای
                            <strong className="font-bold mx-1">{logToApprove?.employee.name}</strong>
                            در تاریخ
                            <strong className="font-bold mx-1">{logToApprove?.date}</strong>
                            ساعت
                            <strong className="font-bold mx-1">{logToApprove?.time}</strong>
                            مطمئن هستید؟
                        </p>
                        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-2">
                            این لاگ به عنوان مجاز علامت‌گذاری خواهد شد.
                        </p>
                    </div>
                }
                variant="success"
                icon={<CheckCircle className="h-6 w-6 text-successL dark:text-successD" aria-hidden="true" />}
                confirmText={approveMutation.isPending ? "در حال تایید..." : "بله، تایید کن"}
                cancelText="انصراف"
                // [اصلاح] تغییر نام پراپ به isLoading (بر اساس خطای بیلد قبلی)
                isLoading={approveMutation.isPending}
            />


            {/* --- صفحه اصلی (بدون تغییر) --- */}
            <div className="flex flex-col md:flex-row-reverse gap-6 p-4 md:p-6">
                <aside className=" mx-auto">
                    <ActivityFilters
                        onFilterChange={handleFilterChange} // حالا با تایپ ApiFilters هماهنگ است
                    // employeeOptions={employeeOptions || []}
                    // isLoadingEmployees={isLoadingEmployees}
                    />
                </aside>

                <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 space-y-4 min-w-0">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                            گزارش آخرین فعالیت‌ها
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            {/* <div className="relative w-full sm:w-60">
                                <Input
                                    label=""
                                    type="text"
                                    placeholder="جستجو (نام، کد پرسنلی)..."
                                    className="w-full pr-10 py-2 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute right-3 top-1/3" />
                            </div> */}

                            <Button
                                variant="secondary"
                                onClick={() => setIsExportFormModalOpen(true)}
                                type="button"
                                className="flex items-center w-full sm:w-auto"
                            >
                                <Download className="w-5 h-5" />
                                <span>خروجی اکسل</span>
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handelNewReport}
                                type="button"
                                className="flex items-center w-full sm:w-auto"
                            >
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
        </>
    );
}