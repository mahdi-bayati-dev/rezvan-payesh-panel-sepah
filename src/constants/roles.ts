// src/constants/roles.ts

/**
 * تعریف نقش‌های موجود در سیستم مطابق با دیتابیس و پاسخ بک‌اند.
 * نکته: مقادیر این ثابت‌ها باید دقیقاً برابر با رشته‌هایی باشد که
 * از سمت سرور در آرایه `roles` کاربر ارسال می‌شود.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin", // دسترسی کامل
  ADMIN_L2: "org-admin-l2", // ادمین سطح ۲
  ADMIN_L3: "org-admin-l3", // ادمین سطح ۳
  USER: "user", // کاربر عادی
} as const;

// گروه‌های دسترسی برای استفاده راحت‌تر در روت‌ها و منوها

// ۱. تمام کاربران (برای موارد عمومی)
export const ALL_ACCESS = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_L2,
  ROLES.ADMIN_L3,
  ROLES.USER,
];

// ۲. فقط ادمین‌ها (سوپر، ۲ و ۳) - بدون کاربر عادی
export const ADMIN_ACCESS = [ROLES.SUPER_ADMIN, ROLES.ADMIN_L2, ROLES.ADMIN_L3];

// ۳. فقط سوپر ادمین (دسترسی‌های حساس)
export const SUPER_ADMIN_ONLY = [ROLES.SUPER_ADMIN];
