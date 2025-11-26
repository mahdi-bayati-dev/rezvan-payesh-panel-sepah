import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
} from "@tanstack/react-table";
import { Plus, Download, CheckCircle, FileText } from "lucide-react";
import { type DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";

import {
    ActivityFilters,
    type ApiFilters,
} from "@/features/reports/components/reportsPage/activityFilters";

import {
    useLogs,
    useApproveLog,
} from "../hooks/hook";

import { useReportSocket } from "../hooks/useReportSocket";

import { columns as createColumns } from "@/features/reports/components/reportsPage/TableColumns";
import { type ActivityLog } from "../types";
import { type LogFilters } from "../api/api";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ExportModal } from "@/features/reports/components/Export/ExportModal";
import { toPersianNumbers } from "../utils/toPersianNumbers";
import { toast } from "react-toastify"; // برای نمایش پیام ویرایش

function pad(num: number): string {
    return num < 10 ? "0" + num : num.toString();
}

const formatApiDate = (date: DateObject | null): string | undefined => {
    if (!date) return undefined;
    const gregorianDate = date.convert(gregorian);
    return `${gregorianDate.year}-${pad(gregorianDate.month.number)}-${pad(
        gregorianDate.day
    )}`;
};

export default function ActivityReportPage() {
    const navigate = useNavigate();

    const [isExportFormModalOpen, setIsExportFormModalOpen] = useState(false);
    const [logToApprove, setLogToApprove] = useState<ActivityLog | null>(null);

    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        per_page: 10,
        sort_by: "timestamp",
        sort_dir: "desc",
        localDateFrom: null as DateObject | null,
        localDateTo: null as DateObject | null,
    });

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            page: pageIndex + 1,
            per_page: pageSize,
        }));
    }, [pageIndex, pageSize]);

    const { data: queryResult, isLoading, isFetching } = useLogs(filters);

    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const totalRows = meta?.total || 0;

    useReportSocket(filters);

    const pageCount = meta?.last_page || 1;
    const approveMutation = useApproveLog();

    // ✅ حذف متغیر استفاده نشده editingLog برای رفع خطای بیلد
    // const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);

    const handleApprove = (log: ActivityLog) => {
        setLogToApprove(log);
    };

    const handleEdit = (log: ActivityLog) => {
        // setEditingLog(log);
        // فعلاً فقط یک پیام نمایش می‌دهیم تا زمانی که مودال ویرایش پیاده‌سازی شود
        console.log("Edit requested for:", log.id);
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
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    });

    const handelNewReport = () => {
        navigate("/reports/new");
    };

    const handleFilterChange = (newLocalFilters: ApiFilters) => {
        const apiDateFrom = formatApiDate(newLocalFilters.date_from);
        const apiDateTo = formatApiDate(newLocalFilters.date_to);

        setFilters((prev) => ({
            ...prev,
            page: 1,
            employee_id: newLocalFilters.employee
                ? Number(newLocalFilters.employee.id)
                : undefined,
            date_from: apiDateFrom,
            date_to: apiDateTo,
            localDateFrom: newLocalFilters.date_from,
            localDateTo: newLocalFilters.date_to,
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
        <>
            {isExportFormModalOpen && (
                <ExportModal
                    isOpen={isExportFormModalOpen}
                    onClose={() => setIsExportFormModalOpen(false)}
                    currentFilters={exportFilters}
                    onExportStarted={handleExportFormSubmitted}
                    formatApiDate={formatApiDate}
                />
            )}

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
                isLoading={approveMutation.isPending}
            />

            <div className="flex flex-col lg:flex-row-reverse gap-6 p-4 md:p-6 min-h-screen">
                <aside className="w-full lg:w-72 lg:sticky lg:top-6 lg:self-start">
                    <ActivityFilters
                        onFilterChange={handleFilterChange}
                    />
                </aside>

                <main className="flex-1 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD p-5 sm:p-6 shadow-sm border border-borderL dark:border-borderD flex flex-col gap-6">

                    <div className="flex flex-col gap-4">
                        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl">
                                    <FileText className="w-6 h-6 text-primaryL dark:text-primaryD" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                                        گزارش فعالیت‌ها
                                    </h2>
                                    {/* <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5">
                                        {isLoading ? "در حال بارگذاری..." : `${toPersianNumbers(totalRows)} رکورد ثبت شده`}
                                    </p> */}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsExportFormModalOpen(true)}
                                    type="button"
                                    className="flex-1 sm:flex-none items-center gap-2 hover:bg-secondaryL dark:hover:bg-secondaryD"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>خروجی اکسل</span>
                                </Button>

                                <Button
                                    variant="primary"
                                    onClick={handelNewReport}
                                    type="button"
                                    className="flex-1 sm:flex-none items-center gap-2 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>ثبت فعالیت</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-borderL dark:border-borderD rounded-2xl overflow-hidden shadow-sm">
                        <DataTable
                            table={table}
                            isLoading={isLoading || isFetching}
                            notFoundMessage="هیچ فعالیتی با فیلترهای انتخاب شده یافت نشد."
                        />
                    </div>

                    <DataTablePagination table={table} />
                </main>
            </div>
        </>
    );
}