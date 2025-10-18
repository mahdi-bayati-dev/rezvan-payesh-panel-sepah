// src/features/dashboard/components/StatCard.tsx
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  linkText: string;
  onLinkClick: () => void;
  icon: ReactNode;
}

const StatCard = ({
  title,
  value,
  linkText,
  onLinkClick,
  icon,
}: StatCardProps) => {
  return (
    // کامنت: کانتینر اصلی کارت با gap برای ایجاد فاصله بین بخش‌ها
    <div className="flex flex-col gap-4 rounded-2xl border border-borderL bg-backgroundL-500 p-2 transition-colors dark:border-borderD dark:bg-secondaryD">
      <div className=" flex justify-between">
        {/* بخش ۱: هدر کارت - شامل عنوان و  ایکون  */}
        <div className="flex items-center gap-1">
          {/* کامنت: آیکون در اینجا نمایش داده می‌شود */}
          <div className="rounded-lg ">
            {icon}
          </div>
          {/* کامنت: عنوان کارت */}
          <h3 className="text-sm font-semibold text-muted-foregroundL dark:text-muted-foregroundD">
            {title}
          </h3>


        </div>
        <div>
          {/* کامنت: دکمه/لینک اقدام */}
          <button
            onClick={onLinkClick}
            className="cursor-pointer self-start text-xs font-light text-primaryLhover:opacity-80 dark:text-primaryD hover:scale-105 hover:bg-primaryD p-1 rounded-2xl dark:hover:text-blue transition-all  text-blue "
          >
            {linkText}
          </button>
        </div>

      </div>


      {/* بخش ۲: محتوای اصلی کارت -  مقدار */}
      <div className="flex items-center justify-center gap-x-1">


        {/* کامنت: مقدار اصلی و بزرگ کارت */}
        <p className="text-2xl font-bold text-foregroundL dark:text-foregroundD">
          {value}
        </p>
      </div>

    </div>
  );
};

export default StatCard;