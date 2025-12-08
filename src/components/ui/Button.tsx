import React from 'react';
import clsx from 'clsx'; // برای ترکیب کلاس‌ها

// تعریف انواع مختلف ظاهر دکمه
type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
// تعریف اندازه‌های مختلف دکمه
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean; // برای استفاده با کامپوننت‌های دیگر مثل Link (فعلاً پیاده‌سازی نشده)
}

// مپ کردن variant و size به کلاس‌های Tailwind
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primaryL text-primary-foregroundL hover:bg-primaryL/90 dark:bg-primaryD dark:text-primary-foregroundD dark:hover:bg-primaryD/90',
  outline: 'border  border-borderL bg-transparent hover:bg-secondaryL hover:text-secondary-foregroundL dark:border-borderD dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD dark:text-secondary-foregroundD',
  destructive: 'bg-destructiveL text-destructive-foregroundL hover:bg-destructiveL/90 dark:bg-destructiveD dark:text-destructive-foregroundD dark:hover:bg-destructiveD/90',
  secondary: 'bg-secondaryL text-secondary-foregroundL hover:bg-secondaryL/80 dark:bg-secondaryD dark:text-secondary-foregroundD dark:hover:bg-secondaryD/80',
  ghost: 'hover:bg-secondaryL hover:text-secondary-foregroundL dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD',
  link: 'text-primaryL underline-offset-4 hover:underline dark:text-primaryD',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-md px-3',
  md: 'h-10 px-4 py-2', // اندازه پیش‌فرض
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10', // برای دکمه‌های فقط آیکون
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    // کامنت: اگر asChild پیاده‌سازی شود، باید از Slot استفاده کرد
    const Comp = /* asChild ? Slot : */ 'button';
    return (
      <Comp
        className={clsx(
          // استایل‌های پایه
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          // اعمال کلاس‌های variant و size
          variantClasses[variant],
          sizeClasses[size],
          className // کلاس‌های اضافی که از بیرون پاس داده می‌شوند
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button }; // اکسپورت به صورت named
