import { useQuery } from '@tanstack/react-query';
import { getWeekPatternsList } from '@/features/work-pattern/api/workPatternAPI';

/**
 * هوک برای فچ کردن لیست صفحه‌بندی شده الگوهای کاری هفتگی.
 * @param page شماره صفحه
 */
export const useWeekPatternsList = (page: number = 1) => {
    return useQuery({
        queryKey: ['weekPatternsList', { page }], // کلید کوئری مجزا برای لیست
        queryFn: () => getWeekPatternsList(page),
        placeholderData: (previousData) => previousData, // یا keepPreviousData: true
        // select: (data) => data // نیازی به تبدیل نیست، لیست ساده است
    });
};
