import { Menu } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";

// ✅ استاندارد: ایمپورت تصاویر از Assets
// نکته: برای کار کردن این کد، باید عکس‌ها را به src/assets/images/header منتقل کنی
// اگر هنوز منتقل نکرده‌ای، موقتاً این خطوط را کامنت کن و از آدرس استاتیک استفاده کن، اما روش استاندارد این است:
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

  // ✅ انتخاب هوشمند منبع تصویر
  // استفاده از متغیر ایمپورت شده باعث می‌شود Vite آدرس نهایی هش‌دار را جایگزین کند
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
          {/* ✅ بهینه‌سازی تگ img:
            1. width/height: جلوگیری از پرش صفحه (Layout Shift)
            2. fetchPriority: چون لوگو بالای صفحه است و مهم است، اولویت بالا می‌دهیم.
          */}
          <img
            className="max-w-20 max-h-16 w-auto h-auto object-contain"
            src={logoSrc}
            alt="لوگوی رضوان پایش - سامانه مدیریت"
            width={80} 
            height={64}
            fetchPriority="high" 
          />
          <h1 className="hidden md:block text-lg font-bold text-primaryL dark:text-primaryD">
            رضـــوان پایش
          </h1>
        </div>
        
        <span className="rounded-full font-bold bg-secondaryL px-2.5 py-0.5 text-sm whitespace-nowrap text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD">
          {getDisplayRoleLabel()}
        </span>
      </div>

      <div className="flex items-center gap-3 md:mr-5">
        <div className="flex items-center justify-center">
          <ThemeToggleBtn />
        </div>
        <div className="h-6 w-px bg-borderL dark:bg-borderD mx-1 hidden sm:block"></div>
      </div>
    </header>
  );
};