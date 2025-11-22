import { useNavigate } from 'react-router-dom';
// import {toast}from 'react-toastify'

// ۱. ایمپورت فرم قابل استفاده مجدد
import { WorkGroupForm } from '@/features/work-group/components/newWorkGroup/WorkGroupForm';

// ۲. ایمپورت کامپوننت‌های UI
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';


/**
 * صفحه اختصاصی برای ایجاد یک گروه کاری جدید
 */
function NewWorkGroupPage() {
    const navigate = useNavigate();

    // ۳. تابعی که بعد از موفقیت فرم، اجرا می‌شود
    const handleCreateSuccess = () => {
        // (اختیاری) نمایش پیام موفقیت
        // toast.success('گروه کاری جدید با موفقیت ایجاد شد.');

        // ۴. بازگشت به صفحه لیست
        navigate('/work-groups'); 
    };

    return (
        <div className="p-4 md:p-8  mx-auto space-y-6" dir="rtl">
            
            {/* هدر صفحه و دکمه بازگشت */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/work-groups')}
                    className="h-10 w-10"
                >
                    <ArrowRight className="h-5 w-5 text-muted-foregroundL dark:text-muted-foregroundD" />
                </Button>
                <h1 className="text-2xl font-bold dark:text-borderL">ایجاد گروه کاری جدید</h1>
            </div>

            {/* کانتینر کارت فرم */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD shadow-md sm:rounded-lg overflow-hidden">
                <div className="p-6">
                    {/* ۵. رندر کردن فرم در حالت "ایجاد"
                      چون `defaultWorkGroup` پاس داده نشده، فرم می‌فهمد که در حالت "ایجاد" است
                    */}
                    <WorkGroupForm 
                        onSuccess={handleCreateSuccess} 
                    />
                </div>
            </div>
        </div>
    );
}

export default NewWorkGroupPage;
