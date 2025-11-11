import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { deleteWeekPattern } from '@/features/work-pattern/api/workPatternAPI'

// کامنت: هوک اختصاصی برای مدیریت فرآیند حذف یک الگوی کاری هفتگی
export const useDeleteWeekPattern = () => {
    const queryClient = useQueryClient()

    return useMutation<
        void, // تایپ خروجی (204 No Content)
        AxiosError<{ message: string }>, // تایپ خطا (شامل 409 Conflict)
        number | string // تایپ ورودی: ID الگوی کاری
    >({
        mutationFn: deleteWeekPattern, // تابع API نهایی

        onSuccess: (_, deletedId) => {

            // 🟢🟢🟢 راه‌حل کلیدی مشکل ۳ (کلید Invalidation اشتباه) 🟢🟢🟢
            // کلید ['weekPatterns'] اشتباه بود.
            queryClient.invalidateQueries({ queryKey: ['weekPatternsList'] })
            // 🐞 لاگ دیباگ:
            console.log("useDeleteWeekPattern (DELETE) onSuccess: Invalidated query list: ['weekPatternsList']");


            // 🟢🟢🟢 راه‌حل کلیدی مشکل ۱ (عدم تطابق کلید) 🟢🟢🟢
            // ما باید کلید کش جزئیات را *دقیقاً* مشابه useWeekPatternDetails (با رشته‌ای کردن ID) پاک کنیم.
            const queryKey = ['weekPatternDetails', String(deletedId)];
            queryClient.removeQueries({ queryKey: queryKey })
            // 🐞 لاگ دیباگ:
            console.log(`useDeleteWeekPattern (DELETE) onSuccess: Removed queries for key: ${JSON.stringify(queryKey)}`);

            toast.success('الگوی کاری با موفقیت حذف شد.');
        },

        onError: (error) => {
            const errorMessage = error.response?.data?.message
                || 'خطایی در هنگام حذف الگو رخ داد.';

            // 🐞 لاگ دیباگ:
            console.error("useDeleteWeekPattern (DELETE) onError:", error);

            // کامنت: مدیریت خطای 409 Conflict (مثلاً اگر الگو به گروهی اختصاص داده شده باشد)
            if (error.response?.status === 409) {
                toast.error(errorMessage); // نمایش پیام Conflict از سمت سرور
            } else {
                // مدیریت سایر خطاها (404, 500 و ...)
                toast.error(errorMessage);
            }
        },
    });
}