// src/components/layout/Header.tsx

import { Menu} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    // ✅ کلاس‌ها با متغیرهای CSS هماهنگ شدند
    <header className="flex items-center justify-between px-4 z-10 bg-backgroundL border-b border-borderL shadow-sm transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-full text-muted-foregroundL hover:bg-secondaryL focus:outline-none focus:ring-2 focus:ring-primaryL dark:text-muted-foregroundD dark:hover:bg-secondaryD dark:focus:ring-primaryD"
          aria-label="باز کردن منو"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <img
            className="max-w-20 max-h-16"
            src="./img/img-header/logo-1.png"
            alt=""
          />
          <h1 className="hidden md:block text-lg font-bold text-primaryL dark:text-primaryD">
            رضـــوان پایش
          </h1>
        </div>
        <span className="rounded-full font-bold bg-secondaryL px-2.5 py-0.5 text-sm whitespace-nowrap text-secondary-foregroundL md:mr-5 dark:bg-secondaryD dark:text-secondary-foregroundD">
          ادمین سطح یک
        </span>
      </div>

      
    </header>
  );
};