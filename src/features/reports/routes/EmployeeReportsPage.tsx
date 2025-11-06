import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from '@tanstack/react-table';
// [رفع خطا ۴] - ایمپورت Search استفاده نشده بود و حذف شد

// --- کامپوننت‌های UI ---
import { EmployeeReportHeader } from '../components/employeeReportPage/EmployeeReportHeader';
// [رفع خطا ۵ و ۶] - ایمپورت allColumns تغییر نام پیدا کرد تا مشخص شود یک تابع است
import { columns as createColumnGenerator } from '@/features/reports/components/reportsPage/TableColumns';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { EmployeeInfoCard } from '@/features/reports/components/reportPageDetails/EmployeeInfoCard';

// --- ۱. ایمپورت هوک سفارشی ---
// (هوک useEmployeeLogs در فایل hook.ts اصلاح شده است)
import { useEmployeeLogs } from '../hooks/hook';
import { Loader2, AlertTriangle } from 'lucide-react';

// ... (کامپوننت‌های NotFoundCard و LoadingSkeleton) ...
// فرض می‌کنیم کامپوننت‌های لودینگ و خطا در اینجا تعریف شده‌اند یا ایمپورت شده‌اند
const LoadingSkeleton = () => (
    <div className="flex items-center justify-center p-10">
        <Loader2 className="w-10 h-10 animate-spin text-primaryL dark:text-primaryD" />
    </div>
);

const NotFoundCard = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-10 min-h-[300px] bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-destructiveL dark:border-destructiveD">
        <AlertTriangle className="w-12 h-12 text-destructiveL dark:text-destructiveD" />
        <h3 className="mt-4 text-xl font-bold text-destructiveL dark:text-destructiveD">
            خطا
        </h3>
        <p className="mt-2 text-base text-muted-foregroundL dark:text-muted-foregroundD">
            {message}
        </p>
    </div>
);


export default function EmployeeReportPage() {
    const { employeeApiId } = useParams<{ employeeApiId: string }>();
    const navigate = useNavigate();

    // --- ۲. استیت صفحه‌بندی ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    // --- ۳. فراخوانی هوک با اطلاعات صفحه‌بندی ---
    const {
        data: queryResult, // هوک اکنون { data, meta } برمی‌گرداند
        isLoading,
        isError
    } = useEmployeeLogs(employeeApiId, pagination); // پاس دادن صفحه‌بندی

    const employeeLogs = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    const pageCount = meta?.last_page || 1; // تعداد صفحات از API

    // --- ۴. اطلاعات کارمند ---
    const employeeInfo = useMemo(
        () => (employeeLogs && employeeLogs.length > 0 ? employeeLogs[0].employee : null),
        [employeeLogs]
    );

    // --- ۵. [رفع خطا ۵ و ۶] ---
    // allColumns یک تابع (createColumns) است و باید فراخوانی شود
    // ستون‌ها (بدون "کارمند" و "عملیات")
    const employeePageColumns = useMemo(
        () => {
            // چون این صفحه read-only است، توابع خالی پاس می‌دهیم
            const allColumns = createColumnGenerator({
                onEdit: () => { },
                onApprove: () => { },
            });
            // ستون‌های 'employee' و 'actions' را فیلتر می‌کنیم
            return allColumns.filter((col) => col.id !== 'employee' && col.id !== 'actions');
        },
        [] // وابستگی خالی صحیح است چون تابع جنریتور تغییر نمی‌کند
    );

    const table = useReactTable({
        data: employeeLogs, // داده‌های واقعی
        columns: employeePageColumns,
        pageCount: pageCount, // تعداد صفحات از API
        state: { pagination },
        // --- ۶. فعالسازی صفحه‌بندی سرور-ساید ---
        manualPagination: true,
        onPaginationChange: setPagination,
        // ---
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // (فیلتر سمت کلاینت حذف شد)
    });

    const handleGoBack = () => {
        navigate('/reports');
    };

    // --- ۷. [رفع خطا ۷ و ۸] ---
    // افزودن return به بلاک‌های if تا تایپ‌اسکریپت از null نبودن employeeInfo مطمئن شود
    if (isLoading && !employeeLogs.length) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                    <LoadingSkeleton />
                </main>
            </div>
        );
    }
    if (isError || (!isLoading && !employeeInfo)) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                    <NotFoundCard message="گزارشات این کارمند یافت نشد یا خطایی رخ داده است." />
                </main>
            </div>
        );
    }

    // [رفع خطا ۳ و ۴] - اضافه کردن یک گارد (guard) نهایی
    // گاهی اوقات تایپ‌اسکریپت در narrow کردن تایپ‌ها (فهمیدن اینکه متغیر null نیست)
    // بعد از بلاک‌های if پیچیده دچار مشکل می‌شود.
    // این if اضافی، به صراحت به TS اطمینان می‌دهد که employeeInfo نال نیست.
    if (!employeeInfo) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                    <NotFoundCard message="اطلاعات کارمند یافت نشد." />
                </main>
            </div>
        );
    }

    // --- ۸. رندر (بدون تغییر) ---
    // در این نقطه، تایپ‌اسکریپت می‌داند که employeeInfo قطعا null نیست
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                {/* [رفع خطا ۷] - حالا اینجا امن است */}
                <EmployeeReportHeader employeeName={employeeInfo.name} onBack={handleGoBack} />
                <div className="flex flex-col md:flex-row gap-6 pt-6">
                    <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">
                        {/* [رفع خطا ۸] - حالا اینجا امن است */}
                        <EmployeeInfoCard employee={employeeInfo} />
                    </aside>
                    <section className="flex-1 space-y-4 min-w-0">
                        {/* (فیلتر جستجو باید به API متصل شود) */}
                        {/* <div className="relative w-full sm:w-60"> */}
                        {/* ... input ... */}
                        {/* </div> */}
                        <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                            <DataTable table={table} isLoading={isLoading} notFoundMessage="هیچ فعالیتی یافت نشد." />
                        </section>
                        <DataTablePagination table={table} />
                    </section>
                </div>
            </main>
        </div>
    );
}