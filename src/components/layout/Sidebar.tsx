// src/components/layout/Sidebar.tsx

import { NavLink } from "react-router-dom";
import { LogOut, SquaresExclude } from "lucide-react";
import { mainNavItems, type NavItem } from "@/constants/navigation";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";

const SidebarNavItem = ({ item }: { item: NavItem }) => {
  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-transform  duration-200 ease-in-out ${isActive
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
  // ✅ اعمال پس‌زمینه و بوردر با کلاس‌های صحیح
  <div className="flex h-full flex-col justify-between border-e border-borderL bg-backgroundL-500 transition-colors duration-300 dark:border-borderD dark:bg-backgroundD">
    <div className="px-4">
      <ul className="mt-6 space-y-1">
        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">
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

    <div className="border-t border-borderL dark:border-borderD">
      <div className="flex items-center justify-between gap-2 p-4 hover:bg-secondaryL/50 dark:hover:bg-secondaryD/50">
        <div className="flex items-center gap-2">
          <img
            alt="پروفایل کاربر"
            src="/img/avatars/2.png"
            className="size-10 rounded-full object-cover"
          />
          <div>
            <p className="text-xs">
              <strong className="block font-medium text-foregroundL dark:text-foregroundD">
                مهدی بیاتی
              </strong>
              <span className="text-muted-foregroundL dark:text-muted-foregroundD">
                m.bayati@example.com
              </span>
            </p>
          </div>
        </div>
        <button
          className="text-muted-foregroundL transition-colors hover:text-destructiveL dark:text-muted-foregroundD dark:hover:text-destructiveD"
          title="خروج"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </div>
);

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <SidebarContent />
    </aside>
  );
};