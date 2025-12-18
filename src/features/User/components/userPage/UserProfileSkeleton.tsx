import { Skeleton } from '@/components/ui/Skeleton';

export const UserProfileSkeleton = () => {
    return (
        <div className="space-y-4 m-2 md:p-0 mx-auto " dir="rtl">
            {/* Header Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Sidebar Skeleton */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
                    <div className="p-6 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD sticky top-8 shadow-sm space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <Skeleton className="w-24 h-24 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <div className="w-full space-y-4 pt-4 border-t border-borderL dark:border-borderD">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <main className="flex-1 min-w-0 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-borderL dark:border-borderD mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-10 w-28 rounded-lg shrink-0" />
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};