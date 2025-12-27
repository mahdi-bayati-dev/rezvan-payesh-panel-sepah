import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { mainNavItems, type NavItem } from '@/constants/navigation';
import { UserProfile } from './UserProfile';
import { usePermission } from '@/hook/usePermission';
import { useAppSelector, useAppDispatch } from '@/hook/reduxHooks';
import { fetchLicenseStatus, selectLicenseStatus } from '@/store/slices/licenseSlice';
import { usePendingRequestsCount } from '@/features/requests/hook/usePendingRequestsCount';
import { selectUser, selectIsLicenseLocked, selectAuthCheckStatus } from '@/store/slices/authSlice';

/**
 * تبدیل اعداد به فارسی برای نمایش در بج‌ها و متون
 */
const toPersianDigits = (num: number | string): string => {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persian[parseInt(digit, 10)]);
};

interface SidebarNavItemProps {
  item: NavItem;
  badgeCount?: number;
}

/**
 * کامپوننت مدیریت آیتم‌های سایدبار بر اساس دسترسی و لایسنس
 */
const SidebarNavItem = ({ item, badgeCount }: SidebarNavItemProps) => {
  const hasRoleAccess = usePermission(item.allowedRoles);
  const licenseStatus = useAppSelector(selectLicenseStatus);
  const isLocked = useAppSelector(selectIsLicenseLocked);
  const user = useAppSelector(selectUser);
  const authStatus = useAppSelector(selectAuthCheckStatus);

  // در حالت بارگذاری اولیه سایدبار چیزی نمایش نمی‌دهد
  if (authStatus === 'loading' || authStatus === 'idle') return null;

  // مدیریت نمایش بخش لایسنس
  if (item.href === '/license') {
    if (licenseStatus === 'trial') return null;
    if (isLocked || hasRoleAccess) {
      return <RenderLink item={item} badgeCount={badgeCount} />;
    }
    return null;
  }

  // محدودیت‌های عمومی بر اساس قفل بودن سیستم یا نقش کاربری
  if (isLocked || !hasRoleAccess) return null;
  if (item.requiresEmployee && !user?.employee) return null;

  return <RenderLink item={item} badgeCount={badgeCount} />;
};

/**
 * رندر نهایی لینک‌ها با استفاده از متغیرهای رنگی oklch
 */
