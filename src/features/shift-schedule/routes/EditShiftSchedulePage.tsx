import { useNavigate, useParams } from "react-router-dom";
import { EditShiftScheduleForm } from "@/features/shift-schedule/components/EditShiftScheduleForm";
import { useEditShiftScheduleForm } from "@/features/shift-schedule/hooks/useEditShiftScheduleForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
// import { Loader2 } from 'lucide-react';
import { Spinner } from "@/components/ui/Spinner"; // ✅ حروف کوچک

export default function EditShiftSchedulePage() {
    const navigate = useNavigate();
    // کامنت: patternId در واقع shiftScheduleId است
    const { patternId } = useParams<{ patternId: string }>();
    const shiftScheduleId = patternId ?? null;

    // ✅ ۱. هوک ویرایش را فراخوانی می‌کنیم
    const editFormHook = useEditShiftScheduleForm({
        shiftScheduleId: shiftScheduleId,
        onSuccess: () => {
            // کامنت: پس از ویرایش موفقیت‌آمیز فیلدهای Header، به صفحه اصلی برمی‌گردیم
            navigate('/work-patterns');
        }
    });

    const { isLoadingInitialData, generalApiError } = editFormHook;

    // کامنت: مدیریت عدم وجود ID
    if (!shiftScheduleId) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطای پارامتر</AlertTitle>
                    <AlertDescription>شناسه برنامه شیفتی (ID) در مسیر یافت نشد.</AlertDescription>
                </Alert>
            </div>
        );
    }

    // کامنت: مدیریت خطای لودینگ
    // ✅ این منطق درست است چون هوک در اینجا فراخوانی می‌شود
    if (isLoadingInitialData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]" dir="rtl">
                <Spinner size='lg' />
                <span className="mr-3">در حال بارگذاری اطلاعات برنامه شیفتی...</span>
            </div>
        )
    }

    if (generalApiError && generalApiError.includes("خطا در بارگذاری")) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>{generalApiError}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // ✅ ۲. کامپوننت فرم ویرایش اصلی را رندر می‌کنیم
    return (
        <EditShiftScheduleForm
            // کامنت: ارسال تمام متدها و وضعیت‌ها از هوک Edit به فرم
            {...editFormHook}
            onCancel={() => {
                navigate(-1); // بازگشت به عقب هنگام لغو
            }}
        />
    );
}
