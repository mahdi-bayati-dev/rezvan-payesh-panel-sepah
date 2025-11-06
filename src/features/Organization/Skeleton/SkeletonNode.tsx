import { Skeleton } from '@/components/ui/Skeleton';

/**
 * یک ردیف اسکلتی برای درخت.
 * این کامپوننت داخلی است و فقط در این فایل استفاده می‌شود.
 */
const SkeletonNode = ({ indentationLevel = 0 }: { indentationLevel?: number }) => {
  // محاسبه تورفتگی بر اساس سطح
  const paddingRight = `${indentationLevel * 1.5}rem`; // 1.5rem (pr-6) برای هر سطح

  return (
    <div className="flex items-center justify-between p-2" style={{ paddingRight }}>
      {/* شبیه‌سازی آیکون و نام */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 flex-shrink-0" />
        <Skeleton className="h-6 w-32 md:w-48" />
      </div>
      {/* شبیه‌سازی دکمه‌های عملیات (ویرایش، حذف...) */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-7" />
      </div>
    </div>
  );
};


/**
 * اسکلت لودینگ برای کامپوننت درخت سازمانی.
 * این کامپوننت یک ساختار درختی تودرتو را شبیه‌سازی می‌کند.
 */
export const OrganizationTreeSkeleton = () => {
  return (
    // کلاس‌های این card باید با card واقعی در OrganizationPage مطابقت داشته باشد
    <div
      className="p-5 bg-backgroundL-500 rounded-lg shadow-md dark:bg-backgroundD border border-borderL dark:border-borderD min-h-[400px]"
      dir="rtl"
    >
      {/* شبیه‌سازی هدر کارت (مثلاً عنوان "چارت سازمانی") */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-borderL dark:border-borderD">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* شبیه‌سازی ردیف‌های تودرتوی درخت */}
      <div className="space-y-1">
        <SkeletonNode indentationLevel={0} />
        <SkeletonNode indentationLevel={1} />
        <SkeletonNode indentationLevel={1} />
        <SkeletonNode indentationLevel={2} />
        <SkeletonNode indentationLevel={0} />
        <SkeletonNode indentationLevel={1} />
        <SkeletonNode indentationLevel={1} />
        <SkeletonNode indentationLevel={0} />
      </div>
    </div>
  );
};