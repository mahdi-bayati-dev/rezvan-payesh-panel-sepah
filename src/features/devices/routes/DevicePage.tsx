// src/features/devices/routes/DevicePage.tsx

import { DeviceList } from '@/features/devices/components/DeviceList';

/**
 * 💡 صفحه اصلی مانیتورینگ وضعیت دوربین‌ها
 * این صفحه مسئول لایوت کلی است و کامپوننت هوشمند DeviceList را فراخوانی می‌کند.
 */
function DevicesPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    وضعیت آنلاین دوربین‌ها
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl">
                    مانیتورینگ لحظه‌ای تمام دوربین‌های متصل به سیستم. وضعیت اتصال و سلامت دستگاه‌ها هر ۳۰ ثانیه به صورت خودکار بروزرسانی می‌شود.
                </p>
            </header>

            <main>
                <DeviceList />
            </main>
        </div>
    );
}

export default DevicesPage;