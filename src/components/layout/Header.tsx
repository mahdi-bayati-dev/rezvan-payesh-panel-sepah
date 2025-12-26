import { Menu, HelpCircle, Quote, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";
import { AppVersionBadge } from "@/components/ui/AppVersionBadge";
import { SyncedClock } from "@/features/system-check/components/SyncedClock";
import { useOnboarding } from '@/features/Onboarding/useOnboarding';

import logoLight from "@/assets/images/img-header/logo-1.png";
import logoDark from "@/assets/images/img-header/logo-2.png";

interface HeaderProps {
  onMenuClick: () => void;
}

// تغییر عناوین به رده‌های نظامی استاندارد
const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "فرمانده ارشد",
  [ROLES.ADMIN_L2]: "جانشین ستاد",
  [ROLES.ADMIN_L3]: "افسر پایش",
  [ROLES.USER]: "کاربر عملیاتی",
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const userRoles = useAppSelector(selectUserRoles);
  const { startTour } = useOnboarding();

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  /**
   * دریافت برچسب جایگاه سازمانی (نظامی)
   */
  const getDisplayRoleLabel = () => {
    if (!userRoles || userRoles.length === 0) return "پرسنل مهمان";
    const priorityRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_L2, ROLES.ADMIN_L3, ROLES.USER];
    for (const role of priorityRoles) {
      if (userRoles.includes(role)) return ROLE_LABELS[role];
    }
    return "کاربر سیستم";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-borderL/40 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 dark:border-borderD dark:bg-backgroundD/90">

      {/* --- بخش راست: برندینگ و جایگاه سازمانی --- */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foregroundL transition-all active:scale-95 hover:bg-secondaryL md:hidden dark:text-muted-foregroundD dark:hover:bg-secondaryD"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center">
            <img className="h-full w-full object-contain" src={logoSrc} alt="لوگو" />
          </div>
          <div className="hidden flex-col leading-tight md:flex">
            <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white lg:text-base">
              رضـــوان <span className="text-emerald-600 dark:text-emerald-400">پایش</span>
            </h1>
            <span className="text-[10px] font-bold text-muted-foregroundL dark:text-muted-foregroundD">
              مدیریت هوشمند تردد
            </span>
          </div>
        </div>

        <div className="hidden h-8 w-px bg-borderL/60 dark:bg-borderD/60 sm:block" />

        {/* نمایش رده نظامی کاربر */}
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="mb-0.5 text-[9px] font-medium text-muted-foregroundL dark:text-muted-foregroundD flex items-center gap-1">
            <ShieldCheck size={10} /> جایگاه سازمانی
          </span>
          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
            {getDisplayRoleLabel()}
          </span>
        </div>
      </div>

      {/* --- بخش میانی: جمله انتخابی (فقط دسکتاپ‌های عریض) --- */}
      <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 px-4 py-1">
        <Quote size={12} className="text-primaryL/30 dark:text-primaryD/30" />
        <p className="text-sm  text-muted-foregroundL/80 dark:text-muted-foregroundD/80 italic">
          «سربازان، حصار مستحکم کشورند؛ اگر این حصار سست شود، امنیت از بین می‌رود.»
        </p>
        <span className="text-xs  text-muted-foregroundL/80 dark:text-muted-foregroundD/80 italic">امام خامنه ای</span>
      </div>

      {/* --- بخش چپ: ابزارها، ساعت و نسخه اپلیکیشن --- */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* ساعت سیستم */}
        <div className="hidden items-center lg:flex">
          <SyncedClock />
          <div className="mx-3 h-6 w-px bg-borderL/60 dark:bg-borderD/60" />
        </div>

        {/* گروه ابزارها */}
        <div className="flex items-center gap-1 rounded-2xl border border-borderL/50 bg-secondaryL/30 p-1 dark:border-borderD/50 dark:bg-secondaryD/20">
          <button
            onClick={() => startTour(true)}
            className="group flex h-9 items-center gap-2 rounded-xl px-2 text-muted-foregroundL transition-all hover:bg-white hover:text-blue-600 dark:text-muted-foregroundD dark:hover:bg-gray-800 dark:hover:text-blue-400"
          >
            <HelpCircle size={18} />
            <span className="hidden text-xs font-bold md:inline">راهنما</span>
          </button>
          <div className="h-4 w-px bg-borderL/80 dark:bg-borderD/80" />
          <ThemeToggleBtn />
        </div>

        {/* بخش نسخه اپلیکیشن (بازگردانی شد) */}
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