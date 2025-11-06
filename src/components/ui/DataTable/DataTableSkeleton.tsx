import { Skeleton } from '@/components/ui/Skeleton';

interface DataTableSkeletonProps {
    /** تعداد ستون‌هایی که باید شبیه‌سازی شوند */
    columnCount: number;
    /** تعداد ردیف‌هایی که باید شبیه‌سازی شوند */
    rowCount?: number;
}

/**
 * این کامپوننت ردیف‌های اسکلتی (tbody) را برای DataTable رندر می‌کند.
 * این کامپوننت *باید* داخل یک <tbody> قرار گیرد.
 */
export const DataTableSkeleton = ({
    columnCount,
    rowCount = 8, // یک پیش‌فرض معقول برای تعداد ردیف‌ها
}: DataTableSkeletonProps) => {

    // ایجاد یک آرایه از ردیف‌های خالی
    const rows = Array.from({ length: rowCount });
    // ایجاد یک آرایه از ستون‌های خالی
    const columns = Array.from({ length: columnCount });

    return rows.map((_, rowIndex) => (
        // هر ردیف اسکلتی
        <tr key={`skeleton-row-${rowIndex}`}>
            {columns.map((_, colIndex) => (
                // هر سلول اسکلتی
                <td
                    key={`skeleton-cell-${rowIndex}-${colIndex}`}
                    className="px-4 py-3 whitespace-nowrap"
                >
                    {/* خود بلاک اسکلت با افکت pulse */}
                    <Skeleton className="h-5 w-full rounded" />
                </td>
            ))}
        </tr>
    ));
};