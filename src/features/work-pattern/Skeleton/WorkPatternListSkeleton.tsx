import { Skeleton } from '@/components/ui/Skeleton';

interface WorkPatternListSkeletonProps {
    /** تعداد ردیف‌های اسکلتی که باید نمایش داده شود */
    rowCount?: number;
}

/**
 * اسکلت لودینگ برای کامپوننت WorkPatternList.
 * این کامپوننت چندین ردیف آیتم لیست را شبیه‌سازی می‌کند.
 */
export const WorkPatternListSkeleton = ({
    rowCount = 10, // پیش‌فرض ۱۰ ردیف
}: WorkPatternListSkeletonProps) => {
    const rows = Array.from({ length: rowCount });

    return (
        <div className="space-y-2 p-2">
            {rows.map((_, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-3"
                >
                    {/* شبیه‌سازی آیکون و نام الگو */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    {/* شبیه‌سازی تعداد کاربران */}
                    <Skeleton className="h-5 w-16" />
                </div>
            ))}
        </div>
    );
};