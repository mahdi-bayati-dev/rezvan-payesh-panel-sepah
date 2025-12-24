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
            // 🟢 Invalidation صحیح لیست
            queryClient.invalidateQueries({ queryKey: ['weekPatternsList'] })

            // 🟢 حذف کش جزئیات (برای جلوگیری از نمایش اطلاعات قدیمی اگر کاربر همان ID را دوباره باز کرد)
            const queryKey = ['weekPatternDetails', String(deletedId)];
            queryClient.removeQueries({ queryKey: queryKey })

            toast.success('الگوی کاری با موفقیت حذف شد.');
        },

        onError: (error) => {
            console.error("useDeleteWeekPattern (DELETE) onError:", error);

            // ✅ مدیریت اختصاصی خطای 409 (Conflict)
            // این خطا زمانی رخ می‌دهد که الگو به سرباز یا گروهی متصل باشد
            if (error.response?.status === 409) {
                toast.error(
                    <div className="text-right text-sm font-vazir" dir="rtl">
                        <div className="font-bold mb-1 flex items-center gap-1">
                            ⛔ حذف غیرمجاز
                        </div>
                        <p className="leading-6">
                            این الگو به تعدادی از سربازان اختصاص داده شده است و قابل حذف نیست.
                        </p>
                        <p className="mt-2 text-xs opacity-90 border-t border-white/20 pt-1">
                            لطفاً ابتدا سربازان را مدیریت کنید، سپس اقدام به حذف نمایید.
                        </p>
                    </div>,
                    {
                        autoClose: 6000, // زمان نمایش بیشتر برای خواندن متن طولانی
                        className: "font-vazir"
                    }
                );
            } else {
                // مدیریت سایر خطاها (404, 500 و ...)
                const errorMessage = error.response?.data?.message
                    || 'خطایی در هنگام حذف الگو رخ داد.';
                toast.error(errorMessage);
            }
        },
    });
}