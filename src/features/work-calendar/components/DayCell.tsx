import React from 'react';
import type { Holiday } from '../types/index';
import { HolidayType } from '../types/index';
import { toPersianDigits } from '../utils/numberUtils';

interface DayCellProps {
    date: string;
    holiday: Holiday | undefined;
    isEditing: boolean;
    isToday?: boolean;
    onClick: (date: string, currentHoliday?: Holiday) => void;
    className?: string;
    weekDayShort: string | null;
    dayNumber: number;
}

/**
 * کامپوننت سلول روز با هاور بهبود یافته و حرفه‌ای
 * استفاده انحصاری از متغیرهای oklch تعریف شده در پروژه
 */
export const DayCell: React.FC<DayCellProps> = React.memo(({
    date,
    holiday,
    isEditing,
    isToday,
    onClick,
    className = "w-8 h-8",
    weekDayShort,
    dayNumber
}) => {
    const isFriday = weekDayShort === "ج";

    const getCellStyle = (): string => {
        // انیمیشن‌های نرم‌تر با duration-200
        const base = "transition-all duration-200 ease-out border relative";

        if (holiday) {
            if (holiday.type === HolidayType.OFFICIAL) {
                // تعطیل رسمی
                const fridayRing = isFriday
                    ? "ring-2 ring-destructiveL dark:ring-destructiveD ring-offset-1"
                    : "";
                return `${base} bg-destructiveL dark:bg-destructiveD text-backgroundL-500 dark:text-backgroundD border-transparent font-black ${fridayRing}`;
            }

            if (holiday.type === HolidayType.AGREEMENT) {
                // تعطیل توافقی
                return `${base} bg-warningL-background dark:bg-warningD-background text-warningL-foreground dark:text-warningD-foreground border-warningL-foreground/30 font-bold`;
            }
        }

        if (isFriday) {
            // جمعه عادی
            return `${base} bg-destructiveL-background dark:bg-destructiveD-background text-destructiveL-foreground dark:text-destructiveD-foreground border-destructiveL-foreground/10`;
        }

        // روز عادی کاری
        return `${base} bg-backgroundL-500 dark:bg-backgroundD text-foregroundL/70 dark:text-foregroundD/70 border-borderL dark:border-borderD`;
    };

    return (
        <div
            className={`
                ${className} 
                ${getCellStyle()} 
                ${isEditing ? `
                    cursor-pointer 
                    hover:scale-115 
                    hover:z-50 
                    hover:shadow-xl 
                    hover:ring-2 
                    hover:ring-infoL-foreground 
                    dark:hover:ring-infoD-foreground
                    ${!holiday ? 'hover:bg-secondaryL dark:hover:bg-secondaryD' : ''}
                ` : 'cursor-default'}
                ${isToday ? 'ring-2 ring-infoL-foreground dark:ring-infoD-foreground ring-offset-2 z-20' : ''}
                rounded-lg flex flex-col items-center justify-center select-none group
            `}
            onClick={() => isEditing && onClick(date, holiday)}
        >
            {/* افکت درخشش ملایم در هاور برای روزهای غیرتعطیل */}
            {isEditing && !holiday && (
                <div className="absolute inset-0 rounded-lg bg-infoL-foreground/0 group-hover:bg-infoL-foreground/5 dark:group-hover:bg-infoD-foreground/5 transition-colors pointer-events-none" />
            )}

            {isToday && (
                <span className="absolute inset-0 rounded-lg bg-infoL-foreground dark:bg-infoD-foreground animate-ping opacity-20 pointer-events-none"></span>
            )}

            {weekDayShort && (
                <span className={`text-[7px] leading-none mb-0.5 opacity-60 group-hover:opacity-100 transition-opacity ${isToday ? 'text-infoL-foreground dark:text-infoD-foreground font-bold' : ''}`}>
                    {weekDayShort}
                </span>
            )}

            <span className={`text-xs leading-none font-bold group-hover:scale-110 transition-transform ${isToday ? 'text-infoL-foreground dark:text-infoD-foreground' : ''}`}>
                {toPersianDigits(dayNumber)}
            </span>

            {isToday && (
                <div className="w-1 h-1 bg-infoL-foreground dark:bg-infoD-foreground rounded-full mt-0.5 animate-dot-fade"></div>
            )}
        </div>
    );
});