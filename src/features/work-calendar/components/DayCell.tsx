import React from 'react';

import type { Holiday } from '../types';
import { HolidayType } from '../types';

interface DayCellProps {
    date: string; // "YYYY-MM-DD" (میلادی)
    holiday: Holiday | undefined; // اطلاعات تعطیلی اگر وجود داشته باشد
    isEditing: boolean; // آیا در حالت ویرایش هستیم؟
    onClick: (date: string, currentHoliday?: Holiday) => void;
    className?: string; // --- اصلاحیه: پراپ className برای دریافت سایز از والد ---
}

/**
 * کامپوننت کوچک و بهینه برای نمایش یک روز در گرید.
 */
export const DayCell: React.FC<DayCellProps> = React.memo(({
    date,
    holiday,
    isEditing,
    onClick,
    className = "w-7 h-7" // --- اصلاحیه: سایز پیش‌فرض (بزرگتر شده) ---
}) => {

    // --- اصلاحیه: استفاده از متغیرهای رنگی CSS ---
    const getCellStyle = (): string => {
        if (!holiday) {
            // روز عادی: فقط یک بوردر
            return 'bg-backgroundL-500 border border-borderL dark:bg-backgroundD dark:border-borderD'; 
        }

        switch (holiday.type) {
            case HolidayType.OFFICIAL:
                // رسمی: استفاده از متغیر destructiveL (قرمز)
                return 'bg-destructiveL text-white dark:bg-destructiveD dark:text-destructiveD-foreground'; 
            case HolidayType.AGREEMENT:
                // توافقی: استفاده از رنگ زرد (چون توکن معنایی نداشتیم)
                return 'bg-yellow-400 text-black dark:bg-yellow-500'; 
            default:
                // روز عادی (ناشناخته)
                return 'bg-backgroundL-500 border border-borderL dark:bg-backgroundD dark:border-borderD';
        }
    };
    // --- پایان اصلاحیه ---

    const handleClick = () => {
        if (isEditing) {
            onClick(date, holiday);
        }
    };

    // --- اصلاحیه: افزودن کلاس‌های dark: برای حالت ویرایش و متغیر blue ---
    const editClasses = isEditing
        ? 'cursor-pointer hover:ring-2 hover:ring-blue dark:hover:ring-blue hover:ring-offset-1 dark:hover:ring-offset-backgroundD'
        : '';

    return (
        <div
            // --- اصلاحیه: استفاده از className دریافتی به جای سایز ثابت ---
            className={`${className} rounded-sm transition-all ${getCellStyle()} ${editClasses}`}
            onClick={handleClick}
            title={holiday ? `${holiday.name} (${holiday.date})` : date} 
        />
    );
});

