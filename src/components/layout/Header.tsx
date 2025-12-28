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

// بخش ایمپورت‌ها تغییری ندارد...

export const Header = ({ onMenuClick }: HeaderProps) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const userRoles = useAppSelector(selectUserRoles);
  const { startTour } = useOnboarding();

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  // منطق نقش‌ها - بهتر است به یک Selector در Redux منتقل شود
  const getDisplayRoleLabel = () => {
    if (!userRoles || userRoles.length === 0) return "پرسنل مهمان";
    const priorityRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_L2, ROLES.ADMIN_L3, ROLES.USER];
    for (const role of priorityRoles) {
      if (userRoles.includes(role)) return ROLE_LABELS[role];
    }
    return "کاربر سیستم";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-borderL/40 bg-white/95 px-4 backdrop-blur-md transition-all duration-300 dark:border-borderD dark:bg-backgroundD/95 shadow-sm">

      {/* --- بخش راست: برندینگ --- */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foregroundL transition-all active:scale-95 hover:bg-secondaryL md:hidden dark:text-muted-foregroundD dark:hover:bg-secondaryD"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <img className="h-full w-full object-contain" src={logoSrc} alt="لوگو رضوان" />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white lg:text-base">
              رضـــوان <span className="text-emerald-600 dark:text-emerald-400">پایش</span>
            </h1>
            <span className="text-[10px] font-bold text-muted-foregroundL/80 dark:text-muted-foregroundD/80">
              مدیریت هوشمند تردد
            </span>
          </div>
        </div>

        <div className="hidden h-8 w-px bg-borderL/40 dark:bg-borderD/40 md:block" />

        {/* جایگاه سازمانی با استایل رسمی‌تر */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex flex-col items-start">
            <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foregroundL dark:text-muted-foregroundD">
              <ShieldCheck size={11} className="text-emerald-600" /> جایگاه سازمانی
            </span>
            <span className="mt-0.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              {getDisplayRoleLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* --- بخش میانی: نقل قول (بهینه شده برای خوانایی) --- */}
      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-secondaryL/20 px-4 py-1.5 dark:bg-secondaryD/10 xl:flex border border-borderL/20 dark:border-borderD/20">
        <Quote size={12} className="text-emerald-600/50" />
        <p className="max-w-md truncate text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD">
          «سربازان، حصار مستحکم کشورند؛ اگر این حصار سست شود، امنیت از بین می‌رود.»
        </p>
        <span className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70">(امام خامنه‌ای)</span>
      </div>

      {/* --- بخش چپ: ابزارها --- */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:block">
          <SyncedClock />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-borderL/50 bg-secondaryL/30 p-1 dark:border-borderD/50 dark:bg-secondaryD/20">
          <button
            onClick={() => startTour(true)}
            title="راهنمای سامانه"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-muted-foregroundL transition-all hover:bg-white hover:text-primaryL dark:text-muted-foregroundD dark:hover:bg-zinc-800 dark:hover:text-primaryD"
          >
            <HelpCircle size={16} />
            <span className="hidden text-[11px] font-bold sm:inline">راهنما</span>
          </button>
          <div className="h-4 w-px bg-borderL/50 dark:bg-borderD/50" />
          <ThemeToggleBtn />
        </div>

        <div className="hidden h-6 w-px bg-borderL/40 dark:bg-borderD/40 sm:block" />
        <AppVersionBadge />
      </div>
    </header>
  );
};

export default Header;