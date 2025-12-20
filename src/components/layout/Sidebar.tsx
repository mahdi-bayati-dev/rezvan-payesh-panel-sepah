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
 * تبدیل اعداد به فارسی برای نمایش در بج‌ها
 */
const toPersianDigits = (num: number | string): string => {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persian[parseInt(digit, 10)]);
};

interface SidebarNavItemProps {
  item: NavItem;
  badgeCount?: number;
}

const SidebarNavItem = ({ item, badgeCount }: SidebarNavItemProps) => {
  const hasRoleAccess = usePermission(item.allowedRoles);
  const licenseStatus = useAppSelector(selectLicenseStatus);
  const isLocked = useAppSelector(selectIsLicenseLocked);
  const user = useAppSelector(selectUser);
  const authStatus = useAppSelector(selectAuthCheckStatus);

  if (authStatus === 'loading' || authStatus === 'idle') return null;

  // مدیریت آیتم لایسنس
  if (item.href === '/license') {
    if (licenseStatus === 'trial') return null;
    if (isLocked || hasRoleAccess) {
      return <RenderLink item={item} badgeCount={badgeCount} />;
    }
    return null;
  }

  if (isLocked || !hasRoleAccess) return null;
  if (item.requiresEmployee && !user?.employee) return null;

  return <RenderLink item={item} badgeCount={badgeCount} />;
};

const RenderLink = ({ item, badgeCount }: SidebarNavItemProps) => {
  const displayCount = badgeCount ? toPersianDigits(badgeCount) : undefined;
  const badgeText = badgeCount && badgeCount > 99 ? toPersianDigits(99) + '+' : displayCount;

  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out relative group ${isActive
            ? "bg-secondaryL text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD "
            : "text-muted-foregroundL hover:bg-secondaryL hover:text-secondary-foregroundL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD hover:scale-[1.02]"
          }`
        }
      >
        {/* فیکس کردن عرض آیکون برای پایداری بصری */}
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {item.icon}
        </span>

        {/* ✅ استفاده از truncate برای جلوگیری از رشد عرضی سایدبار */}
        <span className="flex-1 truncate overflow-hidden whitespace-nowrap">
          {item.label}
        </span>

        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse ml-auto">
            {badgeText}
          </span>
        )}
      </NavLink>
    </li>
  );
}

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
    // h-full و w-full باعث می‌شود محتوا دقیقا اندازه والد (w-64) شود
    <div className="flex h-full w-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD overflow-hidden">
      <div className="px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <ul className="space-y-1">
          <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD px-4 mb-2 block font-bold">
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

      <div className="flex-shrink-0">
        <UserProfile />
        <div className="py-3 text-center border-t border-borderL dark:border-borderD bg-secondaryL/30 dark:bg-secondaryD/10">
          <p className="text-[10px] font-medium text-muted-foregroundL dark:text-muted-foregroundD opacity-80">
            توسعه داده شده توسط{" "}
            <a
              href="https://kr-rezvan.ir/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primaryL dark:text-primaryD font-bold hover:underline"
            >
              رضوان پرداز
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    // ✅ اصلاح شد: تغییر w-60 به w-64 برای هماهنگی با اسکلتون و موبایل
    <aside className="hidden md:flex md:flex-shrink-0 md:w-64">
      <SidebarContent />
    </aside>
  );
};