import { Skeleton } from '@/components/ui/Skeleton';

export const UserTableSkeleton = () => {
    return (
        <div className="w-full space-y-4 animate-pulse" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                <div className="grid grid-cols-6 gap-4 p-4 bg-secondaryL/30 dark:bg-secondaryD/20 border-b border-borderL dark:border-borderD">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-2/3 rounded" />
                    ))}
                </div>

                {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-borderL dark:border-borderD items-center">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-2 w-16 rounded" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};