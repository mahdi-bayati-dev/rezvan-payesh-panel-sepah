import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react"; 
import { EditShiftScheduleForm } from "../components/EditShiftScheduleForm";
import { useEditShiftScheduleForm } from "../hooks/useEditShiftScheduleForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { EditShiftScheduleFormSkeleton } from "@/features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton";

// هوک لیست الگوها
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';
import { type WorkPatternBase } from '@/features/shift-schedule/types';

export default function EditShiftSchedulePage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();
    const shiftScheduleId = patternId ?? null;

    // 1. دریافت اطلاعات فرم ویرایش
    const editFormHook = useEditShiftScheduleForm({
        shiftScheduleId: shiftScheduleId,
        onSuccess: () => {
            navigate('/work-patterns');
        }
    });
    const { isLoadingInitialData, generalApiError } = editFormHook;

    // 2. دریافت لیست الگوها برای دراپ‌داون
    const { data: patternsData, isLoading: isLoadingPatterns } = useWorkPatterns();
    const rawPatterns = patternsData?.patterns || [];

    // 3. فیلتر کردن و آماده‌سازی لیست الگوها
    const availablePatterns: WorkPatternBase[] = useMemo(() => {
        if (!rawPatterns) return [];

        // ✅✅✅ اصلاح مهم برای رفع خطای کلید تکراری:
        // ما فقط الگوهایی را می‌خواهیم که از نوع 'SHIFT_SCHEDULE' نباشند (فقط الگوهای ثابت).
        // این کار باعث می‌شود تداخل ID بین جدول‌های مختلف از بین برود.
        return rawPatterns
            .filter(p => p.pattern_type !== 'SHIFT_SCHEDULE')
            .map((p) => ({ 
                id: p.id, 
                name: p.name 
            }));
    }, [rawPatterns]);

    // مدیریت عدم وجود ID
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

    // نمایش لودینگ
    if (isLoadingInitialData || isLoadingPatterns) {
        return <EditShiftScheduleFormSkeleton />;
    }

    // نمایش خطا
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

    return (
        <EditShiftScheduleForm
            {...editFormHook}
            availablePatterns={availablePatterns}
            onCancel={() => {
                navigate(-1);
            }}
        />
    );
}