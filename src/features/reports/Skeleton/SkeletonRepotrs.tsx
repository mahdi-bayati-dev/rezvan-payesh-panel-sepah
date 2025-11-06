import { Skeleton } from '@/components/ui/Skeleton';

/**
 * اسکلت لودینگ اختصاصی برای صفحه گزارش‌ها (ActivityReportPage)
 * این کامپوننت ساختار بصری صفحه، شامل فیلترها و جدول را شبیه‌سازی می‌کند.
 */

// اسکلت جدول (هدر + چند ردیف)
const TableSkeleton = () => (
    <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
        <div className="w-full">
            {/* Fake Table Header */}
            <div className="bg-secondaryL dark:bg-secondaryD p-3">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                    <Skeleton className="h-5 w-1/6" />
                    <Skeleton className="h-5 w-1/6" />
                </div>
            </div>
            {/* Fake Table Body */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD divide-y divide-borderL dark:divide-borderD p-3 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div className="flex justify-between items-center pt-3" key={i}>
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-5 w-1/6" />
                        <Skeleton className="h-8 w-1/6" /> {/* Fake buttons */}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// اسکلت فیلترها (سایدبار)
const FiltersSkeleton = () => (
    <aside className="w-full lg:w-64 p-4 space-y-4 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
    </aside>
);

// کامپوننت اصلی اسکلت صفحه
const ReportsPageSkeleton = () => {
    return (
        <div className="flex flex-col md:flex-row-reverse gap-6 p-4 md:p-6 animate-pulse">
            {/* Skeleton for Filters Sidebar */}
            <FiltersSkeleton />

            {/* Skeleton for Main Content */}
            <main className="flex-1 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-4 space-y-4 min-w-0 border border-borderL dark:border-borderD">
                {/* Skeleton for Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Skeleton className="h-10 w-full sm:w-60" /> {/* Search */}
                        <Skeleton className="h-10 w-full sm:w-32" /> {/* Button */}
                    </div>
                </header>

                {/* Skeleton for Table */}
                <TableSkeleton />

                {/* Skeleton for Pagination */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </main>
        </div>
    );
};

export default ReportsPageSkeleton;