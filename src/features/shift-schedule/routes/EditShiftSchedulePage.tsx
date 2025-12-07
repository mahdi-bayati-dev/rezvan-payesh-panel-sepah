import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { EditShiftScheduleForm } from "../components/EditShiftScheduleForm";
import { useEditShiftScheduleForm } from "../hooks/useEditShiftScheduleForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { EditShiftScheduleFormSkeleton } from "@/features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton";
import { useWorkPatterns } from '@/features/work-pattern/hooks/api/useWorkPatternsHookGet';
import { type WorkPatternBase } from '@/features/shift-schedule/types';

export default function EditShiftSchedulePage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();
    const shiftScheduleId = patternId ?? null;

    const editFormHook = useEditShiftScheduleForm({
        shiftScheduleId: shiftScheduleId,
        onSuccess: () => {
            navigate('/work-patterns');
        }
    });
    const { isLoadingInitialData, generalApiError } = editFormHook;

    const { data: patternsData, isLoading: isLoadingPatterns } = useWorkPatterns();
    const rawPatterns = patternsData?.patterns || [];

    const availablePatterns: WorkPatternBase[] = useMemo(() => {
        if (!rawPatterns) return [];
        return rawPatterns
            .filter(p => p.pattern_type !== 'SHIFT_SCHEDULE')
            .map((p) => ({
                id: p.id,
                name: p.name
            }));
    }, [rawPatterns]);

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

    if (isLoadingInitialData || isLoadingPatterns) {
        return <EditShiftScheduleFormSkeleton />;
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

    return (
        <EditShiftScheduleForm
            // استفاده از as any برای دور زدن خطای تایپ handleSubmit
            // چون در هوک as any استفاده کردیم، اینجا هم تایپ‌ها کمی شل می‌شوند
            {...(editFormHook as any)}
            availablePatterns={availablePatterns}
            onCancel={() => {
                navigate(-1);
            }}
        />
    );
}