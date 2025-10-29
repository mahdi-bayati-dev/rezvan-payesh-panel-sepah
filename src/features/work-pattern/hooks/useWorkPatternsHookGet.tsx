// کامنت: وارد کردن PaginatedWeekPatternsApiResponse که در هوک استفاده می‌شود
import { useQuery } from '@tanstack/react-query';
import { getWeekPatternsList } from '@/features/work-pattern/api/workPatternAPI'
import {
    type PaginatedWeekPatternsListApiResponse,
    type WeekPatternDetail,
    type WorkPatternUI,
    type DailyScheduleUI,
    type AtomicPattern
} from '@/features/work-pattern/types/index';

// کامنت: نقشه نام پراپرتی‌های روز در API به نام فارسی و اندیس
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
 * @param apiPattern آبجکت الگو از API (WeekPatternDetail)
 * @returns آبجکت الگو در فرمت UI (WorkPatternUI)
 */
const transformApiPatternToUi = (apiPattern: WeekPatternDetail): WorkPatternUI => {
    const daily_schedules: DailyScheduleUI[] = Object.entries(dayMapping)
        // کامنت: index را مستقیماً از dayMapping می‌گیریم تا برای مرتب‌سازی استفاده شود
        .map(([apiKey, { name, index }]) => {

            // کامنت: apiKey در اینجا 'saturday_pattern'، 'sunday_pattern' و ... است.
            // به TS اطمینان می‌دهیم که apiKey یکی از کلیدهای معتبر apiPattern است.
            const patternKey = apiKey as keyof WeekPatternDetail;

            // کامنت: ✅ دسترسی ایمن (Type-Safe) بدون نیاز به as unknown
            // چک می‌کنیم که مقدار بازگشتی آبجکت (AtomicPattern) باشد و نه id یا name
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
        // ✅ کامنت: مرتب‌سازی بهینه و ساده بر اساس اندیسی که در map اضافه کردیم
        .sort((a, b) => a.dayIndex - b.dayIndex);

    // کامنت: تعیین نوع کلی الگو (ساده‌سازی شده)
    let overallType: WorkPatternUI['type'] = 'off';
    // ✅ کامنت: اصلاح باگ (قبلا d.pattern.type بود)
    const patternTypes = new Set(daily_schedules.map(d => d.atomicPattern?.type).filter(Boolean));
    const workingDaysCount = daily_schedules.filter(d => d.is_working_day).length;

    if (workingDaysCount > 0) {
        if (patternTypes.size > 1) {
            overallType = 'mixed';
        } else if (patternTypes.has('fixed')) {
            overallType = 'fixed';
        } else if (patternTypes.has('floating')) {
            overallType = 'floating';
        }
    }

    return {
        id: apiPattern.id,
        name: apiPattern.name,
        type: overallType, // کامنت: مطمئن شوید این فیلد در WorkPatternUI فعال است
        daily_schedules: daily_schedules,
    };
};


/**
 * هوک سفارشی برای گرفتن لیست الگوهای کاری هفتگی و تبدیل آن به فرمت UI.
 * @param page شماره صفحه
 * @param type فیلتر نوع (اختیاری)
 */
export const useWorkPatterns = (page: number = 1, type?: string) => {
    return useQuery({
        queryKey: ['weekPatterns', { page, type }],
        queryFn: () => getWeekPatternsList(page),

        // ✅ کامنت: اکنون تایپ data (PaginatedWeekPatternsApiResponse) 
        // با تابع transformApiPatternToUi کاملاً هماهنگ است
        select: (data: PaginatedWeekPatternsListApiResponse): { 
            patterns: WorkPatternUI[],
            meta: PaginatedWeekPatternsListApiResponse['meta'], 
            links: PaginatedWeekPatternsListApiResponse['links'] 

        } => ({
            patterns: data.data.map(transformApiPatternToUi), // تبدیل هر الگو
            meta: data.meta,
            links: data.links,
        }),
        placeholderData: (previousData) => previousData,
    });
};