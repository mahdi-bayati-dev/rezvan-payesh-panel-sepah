import { useNavigate } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
import { useCreateLog, useEmployeeOptions } from '../hooks/hook';
import { NewReportForm } from '../components/NewActivityRegistration/NewReportForm';
import { type NewReportFormData } from '@/features/reports/Schema/newReportSchema';

// ۱. ایمپورت تقویم میلادی
import gregorian from "react-date-object/calendars/gregorian";

// ۲. [اصلاحیه] تابع کمکی برای اطمینان از دو رقمی بودن (padding)
// این تابع اعداد لاتین تحویل می‌دهد
function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

export default function NewReportPage() {
    const navigate = useNavigate();
    const createLogMutation = useCreateLog();
    const { data: employeeOptions, isLoading: isLoadingEmployees } = useEmployeeOptions();

    // ... (بخش دیباگ بدون تغییر) ...

    const handleCreateReport = (data: NewReportFormData) => {

        // --- [اصلاحیه کلیدی] ---

        // ۳. آبجکت DateObject را از فرم می‌گیریم
        const date = data.date!;

        // ۴. آن را به تقویم میلادی تبدیل می‌کنیم
        const gregorianDate = date.convert(gregorian);

        // ۵. مقادیر سال، ماه و روز را به عنوان *عدد* (Number) استخراج می‌کنیم
        // این اعداد، اعداد خالص جاوااسکریپت (لاتین) هستند.
        const year = gregorianDate.year;       // مثلا: 2025
        const month = gregorianDate.month.number; // مثلا: 11
        const day = gregorianDate.day;         // مثلا: 13

        // ۶. ساعت را از فرم می‌گیریم (که از قبل لاتین است "HH:mm")
        const time = data.time;

        // ۷. ساخت رشته نهایی با فرمت دقیق Y-m-d H:i:s با استفاده از اعداد لاتین
        const formattedTimestamp = `${year}-${pad(month)}-${pad(day)} ${time}:00`;
        // --- [پایان اصلاحیه] ---


        console.log('داده‌های فرم:', data);

        const apiPayload = {
            employee_id: data.employee!.id,
            // [رفع خطا ۹] - به لطف اصلاح اسکیما Zod،
            // data.event_type اکنون تایپ صحیح 'check_in' | 'check_out' را دارد
            // و نیازی به cast کردن نیست.
            event_type: data.event_type,
            timestamp: formattedTimestamp, // استفاده از فرمت ۱۰۰٪ صحیح میلادی-لاتین
            remarks: data.remarks,
        };

        console.log('آبجکت آماده برای ارسال به API:', apiPayload);

        createLogMutation.mutate(apiPayload, {
            onSuccess: () => {
                navigate('/reports');
            },
        });
    };

    const handleCancel = () => {
        navigate('/reports');
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <h2 className=" flex gap-2 items-center text-xl font-bold dark:text-primaryD mb-2">
                <CirclePlus size={20} />
                ثبت تردد دستی
            </h2>

            <NewReportForm
                onSubmit={handleCreateReport}
                onCancel={handleCancel}
                // [رفع خطا ۱۰] - در React Query v5،
                // پراپرتی لودینگ جهش (mutation) از isLoading به isPending تغییر کرده است
                isSubmitting={createLogMutation.isPending}
                employeeOptions={employeeOptions || []}
                isLoadingEmployees={isLoadingEmployees}
            />
        </div>
    );
}