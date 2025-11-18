import React from 'react';
import clsx from 'clsx'; // (clsx یا classnames برای ادغام کلاس‌ها عالی است)

/**
 * کامپوننت پایه Card
 * این فایل کامپوننت‌های Card, CardHeader, CardTitle, و CardContent را export می‌کند
 * که در صفحه مدیریت کارمندان استفاده می‌شوند.
 */

// ۱. کامپوننت Card (پوسته اصلی)
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        // کلاس‌های پایه برای یک کارت: گوشه‌های گرد، پس‌زمینه، سایه و حاشیه
        className={clsx(
            'rounded-xl border border-borderL bg-backgroundL-500 shadow-md dark:border-borderD dark:bg-backgroundD',
            className // کلاس‌های اضافی که کاربر پاس می‌دهد
        )}
        {...props}
    />
));
Card.displayName = 'Card'; // برای دیباگ کردن React

// ۲. کامپوننت CardHeader (هدر کارت)
const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        // کلاس‌های پایه هدر: پدینگ و یک خط جداکننده در پایین
        className={clsx(
            'flex flex-col space-y-1.5 p-4 sm:p-6 border-b border-borderL dark:border-borderD',
            className
        )}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

// ۳. کامپوننت CardTitle (عنوان کارت)
const CardTitle = React.forwardRef<
    HTMLHeadingElement, // استفاده از تگ h2 یا h3 برای سمنتیک
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        // کلاس‌های پایه عنوان: اندازه فونت و ضخامت
        className={clsx(
            'font-semibold text-lg leading-none tracking-tight text-foregroundL dark:text-foregroundD',
            className
        )}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

// ۴. کامپوننت CardContent (محتوای کارت)
const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        // کلاس‌های پایه محتوا: فقط پدینگ
        className={clsx('p-4 sm:p-6', className)}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

// export کردن همه کامپوننت‌ها
export { Card, CardHeader, CardTitle, CardContent };