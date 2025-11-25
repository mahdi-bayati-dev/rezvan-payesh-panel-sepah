import { useNavigate, useParams } from "react-router-dom";
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { useEditWeekPatternForm } from "@/features/work-pattern/hooks/useEditWeekPatternForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';

export default function EditWeekPatternPage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();

    const editFormHook = useEditWeekPatternForm({
        patternId: patternId ?? 0,
        onSuccess: () => {
            navigate(-1);
        }
    });

    if (!patternId) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطای پارامتر</AlertTitle>
                    <AlertDescription>شناسه الگوی کاری (ID) در مسیر یافت نشد.</AlertDescription>
                </Alert>
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
            </div>
        );
    }

    return (
        <NewWeekPatternForm
            // استفاده از as any برای رفع خطای Types of 'control._options.resolver'
            {...(editFormHook as any)}
            onCancel={() => {
                navigate(-1);
            }}
            isEditMode={true}
        />
    );
}