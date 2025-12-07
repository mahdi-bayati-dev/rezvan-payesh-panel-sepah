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

        onSuccess: (apiResponse, variables) => {
            // 🐞 لاگ دیباگ:
            console.log('useUpdateWeekPattern (PUT) onSuccess: Raw API Response:', apiResponse);

            // 🟢🟢🟢 راه‌حل کلیدی مشکل ۲ (آپدیت آنی) 🟢🟢🟢
            // ۱. داده‌های اصلی الگو را از پاسخ API استخراج می‌کنیم
            // const updatedPatternData = apiResponse.data;

            // ۲. کلید کوئری جزئیات را *دقیقاً* مشابه useWeekPatternDetails می‌سازیم (با رشته‌ای کردن ID)
            const queryKey = ['weekPatternDetails', String(variables.id)];

            // 🐞 لاگ دیباگ:
            console.log(`useUpdateWeekPattern (PUT) onSuccess: Attempting to setQueryData for key: ${JSON.stringify(queryKey)}`);

            // ۳. کش جزئیات را به صورت دستی آپدیت می‌کنیم (آپدیت آنی UI)
            // (نکته: ما در اینجا به داده‌های UI تبدیل نمی‌کنیم،
            // چون هوک useWeekPatternDetails در select خود این کار را انجام می‌دهد.
            // اگر بخواهیم دقیقاً داده UI را ست کنیم، باید تابع transformDetailsApiToUi را ایمپورت کنیم)
            // برای سادگی، فعلاً داده خام API را ست می‌کنیم.
            queryClient.setQueryData(queryKey, apiResponse); // ست کردن کل پاسخ { data: ... }

            // اگر هوک useWeekPatternDetails مستقیماً داده UI را انتظار دارد:
            // queryClient.setQueryData(queryKey, transformDetailsApiToUi(updatedPatternData)); // (نیاز به ایمپort تابع transform)


            // 🟢🟢🟢 راه‌حل کلیدی مشکل ۳ (کلید Invalidation اشتباه) 🟢🟢🟢
            // ۴. لیست اصلی را Invalidate می‌کنیم (تا در بازگشت به صفحه اصلی، لیست آپدیت شود)
            // کلید ['weekPatterns'] اشتباه بود.
            queryClient.invalidateQueries({ queryKey: ['weekPatternsList'] });

            // 🐞 لاگ دیباگ:
            console.log("useUpdateWeekPattern (PUT) onSuccess: Invalidated query list: ['weekPatternsList']");

            toast.success('الگوی کاری با موفقیت به‌روزرسانی شد!');
        },

        onError: (error) => {
            // 🐞 لاگ دیباگ:
            console.error("useUpdateWeekPattern (PUT) onError:", error);
            // کامنت: منطق مدیریت خطای عمومی (خطای 422 در فرم مدیریت می‌شود)
            if (error.response?.status !== 422) {
                const errorMessage = (error.response?.data as { message: string })?.message || 'خطایی در هنگام به‌روزرسانی الگو رخ داد.';
                toast.error(errorMessage);
            }
        },
    });
}