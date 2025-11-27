import React from 'react';
import type { Holiday } from '../types';
import { HolidayType } from '../types';
import { toPersianDigits } from '../utils/numberUtils';

interface DayCellProps {
    date: string;
    holiday: Holiday | undefined;
    isEditing: boolean;
    onClick: (date: string, currentHoliday?: Holiday) => void;
    className?: string;
    weekDayShort: string | null;
    dayNumber: number; // پراپرتی جدید برای نمایش عدد روز
}

export const DayCell: React.FC<DayCellProps> = React.memo(({
    date,
    holiday,
    isEditing,
    onClick,
    className = "w-8 h-8", // کمی بزرگتر برای تاچ بهتر در موبایل
    weekDayShort,
    dayNumber
}) => {

    const getCellStyle = (): string => {
        // بیس استایل برای همه سلول‌ها
        const base = "transition-all duration-200 ease-in-out transform";

        if (!holiday) {
            return `${base} bg-backgroundL-500 border border-borderL/60 dark:bg-backgroundD dark:border-borderD hover:bg-secondaryL/50 dark:hover:bg-secondaryD/50`;
        }

        switch (holiday.type) {
            case HolidayType.OFFICIAL:
                return `${base} bg-rose-500 text-white border-rose-600 shadow-sm scale-105 z-10`; // رنگ جذاب‌تر برای تعطیلی
            case HolidayType.AGREEMENT:
                return `${base} bg-amber-400 text-amber-950 border-amber-500 shadow-sm`;
            default:
                return `${base} bg-backgroundL-500 border border-borderL dark:bg-backgroundD dark:border-borderD`;
        }
    };

    const handleClick = () => {
        if (isEditing) {
            onClick(date, holiday);
        }
    };

    // کلاس‌های تعاملی
    const interactionClasses = isEditing
        ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:z-20'
        : 'cursor-default';

    return (
        <div
            className={`
                ${className} 
                ${getCellStyle()} 
                ${interactionClasses} 
                rounded-md flex flex-col items-center justify-center 
                select-none relative group
            `}
            onClick={handleClick}
        >
            {/* نمایش حرف روز هفته (فقط اگر وجود داشته باشد) */}
            {weekDayShort && (
                <span className={`text-[9px] leading-none mb-0.5 opacity-70 dark:text-backgroundL-500 ${holiday ? 'font-medium' : ''}`}>
                    {weekDayShort}
                </span>
            )}

            {/* نمایش عدد روز به فارسی */}
            <span className={`text-xs font-bold leading-none dark:text-backgroundL-500`}>
                {toPersianDigits(dayNumber)}
            </span>

            {/* تولتیپ ساده برای نمایش نام تعطیلی در هاور */}
            {holiday && (
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                    {holiday.name}
                </div>
            )}
        </div>
    );
});