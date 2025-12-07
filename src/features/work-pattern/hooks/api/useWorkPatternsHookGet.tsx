// کامنت: وارد کردن PaginatedWeekPatternsApiResponse که در هوک استفاده می‌شود
import { useQuery } from '@tanstack/react-query';
import { getWeekPatternsList } from '@/features/work-pattern/api/workPatternAPI'
import {
    type PaginatedWeekPatternsListApiResponse,
    type WeekPatternDetail,
    type WorkPatternUI,
    type DailyScheduleUI,
    type AtomicPattern,
    type ApiPaginationMeta, // ✅ ایمپورت متا
} from '@/features/work-pattern/types/index';
// ✅✅✅ ۱. ایمپورت هوک لیست شیفت‌ها
import { useShiftSchedules } from '@/features/shift-schedule/hooks/hook';

// نقشه نام پراپرتی‌های روز در API به نام فارسی و اندیس
const dayMapping: { [key: string]: { name: DailyScheduleUI['dayOfWeekName']; index: number } } = {
    saturday_pattern: { name: 'شنبه', index: 0 },
    sunday_pattern: { name: 'یکشنبه', index: 1 },
    monday_pattern: { name: 'دوشنبه', index: 2 },
    tuesday_pattern: { name: 'سه شنبه', index: 3 },
    wednesday_pattern: { name: 'چهارشنبه', index: 4 },
    thursday_pattern: { name: 'پنجشنبه', index: 5 },
    friday_pattern: { name: 'جمعه', index: 6 },
};

/**
 * تابع برای تبدیل داده یک الگوی هفتگی از فرمت API به فرمت UI
 */
const transformApiPatternToUi = (apiPattern: WeekPatternDetail): WorkPatternUI => {
    const daily_schedules: DailyScheduleUI[] = Object.entries(dayMapping)
        .map(([apiKey, { name, index }]) => {

            const patternKey = apiKey as keyof WeekPatternDetail;
            const atomicPattern: AtomicPattern | null =
                (typeof apiPattern[patternKey] === 'object' && apiPattern[patternKey] !== null)
                    ? apiPattern[patternKey] as AtomicPattern
                    : null;

            const isWorking = !!atomicPattern && atomicPattern.work_duration_minutes > 0;

            return {
                dayOfWeekName: name,
                dayIndex: index,
                atomicPattern: atomicPattern,
                is_working_day: isWorking,
                start_time: atomicPattern?.start_time || null,
                end_time: atomicPattern?.end_time || null,
                work_duration_minutes: atomicPattern?.work_duration_minutes ?? 0,
            };
        })
        .sort((a, b) => a.dayIndex - b.dayIndex);

    // ... (منطق تعیین نوع کلی الگو حذف شد چون دیگر لازم نیست) ...

    return {
        id: apiPattern.id,
        name: apiPattern.name,
        pattern_type: 'WEEK_PATTERN', // ✅ تعیین نوع
        daily_schedules: daily_schedules,
        organizationName: apiPattern.organization_name, // ✅ اضافه شد
    };
};


/**
 * ✅✅✅ هوک بازنویسی شده برای ادغام دو لیست ✅✅✅
 * هوک سفارشی برای گرفتن لیست الگوهای کاری ثابت و برنامه‌های شیفتی
 */
export const useWorkPatterns = (page: number = 1, per_page: number = 15) => {

    // ۲. فچ کردن لیست الگوهای ثابت (هفتگی)
    const weekPatternsQuery = useQuery({
        queryKey: ['weekPatternsList', { page, per_page }], // ✅ آپدیت: کلید کوئری
        queryFn: () => getWeekPatternsList(page, per_page), // ✅ آپدیت: تابع فچ
        // کامنت: تبدیل داده‌های ثابت به فرمت مشترک
        select: (data: PaginatedWeekPatternsListApiResponse): {
            patterns: WorkPatternUI[],
            meta: ApiPaginationMeta,
        } => ({
            patterns: data.data.map(transformApiPatternToUi),
            meta: data.meta,
        }),
    });

    // ۳. فچ کردن لیست برنامه‌های شیفتی (چرخشی)
    // کامنت: (این هوک از قبل selector دارد و داده آماده برمی‌گرداند)
    const shiftSchedulesQuery = useShiftSchedules(page, per_page);

    // ۴. ادغام نتایج
    const { data, isLoading, isError, error } = (() => {
        // کامنت: مدیریت وضعیت لودینگ و خطا
        const isLoading = weekPatternsQuery.isLoading || shiftSchedulesQuery.isLoading;
        const isError = weekPatternsQuery.isError || shiftSchedulesQuery.isError;
        const error = weekPatternsQuery.error || shiftSchedulesQuery.error;

        if (isLoading || isError || !weekPatternsQuery.data || !shiftSchedulesQuery.data) {
            return { data: null, isLoading, isError, error };
        }

        // --- منطق ادغام ---
        const combinedPatterns = [
            ...weekPatternsQuery.data.patterns,
            ...shiftSchedulesQuery.data.patterns,
        ];

        // کامنت: مرتب‌سازی بر اساس نام (اختیاری، اما برای UX خوب است)
        combinedPatterns.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
        const meta1 = weekPatternsQuery.data.meta;
        const meta2 = shiftSchedulesQuery.data.meta;

        // کامنت: ادغام Pagination Meta (استفاده از متا الگوهای ثابت به عنوان مرجع)
        // (نکته: این فرض می‌کند هر دو لیست صفحه‌بندی یکسانی دارند. 
        // اگر صفحه‌بندی‌ها متفاوت باشند، منطق باید پیچیده‌تر شود)
        const combinedMeta: ApiPaginationMeta = {
            current_page: page,
            total: (meta1?.total ?? 0) + (meta2?.total ?? 0),
            last_page: Math.max(meta1?.last_page ?? 0, meta2?.last_page ?? 0),
            per_page: per_page, // یا (meta1?.per_page ?? 0) + (meta2?.per_page ?? 0)
            from: Math.min(meta1?.from ?? Infinity, meta2?.from ?? Infinity),
            to: Math.max(meta1?.to ?? 0, meta2?.to ?? 0),
        };

        return {
            data: {
                patterns: combinedPatterns,
                meta: combinedMeta,
            },
            isLoading: false,
            isError: false,
            error: null,
        };
    })();

    // ۵. بازگرداندن نتیجه نهایی
    return {
        data,
        isLoading,
        isError,
        error,
    };
};

