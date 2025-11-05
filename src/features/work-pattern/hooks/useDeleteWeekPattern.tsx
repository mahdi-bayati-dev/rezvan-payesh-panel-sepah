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
            // کامنت: پس از حذف موفقیت‌آمیز، لیست اصلی را باطل (Invalidate) می‌کنیم
            queryClient.invalidateQueries({ queryKey: ['weekPatterns'] })
            // کامنت: جزئیات الگوی حذف شده را نیز از کش پاک می‌کنیم
            queryClient.removeQueries({ queryKey: ['weekPatternDetails', deletedId] })
            toast.success('الگوی کاری با موفقیت حذف شد.');
        },

        onError: (error) => {
            const errorMessage = error.response?.data?.message
                || 'خطایی در هنگام حذف الگو رخ داد.';

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
