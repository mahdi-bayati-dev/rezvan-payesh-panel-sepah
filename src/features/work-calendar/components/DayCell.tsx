import React from 'react';

// ایمپورت کردن تایپ‌ها
import type { Holiday } from '../types';
import { HolidayType } from '../types';

interface DayCellProps {
    date: string; // "YYYY-MM-DD" (میلادی)
    holiday: Holiday | undefined; // اطلاعات تعطیلی اگر وجود داشته باشد
    isEditing: boolean; // آیا در حالت ویرایش هستیم؟
    onClick: (date: string, currentHoliday?: Holiday) => void;
    className?: string;
    weekDayShort: string | null; // پراپرتی جدید برای حرف روز هفته (مثلاً "ش")
}

/**
 * کامپوننت کوچک و بهینه برای نمایش یک روز در گرید.
 */
export const DayCell: React.FC<DayCellProps> = React.memo(({
    date,
    holiday,
    isEditing,
    onClick,
    className = "w-7 h-7",
    weekDayShort // دریافت پراپرتی
}) => {

    // تابع برای تعیین استایل سلول بر اساس تعطیل بودن یا نبودن
    const getCellStyle = (): string => {
        if (!holiday) {
            // روز عادی: (استایل پیش‌فرض با بوردر)
            return 'bg-backgroundL-500 border border-borderL dark:bg-backgroundD dark:border-borderD';
        }

        // بررسی نوع تعطیلی
        switch (holiday.type) {
            case HolidayType.OFFICIAL:
                // تعطیل رسمی (قرمز)
                // متن سفید برای کنتراست بهتر
                return 'bg-destructiveL text-white dark:bg-destructiveD dark:text-destructiveD-foreground';
            case HolidayType.AGREEMENT:
                // تعطیل توافقی (زرد)
                // متن سیاه برای کنتراست بهتر
                return 'bg-yellow-400 text-black dark:bg-yellow-500';
            default:
                // حالت ناشناخته (استایل روز عادی)
                return 'bg-backgroundL-500 border border-borderL dark:bg-backgroundD dark:border-borderD';
        }
    };

    // هندلر کلیک (فقط در حالت ویرایش فعال است)
    const handleClick = () => {
        if (isEditing) {
            onClick(date, holiday);
        }
    };

    // کلاس‌های مربوط به حالت ویرایش (افکت هاور)
    const editClasses = isEditing
        ? 'cursor-pointer hover:ring-2 hover:ring-blue dark:hover:ring-blue hover:ring-offset-1 dark:hover:ring-offset-backgroundD'
        : '';

    return (
        <div
            // اعمال کلاس‌های دریافتی، استایل تعطیلی، افکت ویرایش و چیدمان (flex)
            className={`${className} rounded-sm transition-all ${getCellStyle()} ${editClasses} flex items-center justify-center text-xs font-bold`}
            onClick={handleClick}
            title={holiday ? `${holiday.name} (${holiday.date})` : date}
        >
            {/* نمایش حرف روز هفته در مرکز سلول */}
            {weekDayShort}
        </div>
    );
});