const RenderLink = ({ item, badgeCount }: SidebarNavItemProps) => {
  const displayCount = badgeCount ? toPersianDigits(badgeCount) : undefined;
  const badgeText = badgeCount && badgeCount > 99 ? toPersianDigits(99) + '+' : displayCount;

  return (
    <li className="relative z-10 list-none">
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out relative group ${isActive
            ? "bg-primaryL/15 text-primaryL shadow-sm dark:bg-primaryD/20 dark:text-primaryD"
            : "text-muted-foregroundL hover:bg-secondaryL hover:text-secondary-foregroundL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD hover:scale-[1.02]"
          }`
        }
      >
        {/* بخش آیکون */}
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
          {item.icon}
        </span>

        {/* متن منو با قابلیت ترانکیت برای جلوگیری از به‌هم‌ریختگی عرض سایدبار */}
        <span className="flex-1 truncate overflow-hidden whitespace-nowrap">
          {item.label}
        </span>

        {/* بج اطلاع‌رسانی با استفاده از رنگ‌های Destructive تم شما */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold 
            bg-destructiveL-background text-destructiveL-foreground 
            dark:bg-destructiveD-background dark:text-destructiveD-foreground 
            rounded-full shadow-sm animate-pulse ml-auto"
          >
            {badgeText}
          </span>
        )}
      </NavLink>
    </li>
  );
}

/**
 * محتوای داخلی سایدبار شامل لیست منوها و پس‌زمینه
 */
export const SidebarContent = () => {
  const dispatch = useAppDispatch();
  const { data: pendingCount = 0 } = usePendingRequestsCount();
  const licenseStatus = useAppSelector(selectLicenseStatus);
  const authStatus = useAppSelector(selectAuthCheckStatus);

  useEffect(() => {
    if (!licenseStatus && authStatus === 'succeeded') {
      dispatch(fetchLicenseStatus());
    }
  }, [dispatch, licenseStatus, authStatus]);

  return (
    <div className="relative flex h-full w-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD overflow-hidden">

      {/* 🎖️ وکتور پس‌زمینه سرباز - استفاده از رنگ foreground برای هماهنگی با تم */}
      <div className="absolute bottom-12 left-0 w-full opacity-15 dark:opacity-15 pointer-events-none select-none z-0 flex justify-center translate-y-4">
        <svg
          className="fill-foregroundL dark:fill-foregroundD"
          height="800px"
          width="800px"
          viewBox="0 0 511.999 511.999"
        >
          <g>
            <path d="M247.07,323.803l-23.142-14.656c-1.283-0.812-2.449-1.738-3.526-2.735v180.695c0,13.747,11.144,24.891,24.891,24.891s24.891-11.144,24.891-24.891V325.462C262.649,328.848,253.97,328.173,247.07,323.803z" />
            <path d="M301.242,253.872c-7.605,24.33-10.037,32.11-17.674,56.541c-1.177,3.766-3.267,7.159-5.999,9.917v166.777c0,13.747,11.144,24.891,24.891,24.891s24.891-11.144,24.891-24.891c0-7.814,0-217.615,0-229.129L301.242,253.872z" />
            <path d="M234.937,68.481c4.648,17.303,20.435,30.044,39.206,30.044c22.423,0,40.601-18.178,40.601-40.601c0-22.423-18.178-40.601-40.601-40.601c-18.771,0-34.559,12.741-39.207,30.045c-5.745-9.713-18.227-13.076-28.083-7.482l-83.324,47.323c-7.242,4.113-11.321,12.158-10.36,20.43c0.961,8.272,6.775,15.168,14.767,17.511l92.707,26.606v116.811l23.608-37.125c-3.48-6.366-4.969-13.884-3.754-21.605c1.469-9.339,6.603-17.189,13.705-22.319c0.294-3.397,1.388-6.696,3.264-9.66c4.874-7.696,38.366-60.58,42.777-67.546c-8.482,0-66.804,0-75.485,0l-38.185-11.199l40.769-23.155C230.605,74.107,233.157,71.496,234.937,68.481z" />
            <path d="M268.849,248.777c-6.177-0.971-11.699-3.554-16.217-7.242l-25.744,40.483c-3.55,5.606-1.884,13.03,3.722,16.58l23.142,14.656c6.657,4.216,15.536,0.984,17.897-6.566l17.123-54.777L268.849,248.777z" />
            <path d="M394.745,1.411c-4.235-2.683-9.847-1.427-12.533,2.814l-7.297,11.522l-6.714-4.252c-4.236-2.683-9.848-1.425-12.533,2.814c-2.684,4.237-1.424,9.849,2.813,12.533l6.714,4.252l-95.14,150.225c3.048-0.366,6.194-0.333,9.376,0.167l29.884,4.7l0.011-0.036l52.984-83.662c2.684-4.239,1.424-9.849-2.813-12.533c-3.309-2.096-7.443-1.776-10.375,0.468l48.436-76.48C400.243,9.705,398.983,4.094,394.745,1.411z" />
            <path d="M374.073,157.589c-0.06-11.998-4.616-22.96-12.05-31.306l-29.36,46.36l0.087,17.226l0.068,13.491l-55.453-8.722c-11.316-1.78-21.934,5.952-23.714,17.268c-1.78,11.317,5.951,21.934,17.268,23.714l79.541,12.51c12.631,1.988,24.029-7.832,23.966-20.596C374.236,189.806,374.082,159.267,374.073,157.589z" />
          </g>
        </svg>
      </div>

      <div className="px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
        <ul className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foregroundL dark:text-muted-foregroundD px-4 mb-3 block font-bold opacity-70">
            منو اصلی
          </span>
          {mainNavItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              badgeCount={item.href === '/requests' ? pendingCount : undefined}
            />
          ))}
        </ul>
      </div>

      {/* بخش فوتر سایدبار شامل پروفایل و کپی‌رایت */}
      <div className="flex-shrink-0 relative z-10">
        <UserProfile />
        <div className="py-3 text-center border-t border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/5 backdrop-blur-md">
          <p className="text-[10px] font-medium text-muted-foregroundL dark:text-muted-foregroundD opacity-70">
            توسعه داده شده توسط{" "}
            <a
              href="https://kr-rezvan.ir/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primaryL dark:text-primaryD font-bold hover:underline transition-all"
            >
              رضوان پرداز
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * کانتینر اصلی سایدبار برای نمایش در دسکتاپ
 */
export const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-shrink-0 md:w-64">
      <SidebarContent />
    </aside>
  );
};