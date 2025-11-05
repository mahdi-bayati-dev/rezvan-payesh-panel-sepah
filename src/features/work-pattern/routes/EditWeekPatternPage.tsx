import { useNavigate, useParams } from "react-router-dom";
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { useEditWeekPatternForm } from "@/features/work-pattern/hooks/useEditWeekPatternForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';

export default function EditWeekPatternPage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();

    // ✅ اصلاحیه: هوک‌ها همیشه باید در بالاترین سطح فراخوانی شوند.
    const editFormHook = useEditWeekPatternForm({
        // کامنت: اگر patternId وجود نداشت، 0 یا null را پاس می‌دهیم تا هوک enabled نشود
        patternId: patternId ?? 0,
        onSuccess: () => {
            // ✅ اصلاح: بازگشت به صفحه قبلی پس از موفقیت
            // (توجه: هوک useUpdateWeekPattern موجود، کش لیست را باطل می‌کند، پس داده‌ها در صفحه اصلی به‌روز می‌شوند.)
            navigate(-1);
        }
    });

    // کامنت: مدیریت عدم وجود ID در اینجا انجام می‌شود (بعد از فراخوانی هوک)
    if (!patternId) {
        // کامنت: این شرط باید در نهایت به یک کامپوننت ارور هدایت شود
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطای پارامتر</AlertTitle>
                    <AlertDescription>شناسه الگوی کاری (ID) در مسیر یافت نشد.</AlertDescription>
                </Alert>
            </div>
        );
    }

    // کامنت: وضعیت لودینگ اولیه را مدیریت می‌کنیم
    if (editFormHook.isInitialLoading) {
        return (
            <div className="flex justify-center items-center h-screen" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL" />
                <span className="mr-3">در حال بارگذاری الگوی کاری برای ویرایش...</span>
            </div>
        );
    }

    // کامنت: مدیریت خطای لودینگ
    // از آنجایی که generalApiError شامل خطای بارگذاری اولیه نیز هست، این شرط کار می‌کند.
    if (editFormHook.generalApiError && editFormHook.generalApiError.includes("خطا در بارگذاری")) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>{editFormHook.generalApiError}</AlertDescription>
                </Alert>
            </div>
        );
    }


    return (
        <NewWeekPatternForm
            // کامنت: ارسال تمام متدها و وضعیت‌ها از هوک Edit به فرم
            {...editFormHook}
            onCancel={() => {
                navigate(-1); // ✅ اصلاح: بازگشت به عقب هنگام لغو
            }}
            isEditMode={true} // کامنت: پراپ جدید برای نمایش عنوان "ویرایش"
        />
    );
}
