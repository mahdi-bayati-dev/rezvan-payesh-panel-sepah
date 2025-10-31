import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// ۱. هوک برای فچ کردن داده‌های این گروه
import { useWorkGroup } from '@/features/work-group/hooks/hook';

// ۲. کامپوننت فرم (که حالا آپدیت شده)
import { WorkGroupForm } from '@/features/work-group/components/newWorkGroup/WorkGroupForm';


// ۳. کامپوننت‌های UI شما
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, Edit, ArrowRight, X } from 'lucide-react'; // آیکون‌ها

/**
 * کامپوننت Helper برای نمایش یک ردیف از جزئیات (فقط خواندنی)
 */
const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    // اگر مقداری وجود نداشت، ردیف را اصلاً رندر نکن
    if (!value) return null;

    return (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">{label}</dt>
            <dd className="mt-1 text-sm text-foregroundL dark:text-foregroundD sm:mt-0 sm:col-span-2">{value}</dd>
        </div>
    );
};


/**
 * صفحه اصلی جزئیات و ویرایش گروه کاری
 */
function WorkGroupDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const numericId = id ? parseInt(id, 10) : 0;

    const [isEditing, setIsEditing] = useState(location.state?.edit || false);

    // ۴. فچ کردن داده‌های گروه کاری
    const { data: workGroup, isLoading, isError, error } = useWorkGroup(numericId);

    useEffect(() => {
        setIsEditing(location.state?.edit || false);
    }, [location.state]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL dark:text-primaryD" />
            </div>
        );
    }

    if (isError || !workGroup) {
        return (
            <div className="p-8 max-w-2xl mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری اطلاعات</AlertTitle>
                    <AlertDescription>
                        {/* لاگ قبلی شما (null) احتمالاً به خاطر باگ بک‌اند بود
                            اما اگر به خاطر عدم تطابق نام بود، حالا باید حل شده باشد */}
                        <p>{isError ? (error as any)?.message : "گروه کاری مورد نظر یافت نشد."}</p>
                        <Button variant="link" onClick={() => navigate('/work-groups')} className="pr-0">
                            بازگشت به لیست
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8  mx-auto space-y-6" dir="rtl">
            <Button variant="ghost" size="sm" onClick={() => navigate('/work-group')} className="text-muted-foregroundL dark:text-muted-foregroundD">
                <ArrowRight className="h-4 w-4 ml-2" />
                بازگشت به لیست گروه‌های کاری
            </Button>

            <div className="bg-backgroundL-500 dark:bg-backgroundD shadow-md sm:rounded-lg overflow-hidden">
                {isEditing ? (
                    // --- حالت ویرایش ---
                    <>
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-borderL dark:border-borderD">
                            <h3 className="text-lg font-bold leading-6 text-foregroundL dark:text-foregroundD">
                                ویرایش گروه کاری: {workGroup.name}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4 ml-2" />
                                انصراف
                            </Button>
                        </div>
                        <div className="p-6">
                            <WorkGroupForm
                                defaultWorkGroup={workGroup}
                                onSuccess={() => {
                                    setIsEditing(false);
                                }}
                            />
                        </div>
                    </>
                ) : (
                    // --- حالت نمایش (اصلاح‌شده) ---
                    <>
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-borderL dark:border-borderD">
                            <div>
                                <h3 className="text-lg font-bold leading-6 text-foregroundL dark:text-foregroundD">
                                    جزئیات گروه کاری
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    {workGroup.name}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 ml-2" />
                                ویرایش
                            </Button>
                        </div>
                        <div className="px-4 py-5 sm:px-6">
                            <dl className="sm:divide-y sm:divide-borderL dark:sm:divide-borderD">
                                <DetailRow label="نام" value={workGroup.name} />
                                {/* ۵. نمایش نوع بر اساس فیلدهای اصلاح‌شده */}
                                <DetailRow label="نوع" value={workGroup.week_pattern_id ? "الگوی کاری" : "برنامه شیفتی"} />
                                {/* ۶. نمایش نام از آبجکت تو در تو */}
                                <DetailRow label="الگوی کاری" value={workGroup.week_pattern?.name} />
                                <DetailRow label="برنامه شیفتی" value={workGroup.shift_schedule?.name} />
                                <DetailRow label="تاریخ ایجاد" value={new Date(workGroup.created_at).toLocaleDateString('fa-IR')} />
                            </dl>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default WorkGroupDetailPage;

