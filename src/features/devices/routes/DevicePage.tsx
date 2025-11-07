// کامنت: نام فایل DeviceList.tsx است (با "L" بزرگ)
import { DeviceList } from '@/features/devices/components/DeviceList';
/**
 * 💡 صفحه اصلی نمایش و مدیریت دستگاه‌ها
 */
function DevicesPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-primaryD">
                مدیریت دستگاه‌های سازمانی
            </h1>
            <DeviceList />
            {/* در آینده، فرم اضافه کردن دستگاه یا کامپوننت جزئیات در اینجا اضافه خواهد شد */}
        </div>
    );
}

export default DevicesPage