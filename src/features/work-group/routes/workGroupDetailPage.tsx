import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { useWorkGroup } from '@/features/work-group/hooks/hook';
import { WorkGroupForm } from '@/features/work-group/components/newWorkGroup/WorkGroupForm';

import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, Edit, ArrowRight, X, Users } from 'lucide-react';

const DetailRow = ({ label, value, className = "" }: { label: string; value: string | null | undefined; className?: string }) => {
    if (!value) return null;

    return (
        <div className={`flex flex-col sm:flex-row border-b last:border-b-0 border-borderL dark:border-borderD py-3 ${className}`}>
            <dt className="text-sm font-semibold text-muted-foregroundL dark:text-muted-foregroundD w-full sm:w-1/3 mb-1 sm:mb-0">{label}:</dt>
            <dd className="text-sm text-foregroundL dark:text-foregroundD w-full sm:w-2/3">{value}</dd>
        </div>
    );
};

function WorkGroupDetailPage() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const numericId = id ? parseInt(id, 10) : 0;
    const backToRoot = () => navigate('/work-groups');

    const [isEditing, setIsEditing] = useState(location.state?.edit || false);

    const { data: workGroup, isLoading, isError, error } = useWorkGroup(numericId);

    useEffect(() => {
        setIsEditing(location.state?.edit || false);
    }, [location.state]);

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex justify-center items-center h-64" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL dark:text-primaryD" />
                <span className="mr-4 text-lg text-muted-foregroundL dark:text-muted-foregroundD">در حال بارگذاری جزئیات گروه کاری...</span>
            </div>
        );
    }

    if (isError || !workGroup) {
        return (
            <div className="p-8 max-w-4xl mx-auto" dir="rtl">
                <Alert variant="destructive" className="bg-destructiveL-background dark:bg-destructiveD-background border-destructiveL-foreground/10 text-destructiveL-foreground">
                    <AlertTitle>خطا در بارگذاری اطلاعات</AlertTitle>
                    <AlertDescription>
                        <p>{isError ? (error as any)?.message || "خطا در برقراری ارتباط با سرور." : "گروه کاری مورد نظر یافت نشد."}</p>
                        <Button variant="link" onClick={backToRoot} className="pr-0 mt-2 text-destructiveL-foreground underline">
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
                className="text-muted-foregroundL dark:text-muted-foregroundD hover:bg-secondaryL dark:hover:bg-secondaryD transition-colors"
            >
                <ArrowRight className="h-4 w-4 ml-2" />
                بازگشت به لیست گروه‌های کاری
            </Button>

            <div className="bg-backgroundL-500 dark:bg-backgroundD sm:rounded-xl overflow-hidden border border-borderL dark:border-borderD shadow-sm">
                {isEditing ? (
                    <>
                        <div className="px-6 py-4 flex justify-between items-center border-b border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/10">
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
                    <>
                        <div className="px-6 py-4 flex justify-between items-center border-b border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/10">
                            <div>
                                <h3 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                    جزئیات گروه کاری
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    نمایش اطلاعات گروه: <strong className="font-bold">{workGroup.name}</strong>
                                </p>
                            </div>
                            <div className='flex gap-2'>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate(`/work-groups/${numericId}/assign`)}
                                    className="shadow-sm"
                                >
                                    <Users className="h-4 w-4 ml-2" />
                                    مدیریت کارمندان
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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