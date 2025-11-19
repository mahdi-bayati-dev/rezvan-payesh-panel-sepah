import { NavLink } from 'react-router-dom';
import { SquaresExclude } from 'lucide-react';
import { mainNavItems, type NavItem } from '@/constants/navigation';
import { ThemeToggleBtn } from '@/components/ui/ThemeToggleBtn';
import { UserProfile } from './UserProfile';
// ایمپورت هوک دسترسی
import { usePermission } from '@/hook/usePermission';

const SidebarNavItem = ({ item }: { item: NavItem }) => {
  // چک کردن دسترسی برای هر آیتم
  const hasAccess = usePermission(item.allowedRoles);

  // اگر دسترسی ندارد، هیچ چیزی رندر نکن (مخفی کردن کامل)
  if (!hasAccess) return null;

  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-200 ease-in-out ${
            isActive
              ? "bg-secondaryL text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD "
              : "text-muted-foregroundL hover:bg-secondaryL hover:text-secondary-foregroundL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:hover:text-secondary-foregroundD hover:scale-105 hover:shadow-md"
          }`
        }
      >
        {item.icon}
        {item.label}
      </NavLink>
    </li>
  );
};

export const SidebarContent = () => (
  <div className="flex h-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD">
    <div className="px-4 py-6">
      <ul className="space-y-1">
        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD px-4 mb-2 block">
          منو اصلی
        </span>
        {mainNavItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
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

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-shrink-0 md:w-60">
      <SidebarContent />
    </aside>
  );
};