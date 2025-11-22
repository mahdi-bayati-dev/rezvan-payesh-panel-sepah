import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from '@tanstack/react-table';

// کامپوننت‌های UI
import { EmployeeReportHeader } from '../components/employeeReportPage/EmployeeReportHeader';
import { columns as createColumnGenerator } from '@/features/reports/components/reportsPage/TableColumns';
import { DataTable } from '@/components/ui/DataTable';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { EmployeeInfoCard } from '@/features/reports/components/reportPageDetails/EmployeeInfoCard';
import { Skeleton } from '@/components/ui/Skeleton'; 
import { AlertTriangle } from 'lucide-react';

// هوک‌ها
import { useEmployeeLogs } from '../hooks/hook';

// --- ۱. کامپوننت اسکلت اختصاصی (Anti-Layout Shift) ---
const EmployeeReportPageSkeleton = () => (
    <div className="p-4 max-w-7xl mx-auto animate-pulse">
        <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
            {/* هدر */}
            <div className="flex justify-between mb-6 pb-4 border-b border-borderL dark:border-borderD">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* سایدبار (کارت اطلاعات) */}
                <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-4">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </aside>

                {/* بخش جدول */}
                <section className="flex-1 space-y-4">
                    <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                        {/* هدر جدول */}
                        <div className="bg-secondaryL dark:bg-secondaryD p-3 h-12" />
                        {/* ردیف‌های جدول */}
                        <div className="p-3 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex justify-between gap-4">
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>
);

const NotFoundCard = ({ message, onBack }: { message: string, onBack?: () => void }) => (
    <div className="flex flex-col items-center justify-center p-10 min-h-[300px] bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-destructiveL dark:border-destructiveD">
        <AlertTriangle className="w-12 h-12 text-destructiveL dark:text-destructiveD" />
        <h3 className="mt-4 text-xl font-bold text-destructiveL dark:text-destructiveD">
            خطا
        </h3>
        <p className="mt-2 text-base text-muted-foregroundL dark:text-muted-foregroundD mb-4">
            {message}
        </p>
        {onBack && (
            <button onClick={onBack} className="text-sm text-primaryL dark:text-primaryD hover:underline">
                بازگشت به لیست
            </button>
        )}
    </div>
);

export default function EmployeeReportPage() {
    const { employeeApiId } = useParams<{ employeeApiId: string }>();
    const navigate = useNavigate();

    // مدیریت صفحه بندی (Server-Side Pagination)
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    // واکشی دیتا
    const {
        data: queryResult,
        isLoading,
        isError
    } = useEmployeeLogs(employeeApiId, pagination);

    const employeeLogs = useMemo(() => queryResult?.data || [], [queryResult]);
    const meta = useMemo(() => queryResult?.meta, [queryResult]);
    
    // استخراج اطلاعات کارمند (با علم به اینکه فعلا از اولین لاگ گرفته می‌شود)
    const employeeInfo = useMemo(
        () => (employeeLogs && employeeLogs.length > 0 ? employeeLogs[0].employee : null),
        [employeeLogs]
    );

    // ساخت ستون‌ها (حذف ستون‌های تکراری مثل نام کارمند)
    const employeePageColumns = useMemo(() => {
        const allColumns = createColumnGenerator({
            onEdit: () => { },
            onApprove: () => { },
        });
        return allColumns.filter((col) => col.id !== 'employee' && col.id !== 'actions');
    }, []);

    const table = useReactTable({
        data: employeeLogs,
        columns: employeePageColumns,
        pageCount: meta?.last_page || 1,
        state: { pagination },
        manualPagination: true,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleGoBack = () => {
        navigate('/reports');
    };

    // --- رندرینگ شرطی (Conditional Rendering) ---

    // ۱. حالت لودینگ: استفاده از Skeleton کامل
    if (isLoading) {
        return <EmployeeReportPageSkeleton />;
    }

    // ۲. حالت خطا
    if (isError) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                    <NotFoundCard message="خطایی در دریافت اطلاعات رخ داده است." onBack={handleGoBack} />
                </main>
            </div>
        );
    }

    // ۳. حالت نبودن اطلاعات (لیست خالی)
    if (!employeeInfo) {
         return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                    <NotFoundCard message="هیچ گزارش فعالیتی برای این کارمند یافت نشد." onBack={handleGoBack} />
                </main>
            </div>
        );
    }

    // ۴. رندر نهایی صفحه
    return (
        <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500">
            <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
                <EmployeeReportHeader employeeName={employeeInfo.name} onBack={handleGoBack} />
                
                <div className="flex flex-col md:flex-row gap-6 pt-6">
                    <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">
                        <EmployeeInfoCard logEmployee={employeeInfo} />
                    </aside>
                    
                    <section className="flex-1 space-y-4 min-w-0">
                        <section className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                            <DataTable 
                                table={table} 
                                isLoading={false} // لودینگ توسط صفحه هندل شده
                                notFoundMessage="هیچ فعالیتی یافت نشد." 
                            />
                        </section>
                        <DataTablePagination table={table} />
                    </section>
                </div>
            </main>
        </div>
    );
}