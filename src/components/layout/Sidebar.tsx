import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { mainNavItems, type NavItem } from '@/constants/navigation';
import { UserProfile } from './UserProfile';
import { usePermission } from '@/hook/usePermission';
import { useAppSelector, useAppDispatch } from '@/hook/reduxHooks';
import { fetchLicenseStatus, selectLicenseStatus } from '@/store/slices/licenseSlice';
import { usePendingRequestsCount } from '@/features/requests/hook/usePendingRequestsCount';
import { selectUser, selectIsLicenseLocked, selectAuthCheckStatus } from '@/store/slices/authSlice';

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

  // ۱. اگر هنوز در حال احراز هویت هستیم، هیچ آیتمی رندر نشود (جلوگیری از پرش منو)
  if (authStatus === 'loading' || authStatus === 'idle') return null;

  // --- مدیریت اختصاصی آیتم لایسنس ---
  if (item.href === '/license') {
    // اگر حالت Trial است، تحت هیچ شرایطی نمایش نده
    if (licenseStatus === 'trial') return null;

    // لایسنس فقط زمانی نمایش داده شود که:
    // الف) سیستم قفل شده باشد (برای همه نمایش داده شود تا فعال کنند)
    // ب) یا کاربر ادمین باشد (hasRoleAccess داشته باشد)
    if (isLocked || hasRoleAccess) {
      return <RenderLink item={item} badgeCount={badgeCount} />;
    }
    return null;
  }

  // --- لاجیک استاندارد برای سایر آیتم‌ها ---

  // اگر سیستم به دلیل لایسنس قفل است، بقیه منوها را مخفی کن
  if (isLocked) return null;

  // بررسی دسترسی بر اساس نقش (Roles)
  if (!hasRoleAccess) return null;

  // اگر آیتم نیاز به پروفایل کارمندی دارد و کاربر فاقد آن است، مخفی کن
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
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-200 ease-in-out relative group ${isActive
            ? "bg-secondaryL text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD "
            : "text-muted-foregroundL hover:bg-secondaryL hover:text-secondary-foregroundL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD hover:scale-105 hover:shadow-md"
          }`
        }
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse ml-auto">
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
    <div className="flex h-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD">
      <div className="px-4 py-6">
        <ul className="space-y-1">
          <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD px-4 mb-2 block">
            منو اصلی
          </span>
          {mainNavItems.map((item) => {
            const count = item.href === '/requests' ? pendingCount : undefined;
            return (
              <SidebarNavItem
                key={item.href}
                item={item}
                badgeCount={count}
              />
            );
          })}
        </ul>
      </div>

      <div>
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
    <aside className="hidden md:flex md:flex-shrink-0 md:w-60">
      <SidebarContent />
    </aside>
  );
};