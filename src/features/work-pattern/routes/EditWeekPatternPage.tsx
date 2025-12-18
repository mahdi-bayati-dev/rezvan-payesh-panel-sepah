import { useNavigate, useParams } from "react-router-dom";
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { useEditWeekPatternForm } from "@/features/work-pattern/hooks/forms/useEditWeekPatternForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/Button";

export default function EditWeekPatternPage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();

    const editFormHook = useEditWeekPatternForm({
        patternId: patternId ?? 0,
        onSuccess: () => {
            navigate(-1);
        }
    });

    // هندلر بازگشت
    const handleBack = () => navigate(-1);

    if (!patternId) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطای پارامتر</AlertTitle>
                    <AlertDescription>شناسه الگوی کاری (ID) در مسیر یافت نشد.</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={handleBack} className="mt-4">بازگشت</Button>
            </div>
        );
    }

    if (editFormHook.isInitialLoading) {
        return (
            <div className="flex justify-center items-center h-screen" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL" />
                <span className="mr-3">در حال بارگذاری الگوی کاری برای ویرایش...</span>
            </div>
        );
    }

    if (editFormHook.generalApiError && editFormHook.generalApiError.includes("خطا در بارگذاری")) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>{editFormHook.generalApiError}</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={handleBack} className="mt-4">بازگشت</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4  mx-auto p-4 md:p-8" dir="rtl">

            <NewWeekPatternForm
                // استفاده از as any برای رفع خطای Types of 'control._options.resolver'
                {...(editFormHook as any)}
                onCancel={handleBack}
                isEditMode={true}
            />
        </div>
    );
}