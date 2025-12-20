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
 * کامپوننت ارتقایافته سلول روز با انیمیشن اختصاصی برای "امروز"
 * @author Mehdi Bayati Design Pattern
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
        const base = "transition-all duration-300 ease-in-out border relative overflow-hidden";

        // استایل برای روز امروز (Today)
        if (isToday) {
            return `${base} bg-infoL-foreground/10 dark:bg-infoD-foreground/20 border-infoL-foreground dark:border-infoD-foreground z-20 shadow-[0_0_15px_rgba(var(--info-rgb),0.3)]`;
        }

        if (holiday) {
            if (holiday.type === HolidayType.OFFICIAL) {
                const fridayRing = isFriday ? "ring-1 ring-destructiveL dark:ring-destructiveD ring-offset-1" : "";
                return `${base} bg-destructiveL dark:bg-destructiveD text-white dark:text-backgroundD border-transparent font-black ${fridayRing}`;
            }

            if (holiday.type === HolidayType.AGREEMENT) {
                return `${base} bg-warningL-background dark:bg-warningD-background text-warningL-foreground dark:text-warningD-foreground border-warningL-foreground/30 font-bold`;
            }
        }

        if (isFriday) {
            return `${base} bg-destructiveL-background dark:bg-destructiveD-background text-destructiveL-foreground dark:text-destructiveD-foreground border-destructiveL-foreground/10`;
        }

        return `${base} bg-backgroundL-500 dark:bg-backgroundD text-foregroundL/70 dark:text-foregroundD/70 border-borderL dark:border-borderD`;
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes soft-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.15); opacity: 0.1; }
                }
                @keyframes today-dot {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-2px) scale(1.2); }
                }
            `}} />

            <div
                className={`
                    ${className} 
                    ${getCellStyle()} 
                    ${isEditing ? `
                        cursor-pointer 
                        hover:scale-110 
                        hover:z-50 
                        hover:shadow-2xl 
                        hover:ring-2 
                        hover:ring-infoL-foreground/50
                        ${!holiday && !isToday ? 'hover:bg-secondaryL dark:hover:bg-secondaryD' : ''}
                    ` : 'cursor-default'}
                    rounded-xl flex flex-col items-center justify-center select-none group
                `}
                onClick={() => isEditing && onClick(date, holiday)}
            >
                {/* انیمیشن پس‌زمینه برای امروز (Pulse Effect) */}
                {isToday && (
                    <div
                        className="absolute inset-0 rounded-xl bg-infoL-foreground dark:bg-infoD-foreground pointer-events-none"
                        style={{ animation: 'soft-pulse 3s infinite ease-in-out' }}
                    />
                )}

                {/* نام روز هفته (کوتاه) */}
                {weekDayShort && (
                    <span className={`text-[8px] leading-none mb-0.5 transition-all duration-300 ${isToday
                            ? 'text-infoL-foreground dark:text-infoD-foreground font-black'
                            : 'opacity-50 group-hover:opacity-100'
                        }`}>
                        {weekDayShort}
                    </span>
                )}

                {/* شماره روز */}
                <span className={`text-xs leading-none font-bold transition-transform duration-300 group-hover:scale-110 ${isToday ? 'text-infoL-foreground dark:text-infoD-foreground scale-110' : ''
                    }`}>
                    {toPersianDigits(dayNumber)}
                </span>

                {/* نشانگر نقطه‌ای متحرک برای امروز */}
                {isToday && (
                    <div
                        className="absolute bottom-1 w-1 h-1 bg-infoL-foreground dark:bg-infoD-foreground rounded-full"
                        style={{ animation: 'today-dot 2s infinite ease-in-out' }}
                    />
                )}

                {/* افکت درخشش در حالت هاور برای ادیت */}
                {isEditing && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
            </div>
        </>
    );
});