import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";

/**
 * این هوک بررسی می‌کند که آیا کاربر جاری دارای یکی از نقش‌های مجاز هست یا خیر.
 * @param allowedRoles آرایه‌ای از نقش‌های مجاز
 * @returns boolean
 */
export const usePermission = (allowedRoles: string[]) => {
  const userRoles = useAppSelector(selectUserRoles);

  // اگر نقشی تعریف نشده یا آرایه خالی است، فرض بر عدم دسترسی است (امنیت بالا)
  if (!allowedRoles || allowedRoles.length === 0) return false;

  // اگر کاربر نقشی ندارد، دسترسی ندارد
  if (!userRoles || userRoles.length === 0) return false;

  // بررسی تداخل نقش‌های کاربر با نقش‌های مجاز
  return allowedRoles.some((role) => userRoles.includes(role));
};