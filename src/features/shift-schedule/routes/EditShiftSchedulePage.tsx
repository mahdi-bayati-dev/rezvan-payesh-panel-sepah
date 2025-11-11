import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react"; // ✅ ۱. ایمپورت useMemo

// ✅ اصلاح مسیردهی: استفاده از مسیر نسبی (relative path)
import { EditShiftScheduleForm } from "../components/EditShiftScheduleForm";
// ✅ اصلاح مسیردهی: استفاده از مسیر نسبی
import { useEditShiftScheduleForm } from "../hooks/useEditShiftScheduleForm";
// ✅ اصلاح بزرگی/کوچکی حروف: 'Alert' به 'alert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

import { EditShiftScheduleFormSkeleton } from "@/features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton";

// --- ✅ ۲. ایمپورت‌های مورد نیاز برای بهینه‌سازی ---
import { useWorkPatternsList } from '@/features/work-group/hooks/hook';
import { type WorkPatternBase } from '@/features/shift-schedule/types';
// --- پایان ایمپورت‌های جدید ---

export default function EditShiftSchedulePage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();
    const shiftScheduleId = patternId ?? null;

    // --- ✅ ۳. فراخوانی هر دو هوک در کامپوننت والد ---

    // هوک اول: دریافت اطلاعات اصلی برنامه شیفتی
    const editFormHook = useEditShiftScheduleForm({
        shiftScheduleId: shiftScheduleId,
        onSuccess: () => {
            navigate('/work-patterns');
        }
    });
    const {  isLoadingInitialData, generalApiError } = editFormHook;

    // هوک دوم: دریافت لیست الگوهای کاری (برای دراپ‌داون‌ها)
    const { data: rawPatterns, isLoading: isLoadingPatterns } =
        useWorkPatternsList();

    // --- ✅ ۴. پردازش داده‌های ثانویه در والد ---
    const availablePatterns: WorkPatternBase[] = useMemo(() => {
        return rawPatterns?.map((p) => ({ id: p.id, name: p.name })) || [];
    }, [rawPatterns]);

    // --- پایان فراخوانی‌ها ---

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

    // --- ✅ ۵. منطق لودینگ یکپارچه ---
    // اسکلت لودینگ را تا زمانی که *هر دو* درخواست API کامل نشده‌اند، نمایش بده
    if (isLoadingInitialData || isLoadingPatterns) {
        return (
            <EditShiftScheduleFormSkeleton />
        )
    }

    // مدیریت خطا (بدون تغییر)
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

    // --- ✅ ۶. رندر کامپوننت Presentational با پاس دادن Props ---
    return (
        <EditShiftScheduleForm
            // کامنت: ارسال تمام متدها و وضعیت‌ها از هوک Edit
            {...editFormHook}
            
            // کامنت: پاس دادن داده‌های ثانویه به عنوان Prop
            availablePatterns={availablePatterns} // <-- ✅ Prop جدید

            onCancel={() => {
                navigate(-1); // بازگشت به عقب هنگام لغو
            }}
        />
    );
}