// src/features/dashboard/components/StatCard.tsx
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  // این دو پراپ را اختیاری کردیم تا بتوانیم لینک را مخفی کنیم
  linkText?: string;
  onLinkClick?: () => void;
}

const StatCard = ({
  title,
  value,
  linkText,
  onLinkClick,
  icon,
}: StatCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-borderL bg-backgroundL-500 p-4 transition-colors dark:border-borderD dark:bg-secondaryD hover:shadow-md duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondaryL/50 dark:bg-backgroundD/30">
            {icon}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foregroundL dark:text-muted-foregroundD">
            {title}
          </h3>
        </div>

        {/* رندر شرطی: دکمه فقط زمانی نمایش داده می‌شود که متن لینک و تابع کلیک موجود باشند */}
        {linkText && onLinkClick && (
          <button
            onClick={onLinkClick}
            className="text-[10px] sm:text-xs font-medium text-primaryL dark:text-primaryD hover:underline decoration-primaryL/30 underline-offset-4 transition-all"
          >
            {linkText}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-2xl sm:text-3xl font-bold text-foregroundL dark:text-foregroundD tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;