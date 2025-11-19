// src/components/layout/Header.tsx

import { Menu } from "lucide-react";
import { useAppSelector } from "@/store"; // یا "@/hook/reduxHooks" اگر هوک‌ها آنجا هستند
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";

interface HeaderProps {
  onMenuClick: () => void;
}

// نگاشت نام نقش‌ها به متن فارسی برای نمایش در Badge
const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "مدیر ارشد",
  [ROLES.ADMIN_L2]: "ادمین سطح ۲",
  [ROLES.ADMIN_L3]: "ادمین سطح ۳",
  [ROLES.USER]: "کاربر عادی",
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useAppSelector((state) => state.ui.theme);
  // دریافت نقش‌های کاربر از Redux
  const userRoles = useAppSelector(selectUserRoles);

  const logoSrc =
    theme === "dark"
      ? "/img/img-header/logo-2.webp"
      : "/img/img-header/logo-1.webp";

  /**
   * تابع کمکی برای پیدا کردن بالاترین نقش کاربر جهت نمایش.
   * اولویت نمایش: سوپر ادمین > ادمین ۲ > ادمین ۳ > کاربر
   */
  const getDisplayRoleLabel = () => {
    if (!userRoles || userRoles.length === 0) return "کاربر مهمان";

    if (userRoles.includes(ROLES.SUPER_ADMIN)) return ROLE_LABELS[ROLES.SUPER_ADMIN];
    if (userRoles.includes(ROLES.ADMIN_L2)) return ROLE_LABELS[ROLES.ADMIN_L2];
    if (userRoles.includes(ROLES.ADMIN_L3)) return ROLE_LABELS[ROLES.ADMIN_L3];
    if (userRoles.includes(ROLES.USER)) return ROLE_LABELS[ROLES.USER];

    return "کاربر سیستم"; // حالت پیش‌فرض اگر نقش ناشناخته بود
  };

  return (
    <header className="flex items-center justify-between px-4 z-10 bg-backgroundL border-b border-borderL shadow-sm transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-full text-muted-foregroundL hover:bg-secondaryL focus:outline-none focus:ring-2 focus:ring-primaryL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:focus:ring-primaryD"
          aria-label="باز کردن منو"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <img
            className="max-w-20 max-h-16"
            src={logoSrc}
            alt="لوگوی شهرداری کرمان"
            loading="lazy"
            decoding="async"
          />
          <h1 className="hidden md:block text-lg font-bold text-primaryL dark:text-primaryD">
            رضـــوان پایش
          </h1>
        </div>

        {/* نمایش داینامیک نقش کاربر */}
        <span className="rounded-full font-bold bg-secondaryL px-2.5 py-0.5 text-sm whitespace-nowrap text-secondary-foregroundL md:mr-5 dark:bg-secondaryD dark:text-secondary-foregroundD">
          {getDisplayRoleLabel()}
        </span>
      </div>
    </header>
  );
};