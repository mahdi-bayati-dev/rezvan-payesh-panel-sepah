// کامنت: این هوک useMutation برای ایجاد "الگوی هفتگی" است
// و تایپ‌های آن با مستندات نهایی هماهنگ شده است.

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
// کامنت: ایمپورت از API و تایپ‌های نهایی
import { createWeekPattern } from '@/features/work-pattern/api/workPatternAPI'
import type { 
  WeekPatternPayload, 
  SingleWeekPatternApiResponse, 
  ApiValidationError 
} from '@/features/work-pattern/types/index'

export const useCreateWeekPattern = () => {
  const queryClient = useQueryClient()

  return useMutation<
    SingleWeekPatternApiResponse, // تایپ موفقیت
    AxiosError<ApiValidationError | { message: string }>, // تایپ خطا
    WeekPatternPayload // تایپ ورودی (payload نهایی)
  >({
    mutationFn: createWeekPattern, // تابع API نهایی
    
    onSuccess: (data) => {
      console.log('الگوی کاری هفتگی با موفقیت ایجاد شد:', data);
      // کامنت: کلید کوئری لیست الگوهای هفتگی را invalidate می‌کنیم
      // (این کلید از کد اولیه شما گرفته شده است)
      queryClient.invalidateQueries({ queryKey: ['weekPatterns'] })
      toast.success('الگوی کاری هفتگی با موفقیت ایجاد شد!');
    },
    
    onError: (error) => {
      // کامنت: منطق مدیریت خطای عمومی (که در فرم 422 مدیریت نمی‌شود)
      const errorData = error.response?.data;
      
      // کامنت: اگر 422 بود، در فرم مدیریت می‌شود و اینجا پیامی نمی‌دهیم
      if (error.response?.status === 422) {
        console.warn("خطای اعتبارسنجی 422:", errorData);
        // کامنت: می‌توان یک toast عمومی هم برای 422 گذاشت
        // toast.error("لطفاً خطاهای فرم را بررسی کنید.");
        return; 
      }

      // کامنت: مدیریت سایر خطاها (500, 403, 401)
      let errorMessage = 'خطایی در هنگام ایجاد الگو رخ داد.';
      if (typeof errorData === 'object' && errorData && 'message' in errorData) {
        errorMessage = errorData.message;
      }

      toast.error(errorMessage);
    },
  });
}
