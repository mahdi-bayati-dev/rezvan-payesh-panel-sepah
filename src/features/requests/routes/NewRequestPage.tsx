import  { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // (اگر از react-router استفاده می‌کنید)
import { NewRequestForm } from '@/features/requests/components/newRequestPage/NewRequestForm';
import { type NewRequestFormData } from '@/features/requests/schemas/newRequestSchema';
import { CirclePlus } from 'lucide-react';

/**
 * صفحه‌ی "درخواست جدید"
 * این کامپوننت والد و کانتینر برای فرم است
 */
const NewRequestPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * این تابع داده‌های نهایی و اعتبارسنجی شده را از فرم دریافت می‌کند
     * و برای ارسال به API آماده می‌کند.
     */
    const handleCreateRequest = (data: NewRequestFormData) => {
        setIsSubmitting(true);
        console.log('داده‌های اعتبارسنجی شده برای ارسال:', data);

        // TODO: در اینجا داده‌ها را به API ارسال کنید
        // در این مرحله، ما باید آبجکت‌ها را به ID تبدیل کنیم
        const apiPayload = {
            name: data.name,
            personal_code: data.personalCode,
            organization_id: data.organization!.id, // <- '!' اضافه شد
            work_group_id: data.workGroup!.id,     // <- '!' اضافه شد
            category_id: data.category!.id,       // <- '!' اضافه شد
            request_type_id: data.requestType!.id, // <- '!' اضافه شد
            date: data.date!.format('YYYY-MM-DD'), // <- '!' اضافه شد
            start_time: data.startTime,
            end_time: data.endTime,
            description: data.description,
        };
        console.log('آبجکت آماده برای API:', apiPayload);

        // شبیه‌سازی تماس API
        setTimeout(() => {
            setIsSubmitting(false);
            alert('درخواست با موفقیت ثبت شد (شبیه‌سازی)');
            // بازگشت به صفحه لیست درخواست‌ها
            navigate('/requests');
        }, 1500);
    };

    const handleCancel = () => {
        navigate('/requests');
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <h2 className=" flex gap-2 items-center text-xl font-bold text-right mb-6 pb-4 border-b border-borderL dark:border-borderD dark:text-backgroundL-500">
                <CirclePlus size={20} />
                درخواست جدید
            </h2>

            {/* رندر کردن فرم باهوش */}
            <NewRequestForm
                onSubmit={handleCreateRequest}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default NewRequestPage;