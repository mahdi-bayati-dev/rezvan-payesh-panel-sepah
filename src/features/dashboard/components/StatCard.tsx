// src/features/dashboard/components/StatCard.tsx
import type { ReactNode } from "react";
import { toPersianDigits } from "@/features/dashboard/api/dashboardApi"; // ایمپورت تابع تبدیل عدد

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  linkText?: string;
  onLinkClick?: () => void;
  variant?: 'success' | 'warning' | 'danger' | 'info'; // اضافه کردن این پراپ برای استایل‌دهی هوشمندتر (اختیاری)
}

const StatCard = ({
  title,
  value,
  linkText,
  onLinkClick,
  icon,
}: StatCardProps) => {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-borderL bg-backgroundL-500 p-5 transition-all duration-300 hover:shadow-lg dark:border-borderD dark:bg-secondaryD hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* آیکون با افکت هاور */}
          <div className="p-2 rounded-xl bg-secondaryL/50 dark:bg-backgroundD/40 transition-colors group-hover:bg-secondaryL dark:group-hover:bg-backgroundD/60">
            {icon}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-muted-foregroundL dark:text-muted-foregroundD opacity-90">
            {title}
          </h3>
        </div>

        {linkText && onLinkClick && (
          <button
            onClick={onLinkClick}
            className="text-[10px] sm:text-xs font-medium text-primaryL dark:text-primaryD hover:underline decoration-primaryL/30 underline-offset-4 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          >
            {linkText}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <p className="text-2xl sm:text-3xl font-black text-foregroundL dark:text-foregroundD tracking-tight font-persian">
          {toPersianDigits(value)}
        </p>
      </div>
    </div>
  );
};

export default StatCard;