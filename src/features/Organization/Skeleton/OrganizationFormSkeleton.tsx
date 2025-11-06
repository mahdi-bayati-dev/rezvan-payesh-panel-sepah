import { Skeleton } from '@/components/ui/Skeleton';

/**
 * اسکلت لودینگ برای کامپوننت OrganizationForm.
 * این کامپوننت فرم ایجاد/ویرایش واحد سازمانی را شبیه‌سازی می‌کند.
 */
export const OrganizationFormSkeleton = () => {
  return (
    // کلاس‌های این card باید با card واقعی در OrganizationPage مطابقت داشته باشد
    <div
      className="p-5 bg-backgroundL-500 rounded-lg shadow-md dark:bg-backgroundD border border-borderL dark:border-borderD"
      dir="rtl"
    >
      {/* شبیه‌سازی عنوان فرم */}
      <Skeleton className="h-7 w-3/4 mb-6" />

      {/* شبیه‌سازی فیلد اول (نام واحد) */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-5 w-1/4" /> {/* لیبل */}
        <Skeleton className="h-10 w-full" /> {/* اینپوت */}
      </div>

      {/* شبیه‌سازی فیلد دوم (واحد والد) */}
      <div className="space-y-2 mb-6">
        <Skeleton className="h-5 w-1/3" /> {/* لیبل */}
        <Skeleton className="h-10 w-full" /> {/* سلکت‌باکس */}
      </div>

      {/* شبیه‌سازی دکمه */}
      <Skeleton className="h-10 w-full" />
    </div>
  );
};