import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { updateWeekPattern } from '@/features/work-pattern/api/workPatternAPI'
import type {
    WeekPatternPayload,
    SingleWeekPatternApiResponse,
    ApiValidationError
} from '@/features/work-pattern/types/index'

// کامنت: هوک Mutation برای ویرایش یک الگوی کاری هفتگی
export const useUpdateWeekPattern = () => {
    const queryClient = useQueryClient()

    return useMutation<
        SingleWeekPatternApiResponse, // تایپ موفقیت
        AxiosError<ApiValidationError | { message: string }>, // تایپ خطا
        { id: number | string, payload: WeekPatternPayload } // تایپ ورودی: ID و Payload آپدیت
    >({
        mutationFn: ({ id, payload }) => updateWeekPattern(id, payload),

        onSuccess: (data, variables) => {
            console.log('الگوی کاری هفتگی با موفقیت به‌روزرسانی شد:', data);

            // ۱. کلید کوئری لیست الگوهای هفتگی را invalidate می‌کنیم (برای به‌روزرسانی لیست)
            queryClient.invalidateQueries({ queryKey: ['weekPatterns'] });

            // ۲. ✅ اصلاح اساسی: کش جزئیات این الگوی خاص را نیز invalidate می‌کنیم.
            // این کار تضمین می‌کند که useWeekPatternDetails به محض فعال شدن (بازگشت به صفحه اصلی)،
            // داده‌های جدید را از سرور فچ کند و شماتیک بلافاصله به‌روز شود.
            queryClient.invalidateQueries({ queryKey: ['weekPatternDetails', variables.id] });


            toast.success('الگوی کاری با موفقیت به‌روزرسانی شد!');
        },

        onError: (error) => {
            // کامنت: منطق مدیریت خطای عمومی (خطای 422 در فرم مدیریت می‌شود)
            if (error.response?.status !== 422) {
                const errorMessage = error.response?.data?.message || 'خطایی در هنگام به‌روزرسانی الگو رخ داد.';
                toast.error(errorMessage);
            }
        },
    });
}
