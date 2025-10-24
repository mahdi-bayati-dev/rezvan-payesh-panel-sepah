import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';

// ۱. ایمپورت کامپوننت فرم صحیح
import { NewReportForm } from '../components/NewActivityRegistration/NewReportForm'; // (مسیر را بر اساس ساختار خودتان تنظیم کنید)

// ۲. ایمپورت تایپ صحیح از اسکیمای 'reports'
// (مسیر Schema/schemas را بر اساس فایل فرم خودتان تنظیم کنید)
import { type NewReportFormData } from '@/features/reports/Schema/newReportSchema';

/**
 * صفحه‌ی "ثبت فعالیت جدید"
 * این کامپوننت والد و کانتینر برای فرم ثبت فعالیت است
 */
// ۳. تغییر نام کامپوننت
export default function NewReportPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * این تابع داده‌های نهایی 'NewReportFormData' را از فرم دریافت می‌کند
     */
    // ۴. تغییر نام تابع و تایپ ورودی آن
    const handleCreateReport = (data: NewReportFormData) => {
        setIsSubmitting(true);
        console.log('داده‌های اعتبارسنجی شده برای ارسال:', data);

        // ۵. ساخت Payload صحیح بر اساس فیلدهای 'NewReportFormData'
        const apiPayload = {
            name: data.name,
            personal_code: data.personalCode,
            organization_id: data.organization!.id, // '!' چون در اسکیما اجباری است
            work_group_id: data.workGroup!.id,
            activity_type_id: data.activityType!.id, // ❌ جایگزین requestType
            traffic_area_id: data.trafficArea!.id, // ❌ جایگزین category
            date: data.date!.format('YYYY-MM-DD'), // (فرض بر اینکه date آبجکت PersianDatePicker است)
            time: data.time, // ❌ جایگزین startTime/endTime
            description: data.description,
        };
        console.log('آبجکت آماده برای API:', apiPayload);

        // شبیه‌سازی تماس API
        setTimeout(() => {
            setIsSubmitting(false);
            alert('فعالیت با موفقیت ثبت شد (شبیه‌سازی)');
            // بازگشت به صفحه لیست گزارش‌ها
            navigate('/reports');
        }, 1500);
    };

    const handleCancel = () => {
        // ۶. اصلاح مسیر بازگشت
        navigate('/reports');
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <h2 className=" flex gap-2 items-center text-xl font-bold text-right mb-6 pb-4 border-b border-borderL dark:border-borderD dark:text-backgroundL-500">
                <CirclePlus size={20} />
                {/* ۷. اصلاح تایپو */}
                ثبت فعالیت جدید
            </h2>

            {/* رندر کردن فرم صحیح با پراپ‌های صحیح */}
            <NewReportForm
                onSubmit={handleCreateReport} // ۸. اتصال به تابع جدید
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}