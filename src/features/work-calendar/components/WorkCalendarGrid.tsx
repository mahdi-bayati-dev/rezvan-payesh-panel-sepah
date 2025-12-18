import React, { useMemo } from 'react';
import { useGetHolidays, useCreateHoliday, useDeleteHoliday } from '@/features/work-calendar/hooks/useWorkCalendar';
import { DayCell } from '@/features/work-calendar/components/DayCell';
import type { Holiday } from '@/features/work-calendar/types';
import { HolidayType } from '@/features/work-calendar/types';
import type { ActiveTool } from '@/features/work-calendar/types';
import { generateJalaliYearGrid } from '@/features/work-calendar/utils/calendarUtils';
import { toPersianDigits } from '@/features/work-calendar/utils/numberUtils';

interface WorkCalendarGridProps {
    jalaliYear: number;
    isEditing: boolean;
    activeTool: ActiveTool;
}

// --- ثابت‌های ابعادی برای پایداری در تمام مانیتورها ---
const CELL_SIZE = "min-w-[2.2rem] h-9"; // کمی بزرگتر برای خوانایی بهتر
const CELL_GAP = "gap-1";
const MONTH_NAME_WIDTH = "w-24 md:w-28"; // عرض ثابت برای نام ماه جهت تراز شدن ستون‌ها

/**
 * هدر شماره روزها (۱ تا ۳۱)
 * به صورت کاملاً هماهنگ با ردیف‌های ماه طراحی شده است
 */
const DayHeader = React.memo(() => {
    return (
        <div className="flex items-center mb-4 sticky top-0 bg-backgroundL-500 dark:bg-backgroundD z-10 py-2">
            {/* نام ماه (در هدر خالی می‌ماند تا ستون‌ها تراز شوند) */}
            <div className={`${MONTH_NAME_WIDTH} shrink-0`} />

            {/* اعداد روزها */}
            <div className={`flex items-center ${CELL_GAP} px-1`}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                    <div
                        key={dayNum}
                        className={`${CELL_SIZE} flex items-center justify-center text-[10px] font-bold text-muted-foregroundL/40 dark:text-muted-foregroundD/40`}
                    >
                        {toPersianDigits(dayNum)}
                    </div>
                ))}
            </div>
        </div>
    );
});

/**
 * اسکلتون لودینگ مطابق با ساختار جدید تقویم
 */
const CalendarSkeleton = () => {
    const months = Array.from({ length: 12 });
    const days = Array.from({ length: 31 });

    return (
        <div className="space-y-2">
            {months.map((_, mIndex) => (
                <div key={`skeleton-row-${mIndex}`} className="flex items-center animate-pulse">
                    <div className={`${MONTH_NAME_WIDTH} shrink-0 flex justify-start`}>
                        <div className="h-5 w-16 bg-secondaryL/40 dark:bg-secondaryD/30 rounded-md" />
                    </div>
                    <div className={`flex ${CELL_GAP} px-1`}>
                        {days.map((_, dIndex) => (
                            <div
                                key={`skeleton-cell-${dIndex}`}
                                className={`${CELL_SIZE} rounded-md bg-secondaryL/20 dark:bg-secondaryD/10`}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const WorkCalendarGrid: React.FC<WorkCalendarGridProps> = ({
    jalaliYear,
    isEditing,
    activeTool
}) => {
    // تولید گرید تقویم جلالی (فروردین تا اسفند)
    const yearGrid = useMemo(() => generateJalaliYearGrid(jalaliYear), [jalaliYear]);

    // دریافت داده‌های تعطیلات از API
    const { data: holidayMap, isLoading } = useGetHolidays(jalaliYear);

    const createHolidayMutation = useCreateHoliday();
    const deleteHolidayMutation = useDeleteHoliday();

    /**
     * مدیریت کلیک روی هر سلول روز
     */
    const handleDayClick = (gregorianDate: string | null, currentHoliday?: Holiday) => {
        if (!gregorianDate) return;

        const isOfficial = (activeTool === HolidayType.OFFICIAL);
        const toolName = (activeTool === HolidayType.OFFICIAL) ? "تعطیلی رسمی" : "تعطیلی توافقی";

        // اگر ابزار پاک‌کن انتخاب شده یا روی همان نوع تعطیلی کلیک شود، حذف کن
        if (activeTool === 'remove' || currentHoliday?.type === activeTool) {
            if (currentHoliday) deleteHolidayMutation.mutate(gregorianDate);
        }
        else {
            // در غیر این صورت، ابتدا قبلی را پاک و جدید را ثبت کن
            if (currentHoliday) deleteHolidayMutation.mutate(gregorianDate);
            createHolidayMutation.mutate({
                date: gregorianDate,
                name: toolName,
                is_official: isOfficial
            });
        }
    };

    return (
        <div className="w-full bg-backgroundL-500 rounded-2xl shadow-xl border border-borderL dark:bg-backgroundD dark:border-borderD overflow-hidden transition-colors duration-300">
            {/* کانتینر اسکرول: برای موبایل حیاتی است */}
            <div className="overflow-x-auto pb-4 custom-scrollbar" style={{ direction: 'rtl' }}>

                {/* استفاده از w-fit و mx-auto باعث می‌شود تقویم در مانیتورهای بزرگ 
                   در مرکز قرار بگیرد و از هم نپاشد
                */}
                <div className="min-w-max p-6 mx-auto w-fit">

                    <DayHeader />

                    {isLoading ? (
                        <CalendarSkeleton />
                    ) : (
                        <div className="space-y-2">
                            {yearGrid.map(month => (
                                <div key={month.name} className="flex items-center group hover:bg-secondaryL/10 dark:hover:bg-secondaryD/5 rounded-lg transition-colors duration-150">

                                    {/* نام ماه در سمت راست (کاملاً تراز شده) */}
                                    <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm font-extrabold text-foregroundL/80 dark:text-foregroundD/80 pr-2`}>
                                        {month.name}
                                    </span>

                                    {/* ردیف روزها (از ۱ تا ۳۱ به ترتیب RTL) */}
                                    <div className={`flex ${CELL_GAP} px-1`}>
                                        {month.days.map((day) => {
                                            if (day.date !== null && day.gregorianDate) {
                                                const holiday = holidayMap ? holidayMap[day.gregorianDate] : undefined;
                                                return (
                                                    <DayCell
                                                        key={day.key}
                                                        className={CELL_SIZE}
                                                        date={day.gregorianDate}
                                                        holiday={holiday}
                                                        isEditing={isEditing}
                                                        onClick={() => handleDayClick(day.gregorianDate, holiday)}
                                                        weekDayShort={day.weekDayShort}
                                                        dayNumber={day.dayOfMonth}
                                                    />
                                                );
                                            } else {
                                                // سلول‌های خالی برای ماه‌های ۲۹ یا ۳۰ روزه
                                                return (
                                                    <div key={day.key} className={`${CELL_SIZE} bg-gray-50/30 dark:bg-white/5 rounded-md border border-transparent`} />
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* راهنمای تعاملی پایین تقویم */}
            <div className="hidden md:flex justify-between items-center px-6 py-3 bg-secondaryL/10 dark:bg-secondaryD/10 text-[11px] text-muted-foregroundL">
                <span>استفاده از سیستم استاندارد تقویم کاری ایران</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full" /> رسمی</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full" /> توافقی</span>
                </div>
            </div>
        </div>
    );
};

export default WorkCalendarGrid;