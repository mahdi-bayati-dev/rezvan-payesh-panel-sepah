import { Skeleton } from '@/components/ui/Skeleton';

/**
 * این کامپوننت در زمان بررسی احراز هویت اولیه نمایش داده می‌شود
 * و ساختار کلی اپلیکیشن را شبیه‌سازی می‌کند.
 */
export const GlobalAppSkeleton = () => {
    return (
        <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
            {/* Fake Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-850">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 md:hidden" /> {/* Mobile Menu */}
                    <Skeleton className="h-8 w-32" /> {/* Logo/Title */}
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme Toggle */}
                    <Skeleton className="h-10 w-10 rounded-full" /> {/* User Avatar */}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Fake Sidebar (Desktop) */}
                <aside className="hidden w-64 flex-col border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-850 md:flex">
                    <Skeleton className="h-10 w-full mb-6" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </aside>

                {/* Fake Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Skeleton className="h-12 w-1/3 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        </div>
    );
};