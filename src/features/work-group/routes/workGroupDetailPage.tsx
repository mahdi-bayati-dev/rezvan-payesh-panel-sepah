import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// ۱. هوک برای فچ کردن داده‌های این گروه
import { useWorkGroup } from '@/features/work-group/hooks/hook';

// ۲. کامپوننت فرم (که حالا آپدیت شده)
import { WorkGroupForm } from '@/features/work-group/components/newWorkGroup/WorkGroupForm';


// ۳. کامپوننت‌های UI شما
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, Edit, ArrowRight, X, Users } from 'lucide-react'; // آیکون‌ها

/**
 * کامپوننت Helper برای نمایش یک ردیف از جزئیات (فقط خواندنی)
 */
const DetailRow = ({ label, value, className = "" }: { label: string; value: string | null | undefined; className?: string }) => {
    // اگر مقداری وجود نداشت، ردیف را اصلاً رندر نکن
    if (!value) return null;

    return (
        <div className={`flex flex-col sm:flex-row border-b last:border-b-0 border-borderL dark:border-borderD py-3 ${className}`}>
            <dt className="text-sm font-semibold text-muted-foregroundL dark:text-muted-foregroundD w-full sm:w-1/3 mb-1 sm:mb-0">{label}:</dt>
            <dd className="text-sm text-foregroundL dark:text-foregroundD w-full sm:w-2/3">{value}</dd>
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
    const backToRoot = () => navigate('/work-groups');

    const [isEditing, setIsEditing] = useState(location.state?.edit || false);

    // ۴. فچ کردن داده‌های گروه کاری
    const { data: workGroup, isLoading, isError, error } = useWorkGroup(numericId);

    useEffect(() => {
        setIsEditing(location.state?.edit || false);
    }, [location.state]);

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-64" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL dark:text-primaryD" />
                <span className="mr-4 text-lg">در حال بارگذاری جزئیات گروه کاری...</span>
            </div>
        );
    }

    if (isError || !workGroup) {
        return (
            <div className="p-8 max-w-4xl mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری اطلاعات</AlertTitle>
                    <AlertDescription>
                        <p>{isError ? (error as any)?.message || "خطا در برقراری ارتباط با سرور." : "گروه کاری مورد نظر یافت نشد."}</p>
                        <Button variant="link" onClick={backToRoot} className="pr-0 mt-2">
                            بازگشت به لیست
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const groupType = workGroup.week_pattern_id ? "الگوی کاری" : (workGroup.shift_schedule_id ? "برنامه شیفتی" : "نامشخص");
    const activeScheduleName = workGroup.week_pattern?.name || workGroup.shift_schedule?.name || "تعیین نشده";

    return (
        <div className="p-4 md:p-8  mx-auto space-y-6" dir="rtl">

            <Button
                variant="ghost"
                size="sm"
                onClick={backToRoot}
                className="text-muted-foregroundL dark:text-muted-foregroundD hover:bg-backgroundL-300 dark:hover:bg-backgroundD-700 transition-colors"
            >
                <ArrowRight className="h-4 w-4 ml-2" />
                بازگشت به لیست گروه‌های کاری
            </Button>

            <div className="bg-backgroundL-500 dark:bg-backgroundD sm:rounded-xl overflow-hidden border border-borderL dark:border-borderD">
                {isEditing ? (
                    // --- حالت ویرایش ---
                    <>
                        <div className="px-6 py-4 flex justify-between items-center border-b border-borderL dark:border-borderD bg-backgroundL-200 dark:bg-backgroundD-900">
                            <h3 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                ویرایش گروه کاری: {workGroup.name}
                            </h3>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
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
                    // --- حالت نمایش ---
                    <>
                        <div className="px-6 py-4 flex justify-between items-center border-b border-borderL dark:border-borderD bg-backgroundL-200 dark:bg-backgroundD-900">
                            <div>
                                <h3 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                    جزئیات گروه کاری
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    نمایش اطلاعات گروه: <strong className="font-bold">{workGroup.name}</strong>
                                </p>
                            </div>
                            <div className='flex gap-2'>
                                {/* ✅ دکمه جدید: مدیریت کارمندان */}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate(`/work-groups/${numericId}/assign`)}
                                >
                                    <Users className="h-4 w-4 ml-2" />
                                    مدیریت کارمندان
                                </Button>
                                {/* دکمه ویرایش */}
                                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4 ml-2" />
                                    ویرایش
                                </Button>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <dl className="divide-y divide-borderL dark:divide-borderD">
                                <DetailRow label="نام گروه" value={workGroup.name} />
                                <DetailRow label="نوع گروه" value={groupType} />
                                <DetailRow
                                    label={groupType === "الگوی کاری" ? "الگوی کاری انتخاب شده" : "برنامه شیفتی انتخاب شده"}
                                    value={activeScheduleName}
                                    className="font-bold text-primaryL dark:text-primaryD"
                                />
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