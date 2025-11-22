import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresExclude } from 'lucide-react';
import { mainNavItems, type NavItem } from '@/constants/navigation';
import { ThemeToggleBtn } from '@/components/ui/ThemeToggleBtn';
import { UserProfile } from './UserProfile';
import { usePermission } from '@/hook/usePermission';

// هوک‌های ریداکس
import { useAppSelector, useAppDispatch } from '@/hook/reduxHooks';
import { fetchLicenseStatus, selectLicenseStatus } from '@/store/slices/licenseSlice';

import { usePendingRequestsCount } from '@/features/requests/hook/usePendingRequestsCount';
import { useLeaveRequestSocket } from '@/features/requests/hook/useLeaveRequestSocket';

interface SidebarNavItemProps {
  item: NavItem;
  badgeCount?: number;
}

const SidebarNavItem = ({ item, badgeCount }: SidebarNavItemProps) => {
  // ۱. بررسی دسترسی بر اساس نقش (Role)
  const hasRoleAccess = usePermission(item.allowedRoles);

  // ۲. دریافت وضعیت لایسنس از ریداکس
  const licenseStatus = useAppSelector(selectLicenseStatus);

  // اگر دسترسی نقش ندارد، کلاً رندر نشود
  if (!hasRoleAccess) return null;

  // ۳. [منطق مهم]: مخفی کردن منوی لایسنس در حالت تریال
  // اگر آیتم جاری مربوط به لایسنس است (با href چک می‌کنیم)
  if (item.href === '/license') {
    // فقط در صورتی نمایش بده که وضعیت 'licensed' باشد
    // نکته: اگر وضعیت هنوز لود نشده (undefined) یا trial است، نشان نده.
    if (licenseStatus !== 'licensed') {
      return null;
    }
  }

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
            {badgeCount > 99 ? '+99' : badgeCount}
          </span>
        )}
      </NavLink>
    </li>
  );
};

export const SidebarContent = () => {
  const dispatch = useAppDispatch();

  // فعال‌سازی سوکت
  useLeaveRequestSocket();
  const { data: pendingCount = 0 } = usePendingRequestsCount();

  // ۴. [مهم] فچ کردن وضعیت لایسنس در هنگام لود شدن سایدبار
  // این تضمین می‌کند که به محض ورود به برنامه، سیستم متوجه وضعیت لایسنس بشود
  // حتی اگر کاربر هنوز وارد صفحه لایسنس نشده باشد.
  useEffect(() => {
    dispatch(fetchLicenseStatus());
  }, [dispatch]);

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
        <div className="mt-6 flex items-center justify-between border-t border-borderL pt-4 dark:border-borderD">
          <span className="flex items-center gap-2 text-sm font-medium text-foregroundL dark:text-foregroundD">
            <SquaresExclude size={20} />
            تم صفحه:
          </span>
          <ThemeToggleBtn />
        </div>
      </div>
      <UserProfile />
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