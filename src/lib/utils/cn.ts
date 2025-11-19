// src/lib/utils/cn.ts

/**
 * نسخه ساده‌سازی شده و بومی (Native) تابع cn.
 * این نسخه هیچ وابستگی خارجی (مانند clsx یا tailwind-merge) ندارد.
 * * کاربرد: حذف مقادیر null/undefined/false و چسباندن کلاس‌ها به هم.
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}