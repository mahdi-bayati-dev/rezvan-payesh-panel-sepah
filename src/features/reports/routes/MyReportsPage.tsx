import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
// [مهم] leaveChannel را ایمپورت می‌کنیم
import { getEcho, leaveChannel } from "@/lib/echoService";
import {
    useReactTable,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { toast } from "react-toastify";

// --- ایمپورت هوک‌های داده (مختص کاربر) ---
import { useMyLogs, reportKeys } from "../hooks/hook";

// --- ایمپورت تایپ‌ها و کامپوننت‌ها (مختص کاربر) ---
import { myReportsColumns } from "@/features/reports/components/myReportsPage/MyReportsTableColumns";
import {
    type MyLogFilters,

} from "@/features/reports/api/api";
import {
    type ApiAttendanceLog, // این باید از فایل types بیاید
} from "../types"; // <-- مسیر صحیح
import { mapApiLogToActivityLog } from "../utils/dataMapper"; // [مهم] برای نوتیفیکیشن
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { MyActivityFilters } from "@/features/reports/components/myReportsPage/MyActivityFilters";
import Input from "@/components/ui/Input";

// =============================
// 🧾 کامپوننت صفحه "گزارش‌های من"
// =============================
export default function MyReportsPage() {
    const queryClient = useQueryClient();
    const user = useAppSelector(selectUser);
    const userId = user?.id;

    // ... (تمام استیت‌ها و افکت‌های مربوط به فیلتر، جدول و جستجو بدون تغییر) ...
    const [filters, setFilters] = useState<MyLogFilters>({
        page: 1,
        per_page: 10,
        sort_by: "timestamp",
        sort_dir: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([
        { id: "timestamp", desc: true },
    ]);

    useMemo(() => {
        setFilters((prev) => ({
            ...prev,
            page: pageIndex + 1,
            per_page: pageSize,
        }));
    }, [pageIndex, pageSize]);

    useEffect(() => {
        if (!sorting.length) {
            setFilters((prev) => ({
                ...prev,
                sort_by: "timestamp",
                sort_dir: "desc",
            }));
            return;
        }
        const sort = sorting[0];
        const apiSortKey = sort.id as MyLogFilters["sort_by"];
        setFilters((prev) => ({
            ...prev,
            sort_by: apiSortKey,
            sort_dir: sort.desc ? "desc" : "asc",
        }));
    }, [sorting]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prevFilters) => ({
                ...prevFilters,
                search: searchTerm || undefined,
                page: 1,
            }));
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    const {
        data: queryResult,
        isLoading,
        isFetching,
    } = useMyLogs(filters);

    const logsData = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const pageCount = Array.isArray(meta?.last_page)
        ? meta.last_page[0] || 1
        : meta?.last_page || 1;

    // --- [کد صحیح وب‌سوکت] افکت (استراتژی Invalidate + Delay) ---
    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) {
            console.warn(
                "[MyReportsPage] Echo not ready or User ID not found. Skipping websocket."
            );
            return;
        }

        const channelName = `App.User.${userId}`;
        const eventName = ".attendance.created";

        console.log(
            `%c[MyReportsPage] Subscribing to: %c${channelName}`,
            "color: blue; font-weight: bold;",
            "color: blue;"
        );
        const privateChannel = echo.private(channelName);

        privateChannel.error((error: any) => {
            console.error(
                `%c[MyReportsPage] FAILED to subscribe to %c${channelName}`,
                "color: red; font-weight: bold;",
                "color: red;",
                error
            );
            toast.error("خطا در اتصال به سرور ریل‌تایم.");
        });

        privateChannel.listen(eventName, (event: { log: ApiAttendanceLog }) => {
            console.log(
                `%c[MyReportsPage] Event Received: %c'${eventName}'`,
                "color: green; font-weight: bold;",
                "color: green;",
                event
            );

            const apiLog = event.log;
            if (!apiLog) {
                console.error("[MyReportsPage] Event is missing 'log' data.", event);
                return;
            }

            // ۵. [نوتیفیکیشن] - بلافاصله نوتیفیکیشن را نشان بده
            const newActivityLog = mapApiLogToActivityLog(apiLog);
            const logText =
                newActivityLog.activityType === "entry" ? "ورود شما" : "خروج شما";
            const logTime = `${newActivityLog.date} - ${newActivityLog.time}`;
            toast.success(`✅ ${logText} در ${logTime} ثبت شد.`);

            // ۶. [ریل‌تایم] - با تاخیر، لیست را رفرش کن
            setTimeout(() => {
                console.log(
                    "%c[MyReportsPage] Invalidating queries (forcing refetch)...",
                    "color: orange; font-weight: bold;"
                );
                queryClient.invalidateQueries({
                    queryKey: reportKeys.myLists(),
                });
            }, 1500); // تاخیر ۱.۵ ثانیه‌ای
        });

        // --- ۷. Cleanup (مهم) ---
        return () => {
            console.log(
                `%c[MyReportsPage] Leaving channel: %c${channelName}`,
                "color: gray;",
                "color: gray; font-style: italic;"
            );
            privateChannel.stopListening(eventName);
            leaveChannel(channelName);
        };
    }, [queryClient, userId]); // وابستگی فقط به این دو مورد است

    // --- تعریف جدول (بدون تغییر) ---
    const table = useReactTable({
        data: logsData,
        columns: myReportsColumns,
        pageCount: pageCount,
        state: {
            pagination: { pageIndex, pageSize },
            sorting,
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
    });

    // --- هندلر فیلتر (بدون تغییر) ---
    const handleFilterChange = (
        newApiFilters: Pick<MyLogFilters, "start_date" | "end_date" | "type">
    ) => {
        setFilters({
            ...filters,
            page: 1,
            ...newApiFilters,
        });
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    // --- JSX (بخش رندر) ---
    return (
        <>
            {/* [اصلاح چیدمان] ساختار divها مانند صفحه requestsPage شد */}
            <div className="flex flex-col md:flex-row-reverse gap-4 p-4 sm:p-6">

                {/* این div تگ <aside> را به کامپوننت فیلتر واگذار می‌کند */}
                <div className="w-full md:w-64 lg:w-72 md:sticky md:top-4 md:self-start flex-shrink-0">
                    <MyActivityFilters onFilterChange={handleFilterChange} />
                </div>

                <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 sm:p-6 space-y-4 min-w-0">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                            گزارش آخرین فعالیت‌های من
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-60">
                                <Input
                                    label=""
                                    type="text"
                                    placeholder="جستجو در ملاحظات..."
                                    className="w-full pr-10 py-2 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute right-3 top-1/3" />
                            </div>
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
                </main>
            </div>
        </>
    );
}