import { Menu, HelpCircle, } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";
import { AppVersionBadge } from "@/components/ui/AppVersionBadge";
import { SyncedClock } from "@/features/system-check/components/SyncedClock";
import { useOnboarding } from '@/features/Onboarding/useOnboarding';

// استفاده از Alias برای فراخوانی دارایی‌های گرافیکی
import logoLight from "@/assets/images/img-header/logo-1.png";
import logoDark from "@/assets/images/img-header/logo-2.png";

interface HeaderProps {
  onMenuClick: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "مدیر ارشد",
  [ROLES.ADMIN_L2]: "ادمین سطح ۲",
  [ROLES.ADMIN_L3]: "ادمین سطح ۳",
  [ROLES.USER]: "کاربر عادی",
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const userRoles = useAppSelector(selectUserRoles);
  const { startTour } = useOnboarding();

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  /**
   * دریافت برچسب نمایشی نقش کاربر بر اساس سلسله مراتب دسترسی
   */
  const getDisplayRoleLabel = () => {
    if (!userRoles || userRoles.length === 0) return "کاربر مهمان";
    const priorityRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_L2, ROLES.ADMIN_L3, ROLES.USER];
    for (const role of priorityRoles) {
      if (userRoles.includes(role)) return ROLE_LABELS[role];
    }
    return "کاربر سیستم";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-borderL/40 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 dark:border-borderD dark:bg-backgroundD">

      {/* --- بخش راست: برندینگ و نقش کاربر (چیدمان مرتب) --- */}
      <div className="flex items-center gap-4">
        {/* دکمه همبرگری موبایل */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foregroundL transition-all active:scale-95 hover:bg-secondaryL md:hidden dark:text-muted-foregroundD dark:hover:bg-secondaryD"
        >
          <Menu size={22} />
        </button>

        {/* لوگو و نام تجاری */}
        <div className="flex items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl">
            <img className="h-full w-full object-contain" src={logoSrc} alt="لوگو" />
          </div>
          <div className="hidden flex-col leading-tight md:flex">
            <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white lg:text-base">
              رضـــوان <span className="text-primaryL dark:text-primaryD">پایش</span>
            </h1>
            <span className="text-[10px] font-bold text-muted-foregroundL dark:text-muted-foregroundD">
              مدیریت هوشمند تردد
            </span>
          </div>
        </div>

        {/* خط جداکننده (Divider) */}
        <div className="hidden h-8 w-px bg-borderL/60 dark:bg-borderD/60 sm:block" />

        {/* نمایش نقش ادمین در سمت راست کنار برند */}
        <div className="flex flex-col items-start leading-none">
          <span className="mb-0.5 text-[9px] font-medium uppercase tracking-tighter text-muted-foregroundL dark:text-muted-foregroundD">
            سطح دسترسی
          </span>
          <span className="rounded-lg bg-primaryL/10 px-2 py-0.5 text-xs font-black text-primaryL dark:bg-primaryD/10 dark:text-primaryD">
            {getDisplayRoleLabel()}
          </span>
        </div>
      </div>

      {/* --- بخش چپ: ابزارها، ساعت و تنظیمات --- */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* ساعت سیستم - فقط در دسکتاپ نمایش داده می‌شود */}
        <div className="hidden items-center lg:flex">
          <SyncedClock />
          <div className="mx-3 h-6 w-px bg-borderL/60 dark:bg-borderD/60" />
        </div>

        {/* گروه ابزارهای تعاملی (راهنما و تم) */}
        <div className="flex items-center gap-1 rounded-2xl border border-borderL/50 bg-secondaryL/30 p-1 dark:border-borderD/50 dark:bg-secondaryD/20">
          <button
            onClick={() => startTour(true)}
            className="group flex h-9 items-center gap-2 rounded-xl px-2 text-muted-foregroundL transition-all hover:bg-white hover:text-blue-600 dark:text-muted-foregroundD dark:hover:bg-gray-800 dark:hover:text-blue-400"
            title="راهنمای تعاملی"
          >
            <HelpCircle size={18} className="group-hover:rotate-12" />
            <span className="hidden text-xs font-bold md:inline">راهنما</span>
          </button>

          <div className="h-4 w-px bg-borderL/80 dark:bg-borderD/80" />

          <ThemeToggleBtn />
        </div>

        {/* بخش اعلان‌ها و نسخه اپلیکیشن */}
        <div className="flex items-center gap-2">
          <div className="hidden h-8 w-px bg-borderL/60 dark:bg-borderD/60 md:block" />

          <div className="hidden md:block">
            <AppVersionBadge />
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;