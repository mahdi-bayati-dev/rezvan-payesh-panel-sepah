import { Skeleton } from '@/components/ui/Skeleton';

/**
 * یک ردیف اسکلتی که دقیقاً مشابه ردیف‌های عکس طراحی شده است.
 * شامل: فلش، آیکون، متن (راست) و منوی سه نقطه (چپ)
 */
const SkeletonNode = ({ indentationLevel = 0 }: { indentationLevel?: number }) => {
  // محاسبه تورفتگی دقیقاً مشابه کامپوننت اصلی
  // هر سطح 20 پیکسل (یا 1.25rem) فاصله می‌گیرد
  const paddingRight = `${indentationLevel * 1.5}rem`; 

  return (
    <div 
      className="flex items-center justify-between py-3 px-4 border-b border-borderL/50 dark:border-borderD/50 last:border-0" 
      style={{ paddingRight: paddingRight ? `calc(1rem + ${paddingRight})` : '1rem' }} // پدینگ پایه + تورفتگی
    >
      {/* سمت راست: فلش + آیکون + متن */}
      <div className="flex items-center gap-3">
        {/* شبیه‌سازی فلش کوچک (Chevron) */}
        <Skeleton className="h-4 w-4 rounded-md" />
        
        {/* شبیه‌سازی آیکون ساختمان */}
        <Skeleton className="h-5 w-5 rounded-md" />
        
        {/* شبیه‌سازی متن نام سازمان */}
        <Skeleton className="h-5 w-32 md:w-48 rounded-md" />
      </div>

      {/* سمت چپ: منوی سه نقطه */}
      <div className="flex items-center pl-2">
        <Skeleton className="h-8 w-8 rounded-md" /> 
      </div>
    </div>
  );
};

/**
 * کامپوننت اصلی اسکلت که ساختار درختی عکس را شبیه‌سازی می‌کند.
 */
export const OrganizationTreeSkeleton = () => {
  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* 1. شبیه‌سازی هدر و دکمه بالای صفحه (طبق عکس) */}
      {/* نکته: اگر این هدر در کامپوننت والد (Page) هندل می‌شود، می‌توانید این بخش را حذف کنید 
          اما برای اطمینان از شباهت کامل، اینجا می‌گذارم */}
      <div className="flex justify-between items-center">
         {/* عنوان: چارت سازمانی */}
        <Skeleton className="h-8 w-40 rounded-md" />
        
        {/* دکمه: افزودن سازمان ریشه */}
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>

      {/* 2. شبیه‌سازی باکس سفید اصلی (Card) */}
      <div
        className="bg-backgroundL-500 dark:bg-backgroundD rounded-lg border border-borderL dark:border-borderD shadow-sm overflow-hidden"
      >
        {/* لیست آیتم‌ها با تورفتگی‌های مختلف برای شبیه‌سازی درخت */}
        <div className="flex flex-col">
          {/* سطح 0 (ریشه) */}
          <SkeletonNode indentationLevel={0} />
          
          {/* سطح 1 (فرزند) */}
          <SkeletonNode indentationLevel={1} />
          
          {/* سطح 1 (فرزند) */}
          <SkeletonNode indentationLevel={1} />
          
          {/* سطح 2 (نوه) */}
          <SkeletonNode indentationLevel={2} />
          
          {/* سطح 0 (ریشه دیگر) */}
          <SkeletonNode indentationLevel={0} />
          
          {/* سطح 1 (فرزند) */}
          <SkeletonNode indentationLevel={1} />
        </div>
      </div>
    </div>
  );
};