// features/requests/routes/TableSettingsPage.tsx
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ۱. ایمپورت‌های جدید
import { useLeaveTypes } from '../hook/useLeaveTypes'; // هوک اصلی
import { type LeaveType } from '../api/api';
import { LeaveTypeForm } from '../components/TableSettingsPage/LeaveTypeForm'; // فرم جدید
import { LeaveTypeRow } from '../components/TableSettingsPage/LeaveTypeRow'; // ردیف درختی جدید

// ایمپورت کامپوننت‌های UI (برای لودینگ و خطا)
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

const TableSettingsPage = () => {
    const navigate = useNavigate();

    // ۲. استیت برای نگهداری آیتم انتخاب شده (برای ویرایش)
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);

    // ۳. دریافت داده‌ها، وضعیت لودینگ و خطا از React Query
    const { data: leaveTypes, isLoading, isError, error } = useLeaveTypes();

    // توابع دکمه‌های هدر (بدون تغییر)
    // const handleSaveChanges = () => {
    //     alert("تغییرات ذخیره شد (شبیه‌سازی)");
    // };
    const handleCancel = () => {
        navigate('/requests'); // بازگشت به لیست
    };

    // تابع برای قرار دادن فرم در حالت "ایجاد"
    const handleAddClick = () => {
        setSelectedLeaveType(null);
    };

    // تابع برای پاک کردن فرم (زمانی که حذف یا ویرایش موفق بود)
    const clearSelection = () => {
        setSelectedLeaveType(null);
    }

    // ۴. تابع برای مدیریت نمایش محتوای پنل راست
    const renderLeaveTypesList = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-40"><Spinner text="در حال بارگذاری انواع مرخصی..." /></div>;
        }
        if (isError) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>خطا در دریافت داده‌ها</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            );
        }
        if (!leaveTypes || leaveTypes.length === 0) {
            return <p className="text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD py-10">هیچ نوع مرخصی تعریف نشده است. </p>;
        }

        // رندر کردن لیست به صورت بازگشتی
        return leaveTypes.map(rootType => (
            <LeaveTypeRow
                key={rootType.id}
                leaveType={rootType}
                level={0}
                onSelect={setSelectedLeaveType} // تابع انتخاب برای ویرایش
                onDeleteSuccess={clearSelection} // تابع پاک کردن فرم در صورت حذف موفق
            />
        ));
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderL dark:border-borderD">
                <h2 className="text-xl font-bold text-right dark:text-backgroundL-500">
                    تنظیمات ایجاد نوع درخواست
                </h2>
                <div className="flex gap-3">
                    {/* <button
                        onClick={handleSaveChanges}
                        className="flex items-center gap-1 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-successD-foreground cursor-pointer"
                    >
                        <Save size={16} />
                        تایید
                    </button> */}
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 bg-backgroundL-500 text-foregroundL dark:bg-backgroundD dark:text-foregroundD px-4 py-1.5 rounded-lg text-sm font-medium border border-borderL dark:border-borderD hover:bg-destructiveL hover:text-backgroundL-500 cursor-pointer"
                    >
                        <X size={16} />
                        لغو
                    </button>
                </div>
            </div>

            {/* چیدمان دو ستونه */}
            <div className="flex flex-col md:flex-row-reverse gap-6">

                {/* ستون راست: لیست انواع مرخصی (گروه‌ها) */}
                <div className="w-full md:w-1/3 lg:w-1/4 p-4 border border-borderL dark:border-borderD rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-right">انواع درخوسات ها</h3>
                        <button
                            onClick={handleAddClick} // اتصال به تابع "افزودن"
                            className="text-primaryL dark:text-primaryD hover:opacity-80"
                            title="افزودن نوع جدید"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        {/* ۵. رندر کردن محتوای داینامیک */}
                        {renderLeaveTypesList()}
                    </div>
                </div>

                {/* ستون چپ: فرم ایجاد/ویرایش (تنظیمات اصلی) */}
                <div className="flex-1 p-4 border border-borderL dark:border-borderD rounded-lg">
                    {/* ۶. رندر کردن فرم جدید */}
                    <LeaveTypeForm
                        selectedLeaveType={selectedLeaveType}
                        allLeaveTypes={leaveTypes || []}
                        onClearSelection={clearSelection}
                    />
                </div>
            </div>
        </div>
    );
};

export default TableSettingsPage;