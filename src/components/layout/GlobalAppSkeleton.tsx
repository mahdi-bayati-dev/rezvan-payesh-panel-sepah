import { Skeleton } from '@/components/ui/Skeleton';

/**
 * GlobalAppSkeleton
 * این کامپوننت ساختار کلی اپلیکیشن (هدر، سایدبار و بدنه اصلی) را
 * در زمان لود اولیه یا بررسی احراز هویت شبیه‌سازی می‌کند.
 */
export const GlobalAppSkeleton = () => {
    return (
        // تغییر bg-gray-100 به bg-backgroundL-500 برای هماهنگی با تم روشن پروژه
        // تغییر dark:bg-gray-900 به dark:bg-backgroundD برای هماهنگی با تم تاریک پروژه
        <div className="flex h-screen flex-col bg-backgroundL-500 dark:bg-backgroundD transition-colors duration-300">

            {/* Fake Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 shadow-sm
                             border-borderL bg-backgroundL-DEFAULT 
                             dark:border-borderD dark:bg-backgroundD">

                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 md:hidden rounded-md" /> {/* Mobile Menu Toggle */}
                    <Skeleton className="h-8 w-32 rounded-lg" /> {/* Logo */}
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" /> {/* Theme Toggle */}
                    <Skeleton className="h-10 w-10 rounded-full" /> {/* User Avatar */}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Fake Sidebar (Desktop) */}
                <aside className="hidden w-64 flex-col border-l p-4 md:flex gap-6
                                border-borderL bg-backgroundL-DEFAULT 
                                dark:border-borderD dark:bg-backgroundD">

                    {/* Sidebar Header / User Info */}
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                        ))}
                    </div>

                    <div className="mt-auto space-y-3">
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </aside>

                {/* <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-backgroundL-500 dark:bg-backgroundD">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-48 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>

                    <div className="rounded-3xl border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD overflow-hidden p-6 space-y-4">
                        <div className="flex justify-between mb-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </main> */}
            </div>
        </div>
    );
};