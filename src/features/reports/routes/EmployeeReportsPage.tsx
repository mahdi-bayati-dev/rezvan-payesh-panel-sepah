// src/features/reports/routes/EmployeeReportPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    type PaginationState,
} from '@tanstack/react-table';
import {  Search } from 'lucide-react';
import { EmployeeReportHeader } from '../components/employeeReportPage/EmployeeReportHeader';

// --- ایمپورت داده‌ها، تایپ‌ها و کامپوننت‌های ماژولار ---
import { mockActivityLogs } from '../data/mockData';
// ۱. تمام ستون‌ها را ایمپورت می‌کنیم
import { columns as allColumns } from '@/features/reports/components/reportsPage/TableColumns';
// ۲. کامپوننت‌های UI جدول
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
// ۳. کامپوننت سایدبار (آداپتور)
import { EmployeeInfoCard } from '@/features/reports/components/reportPageDetails/EmployeeInfoCard';

// --- کامپوننت‌های هدر و خطا (مشابه ReportPageDetails) ---


// کامپوننت خطا
const NotFoundCard = () => (
    <div className="p-6 text-center ...">
        <h3 className="text-lg font-semibold text-destructiveL dark:text-destructiveD">
            کارمند یافت نشد
        </h3>
    </div>
);

// --- کامپوننت اصلی صفحه ---
export default function EmployeeReportPage() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();

    // --- ۱. آماده‌سازی داده‌ها ---
    // داده‌های جدول: فقط لاگ‌های مربوط به این employeeId
    const employeeLogs = useMemo(
        () => mockActivityLogs.filter((r) => r.employee.employeeId === employeeId),
        [employeeId]
    );
    // داده‌های سایدبار: اطلاعات کارمند (از اولین لاگ)
    const employeeInfo = useMemo(
        () => (employeeLogs.length > 0 ? employeeLogs[0].employee : null),
        [employeeLogs]
    );

    // --- ۲. تعریف ستون‌ها (حذف ستون تکراری "مشخصات") ---
    // ما ستون "مشخصات" (employee) را نمی‌خواهیم چون در سایدبار است
    const employeePageColumns = useMemo(
        () => allColumns.filter((col) => col.id !== 'employee'),
        []
    );

    // --- ۳. منطق جدول (کپی شده از ActivityReportPage) ---
    // فقط به فیلتر جستجوی عمومی و صفحه‌بندی نیاز داریم
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    const table = useReactTable({
        data: employeeLogs, // ✅ استفاده از داده‌های فیلتر شده کارمند
        columns: employeePageColumns, // ✅ استفاده از ستون‌های فیلتر شده
        pageCount: Math.ceil(employeeLogs.length / pageSize),
        state: { pagination, globalFilter, sorting },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // برای جستجوی عمومی
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // --- ۴. توابع هندلر ---
    const handleGoBack = () => {
        navigate('/reports'); // بازگشت به لیست اصلی
    };

    // --- ۵. رندر ---
    if (!employeeInfo) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <NotFoundCard />
            </div>
        );
    }

    return (
        // ۶. استفاده از لایه‌بندی اصلی (والد) دقیقاً مشابه ReportPageDetails
        <div className="p-4 max-w-7xl mx-auto">
            <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                {/* هدر صفحه با نام کارمند */}
                <EmployeeReportHeader employeeName={employeeInfo.name} onBack={handleGoBack} />

                <div className="flex flex-col md:flex-row gap-6 pt-6">

                    {/* سایدبار: مشخصات کارمند (مشابه ReportPageDetails) */}
                    <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">
                        <EmployeeInfoCard employee={employeeInfo} />
                    </aside>


                    <section className="flex-1 space-y-4 min-w-0">

                        {/* فیلد جستجوی عمومی (اختیاری) */}
                        <div className="relative w-full sm:w-60">
                            <input
                                type="text"
                                placeholder="جستجو در گزارش‌ها..."
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="w-full pr-10 py-2 text-sm bg-inputL dark:bg-inputD text-foregroundL dark:text-foregroundD border border-borderL dark:border-borderD rounded-lg focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD"
                            />
                            <Search
                                size={18}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none"
                            />
                        </div>

                        {/* جدول داده‌ها */}
                        <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                            <DataTable table={table} notFoundMessage="هیچ فعالیتی برای این کارمند یافت نشد." />
                        </section>

                        {/* صفحه‌بندی */}
                        <DataTablePagination table={table} />

                    </section>
                </div>
            </main>
        </div>
    );
}