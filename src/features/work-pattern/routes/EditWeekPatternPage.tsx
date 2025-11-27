import { useNavigate, useParams } from "react-router-dom";
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { useEditWeekPatternForm } from "@/features/work-pattern/hooks/useEditWeekPatternForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, ArrowRight } from 'lucide-react';
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
        <div className="space-y-4 max-w-7xl mx-auto p-4 md:p-8" dir="rtl">
            {/* ✅ افزودن هدر با دکمه بازگشت */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                    <ArrowRight className="h-5 w-5 text-muted-foregroundL" />
                </Button>
                <h1 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                    ویرایش الگوی کاری
                </h1>
            </div>

            <NewWeekPatternForm
                // استفاده از as any برای رفع خطای Types of 'control._options.resolver'
                {...(editFormHook as any)}
                onCancel={handleBack}
                isEditMode={true}
            />
        </div>
    );
}