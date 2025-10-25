import { NavLink } from 'react-router-dom';
import { SquaresExclude } from 'lucide-react';
import { mainNavItems, type NavItem } from '@/constants/navigation';
import { ThemeToggleBtn } from '@/components/ui/ThemeToggleBtn';
// ۱. ایمپورت کامپوننت جدید UserProfile
import { UserProfile } from './UserProfile';

// کامپوننت SidebarNavItem (بدون تغییر)
const SidebarNavItem = ({ item }: { item: NavItem }) => {
  // ... (کد قبلی شما عالی است) ...
  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-200 ease-in-out ${isActive
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

// کامپوننت SidebarContent (بسیار ساده‌تر شده)
export const SidebarContent = () => (
  <div className="flex h-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD">
    {/* بخش بالایی: منوها و تم */}
    <div className="px-4 py-6"> {/* py-6 برای فاصله از بالا */}
      <ul className="space-y-1">
        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD px-4 mb-2 block"> {/* استایل بهتر برای عنوان منو */}
          منو اصلی
        </span>
        {mainNavItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </ul>
      {/* بخش تم به بالا منتقل شد تا بخش پروفایل در انتها تنها باشد */}
      <div className="mt-6 flex items-center justify-between border-t border-borderL pt-4 dark:border-borderD">
        <span className="flex items-center gap-2 text-sm font-medium text-foregroundL dark:text-foregroundD">
          <SquaresExclude size={20} />
          تم صفحه:
        </span>
        <ThemeToggleBtn />
      </div>
    </div>

    {/* ۲. بخش پایینی: فقط کامپوننت UserProfile */}
    <UserProfile />
  </div>
);

// کامپوننت Sidebar (بدون تغییر)
export const Sidebar = () => {
  return (
    // display: none روی المان والد اعمال می‌شود، پس SidebarContent نیازی به hidden ندارد
    <aside className="hidden md:flex md:flex-shrink-0 md:w-64"> {/* عرض ثابت برای سایدبار */}
      <SidebarContent />
    </aside>
  );
};
