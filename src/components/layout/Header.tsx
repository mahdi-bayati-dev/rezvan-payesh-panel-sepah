import { Menu, HelpCircle } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";

// ✅ اصلاح ایمپورت: مستقیماً از هوک استفاده می‌کنیم نه از فایل کامپوننت
import { useOnboarding } from '@/features/Onboarding/useOnboarding';

import logoLight from "@/assets/images/img-header/logo-1.webp";
import logoDark from "@/assets/images/img-header/logo-2.webp";

interface HeaderProps {
  onMenuClick: () => void;
}

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "مدیر ارشد",
  [ROLES.ADMIN_L2]: "ادمین سطح ۲",
  [ROLES.ADMIN_L3]: "ادمین سطح ۳",
  [ROLES.USER]: "کاربر عادی",
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const userRoles = useAppSelector(selectUserRoles);

  // ✅ استفاده صحیح از هوک به جای کامپوننت
  const { startTour } = useOnboarding();

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  const getDisplayRoleLabel = () => {
    if (!userRoles || userRoles.length === 0) return "کاربر مهمان";
    if (userRoles.includes(ROLES.SUPER_ADMIN)) return ROLE_LABELS[ROLES.SUPER_ADMIN];
    if (userRoles.includes(ROLES.ADMIN_L2)) return ROLE_LABELS[ROLES.ADMIN_L2];
    if (userRoles.includes(ROLES.ADMIN_L3)) return ROLE_LABELS[ROLES.ADMIN_L3];
    if (userRoles.includes(ROLES.USER)) return ROLE_LABELS[ROLES.USER];
    return "کاربر سیستم";
  };

  return (
    <header className="flex items-center justify-between px-4 z-10 bg-backgroundL border-b border-borderL shadow-sm transition-colors duration-300 dark:bg-backgroundD dark:border-borderD h-16">
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
            className="max-w-20 max-h-12 w-auto h-auto object-contain"
            src={logoSrc}
            alt="لوگو"
            width={80}
            height={48}
            fetchPriority="high"
          />
          <h1 className="hidden md:block text-lg font-bold text-primaryL dark:text-primaryD mr-2">
            رضـــوان پایش
          </h1>
        </div>

        <span className="rounded-full font-bold bg-secondaryL px-2.5 py-0.5 text-xs whitespace-nowrap text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD">
          {getDisplayRoleLabel()}
        </span>
      </div>

      <div className="flex items-center gap-3 md:mr-5">
        <button
          onClick={() => startTour(true)} // ✅ پارامتر true برای اجرای دستی (Force)
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all flex items-center gap-2 group border border-transparent hover:border-blue-200"
          title="راهنمای این صفحه"
        >
          <HelpCircle className="w-5 h-5 group-hover:animate-bounce" />
          <span className="text-sm font-bold hidden md:inline">راهنما</span>
        </button>
        <div className="flex items-center justify-center">
          <ThemeToggleBtn />
        </div>
        <div className="h-6 w-px bg-borderL dark:bg-borderD mx-1 hidden sm:block"></div>
      </div>
    </header>
  );
};