import { useQuery } from '@tanstack/react-query';
import { getWeekPatternsList } from '@/features/work-pattern/api/workPatternAPI';

/**
 * هوک برای فچ کردن لیست صفحه‌بندی شده الگوهای کاری هفتگی.
 * @param page شماره صفحه
 */
export const useWeekPatternsList = (page: number = 1, per_page: number = 15) => {
    return useQuery({
        queryKey: ['weekPatternsList', { page, per_page }], // ✅ آپدیت: per_page به کلید اضافه شد
        queryFn: () => getWeekPatternsList(page, per_page), // ✅ آپدیت: per_page پاس داده شد
        placeholderData: (previousData) => previousData, // یا keepPreviousData: true
        // select: (data) => data // نیازی به تبدیل نیست، لیست ساده است
    });
};