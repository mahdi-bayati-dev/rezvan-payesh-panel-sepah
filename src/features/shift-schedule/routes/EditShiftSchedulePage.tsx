import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { EditShiftScheduleForm } from "../components/EditShiftScheduleForm";
import { useEditShiftScheduleForm } from "../hooks/useEditShiftScheduleForm";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ArrowRight, AlertOctagon } from 'lucide-react';
import { EditShiftScheduleFormSkeleton } from "@/features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton";
import { useWorkPatterns } from '@/features/work-pattern/hooks/api/useWorkPatternsHookGet';
import { type AvailableWorkPattern } from '@/features/shift-schedule/types';

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

    const availablePatterns: AvailableWorkPattern[] = useMemo(() => {
        if (!rawPatterns) return [];
        return rawPatterns
            .filter(p => p.pattern_type !== 'SHIFT_SCHEDULE')
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                start_time: p.start_time || "08:00",
                end_time: p.end_time || "16:00"
            }));
    }, [rawPatterns]);

    const handleGoBack = () => navigate(-1);

    if (!shiftScheduleId) {
        return (
            <div className="max-w-2xl mx-auto p-8 space-y-6" dir="rtl">
                <Alert variant="destructive" className="border-destructiveL-foreground/20 bg-destructiveL-background dark:bg-destructiveD-background">
                    <AlertOctagon className="h-5 w-5 text-destructiveL-foreground dark:text-destructiveD-foreground" />
                    <div className="mr-3">
                        <AlertTitle className="text-destructiveL-foreground dark:text-destructiveD-foreground font-bold">خطای پارامتر</AlertTitle>
                        <AlertDescription className="text-destructiveL-foreground/90 dark:text-destructiveD-foreground/90">
                            شناسه برنامه شیفتی (ID) در آدرس صفحه یافت نشد.
                        </AlertDescription>
                    </div>
                </Alert>
                <Button onClick={handleGoBack} variant="outline" className="w-full gap-2">
                    <ArrowRight className="w-4 h-4" />
                    بازگشت به لیست الگوها
                </Button>
            </div>
        );
    }

    if (isLoadingInitialData || isLoadingPatterns) {
        return <EditShiftScheduleFormSkeleton />;
    }

    if (generalApiError && generalApiError.includes("خطا در بارگذاری")) {
        return (
            <div className="max-w-2xl mx-auto p-8 space-y-6" dir="rtl">
                <Alert variant="destructive" className="border-destructiveL-foreground/20 bg-destructiveL-background dark:bg-destructiveD-background">
                    <AlertOctagon className="h-5 w-5 text-destructiveL-foreground dark:text-destructiveD-foreground" />
                    <div className="mr-3">
                        <AlertTitle className="text-destructiveL-foreground dark:text-destructiveD-foreground font-bold">خطا در دریافت اطلاعات</AlertTitle>
                        <AlertDescription className="text-destructiveL-foreground/90 dark:text-destructiveD-foreground/90">
                            {generalApiError}
                        </AlertDescription>
                    </div>
                </Alert>
                <Button onClick={handleGoBack} variant="outline" className="w-full gap-2">
                    <ArrowRight className="w-4 h-4" />
                    بازگشت و تلاش مجدد
                </Button>
            </div>
        );
    }

    return (
        <EditShiftScheduleForm
            {...(editFormHook as any)}
            availablePatterns={availablePatterns}
            onCancel={handleGoBack}
        />
    );
}