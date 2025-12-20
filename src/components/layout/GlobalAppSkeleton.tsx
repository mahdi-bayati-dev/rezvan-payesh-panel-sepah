import { Skeleton } from '@/components/ui/Skeleton';

/**
 * اسکلتون با رعایت دقیق ابعاد سایدبار اصلی
 */
export const GlobalAppSkeleton = () => {
    return (
        <div className="flex h-screen flex-col bg-backgroundL-500 dark:bg-backgroundD transition-colors duration-300">

            {/* Header Placeholder */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 shadow-sm border-borderL bg-backgroundL-DEFAULT dark:border-borderD dark:bg-backgroundD">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 md:hidden rounded-md" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ✅ تطبیق عرض با Sidebar واقعی (w-64) */}
                <aside className="hidden w-64 flex-col border-e p-4 md:flex gap-6 border-borderL bg-backgroundL-DEFAULT dark:border-borderD dark:bg-backgroundD">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                        ))}
                    </div>

                    <div className="mt-auto space-y-3">
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-backgroundL-500 dark:bg-backgroundD">
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};