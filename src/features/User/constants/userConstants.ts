// تمام مقادیر ثابت مربوط به کاربر در اینجا نگهداری می‌شوند
// این کار باعث می‌شود تغییرات در آینده فقط در یک نقطه انجام شود (Single Source of Truth)

import { type SelectOption } from "@/components/ui/SelectBox";

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN_L2: "org-admin-l2",
  ORG_ADMIN_L3: "org-admin-l3",
  USER: "user",
} as const;

export const ROLE_OPTIONS: SelectOption[] = [
  { id: USER_ROLES.USER, name: "کارمند (User)" },
  { id: USER_ROLES.ORG_ADMIN_L3, name: "ادمین واحد (L3)" },
  { id: USER_ROLES.ORG_ADMIN_L2, name: "ادمین سازمان (L2)" },
  // { id: USER_ROLES.SUPER_ADMIN, name: "مدیر کل (Super Admin)" }, // معمولاً در ساخت دستی نمایش داده نمی‌شود
];

export const EDUCATION_LEVELS = {
  DIPLOMA: "diploma",
  ADVANCED_DIPLOMA: "advanced_diploma",
  BACHELOR: "bachelor",
  MASTER: "master",
  DOCTORATE: "doctorate",
  POST_DOCTORATE: "post_doctorate",
} as const;

export const EDUCATION_OPTIONS: SelectOption[] = [
  { id: EDUCATION_LEVELS.DIPLOMA, name: "دیپلم" },
  { id: EDUCATION_LEVELS.ADVANCED_DIPLOMA, name: "فوق دیپلم" },
  { id: EDUCATION_LEVELS.BACHELOR, name: "لیسانس" },
  { id: EDUCATION_LEVELS.MASTER, name: "فوق لیسانس" },
  { id: EDUCATION_LEVELS.DOCTORATE, name: "دکتری" },
  { id: EDUCATION_LEVELS.POST_DOCTORATE, name: "پسادکتری" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { id: "male", name: "مرد" },
  { id: "female", name: "زن" },
];

export const MARITAL_STATUS_OPTIONS: SelectOption[] = [
  { id: "false", name: "مجرد" },
  { id: "true", name: "متاهل" },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { id: "active", name: "فعال" },
  { id: "inactive", name: "غیرفعال" },
];
