import React from 'react';
// ❌ حذف ایمپورت Headless UI
// import { Label as HeadlessLabel } from '@headlessui/react';
import clsx from 'clsx';

// کامپوننت Label برای استفاده در فرم‌ها
// ✅ تغییر: این کامپوننت حالا یک wrapper ساده دور تگ <label> استاندارد HTML است.
// این کار وابستگی به Headless UI context را حذف می‌کند و خطای 'relevant parent' را برطرف می‌کند.

interface LabelProps extends React.ComponentPropsWithoutRef<'label'> {
  // پراپ‌های اضافی در صورت نیاز
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    // ✅ تغییر: استفاده از تگ استاندارد <label> به جای <HeadlessLabel>
    <label
      ref={ref}
      className={clsx(
        // استایل‌های پایه شبیه به چیزی که در shadcn/ui استفاده می‌شود
        'text-sm font-medium leading-none text-gray-900 dark:text-gray-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className // استایل‌های سفارشی که شما پاس می‌دهید
      )}
      {...props}
    />
  )
);

Label.displayName = 'Label';