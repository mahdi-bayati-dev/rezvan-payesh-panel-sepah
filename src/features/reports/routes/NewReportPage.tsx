import { useNavigate } from 'react-router-dom';
import { CirclePlus, ArrowRight } from 'lucide-react';
import { useCreateLog } from '@/features/reports/hooks/hook';
import { NewReportForm } from '@/features/reports/components/NewActivityRegistration/NewReportForm';
import { type NewReportFormData } from '@/features/reports/Schema/newReportSchema';

/**
 * تابع کمکی برای اطمینان از دو رقمی بودن اعداد در رشته زمان
 */
function zeroPad(num: number): string {
    return num.toString().padStart(2, '0');
}

export default function NewReportPage() {
    const navigate = useNavigate();
    const createLogMutation = useCreateLog();

    /**
     * مدیریت ثبت فرم
     */
    const handleCreateReport = (data: NewReportFormData) => {
        // ۱. استخراج دیتای فرم
        const dateObj = data.date; // از PersianDatePicker (شیء DateObject)
        const timeStr = data.time; // مثلاً "08:30"

        if (!dateObj || !timeStr) {
            console.error("❌ [NewReport] Date or Time is missing from form");
            return;
        }

        // ۲. تبدیل تاریخ شمسی انتخاب شده به میلادی برای ارسال به دیتابیس
        const jsDate = dateObj.toDate();
        const year = jsDate.getFullYear();
        const month = zeroPad(jsDate.getMonth() + 1);
        const day = zeroPad(jsDate.getDate());

        // ۳. ساخت رشته نهایی (YYYY-MM-DD HH:mm:ss)
        // ارسال به صورت Naive Local Time برای تطابق با ساعت سیستم مرکزی
        const finalTimestamp = `${year}-${month}-${day} ${timeStr}:00`;

        const apiPayload = {
            employee_id: data.employee!.id,
            event_type: data.event_type,
            timestamp: finalTimestamp,
            remarks: data.remarks,
        };

        // 🚀 لاگ جهت عیب‌یابی در محیط توسعه
        console.group("📝 [Manual Log Submission]");
        console.log("Selected Date (JS):", jsDate);
        console.log("Formatted Payload:", apiPayload);
        console.groupEnd();

        createLogMutation.mutate(apiPayload, {
            onSuccess: (response) => {
                console.log("✅ Log created successfully:", response);
                navigate('/reports');
            },
            onError: (err) => {
                console.error("🔥 Failed to create log:", err);
            }
        });
    };

    /**
     * بازگشت به صفحه لیست گزارش‌ها
     */
    const handleBack = () => {
        navigate('/reports');
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm border border-borderL dark:border-borderD">
            {/* هدر صفحه به همراه دکمه بازگشت */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-borderL dark:border-borderD gap-4">
                <div className="flex items-center gap-4">
                    {/* دکمه بازگشت آیکونیک */}
                    <button
                        onClick={handleBack}
                        className="p-2.5 rounded-full bg-secondaryL/50 hover:bg-secondaryL dark:bg-secondaryD/30 dark:hover:bg-secondaryD text-muted-foregroundL dark:text-muted-foregroundD transition-all active:scale-95 cursor-pointer"
                        title="بازگشت"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg">
                            <CirclePlus className="text-primaryL dark:text-primaryD" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                ثبت تردد دستی
                            </h2>
                            <p className="text-xs text-muted-foregroundL mt-1">
                                ثبت فعالیت خارج از سیستم خودکار با ذکر دلیل متقن
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* فرم اصلی ثبت تردد */}
            <div className="max-w-4xl mx-auto">
                <NewReportForm
                    onSubmit={handleCreateReport}
                    onCancel={handleBack}
                    isSubmitting={createLogMutation.isPending}
                />
            </div>
        </div>
    );
}