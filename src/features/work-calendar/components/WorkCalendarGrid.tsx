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

// --- ثابت‌های ابعادی برای هماهنگی دقیق اسکلتون و محتوا ---
const CELL_SIZE = "min-w-[2rem] h-8"; // عرض و ارتفاع ثابت سلول‌ها
const CELL_GAP = "gap-1";
const MONTH_NAME_WIDTH = "w-20 md:w-24";

// --- کامپوننت هدر (شماره روزها) ---
// چون این بخش وابسته به دیتا نیست، همیشه نمایش داده می‌شود
const DayHeader = React.memo(() => {
    return (
        <div className="flex items-center mb-3" style={{ direction: 'rtl' }}>
            {/* فضای خالی برای تراز شدن با نام ماه */}
            <div className={`${MONTH_NAME_WIDTH} shrink-0`} />

            <div className={`flex flex-row ${CELL_GAP} px-1`}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                    <div
                        key={dayNum}
                        className={`${CELL_SIZE} flex items-center justify-center text-xs text-muted-foregroundL/50 dark:text-muted-foregroundD/50`}
                    >
                        {toPersianDigits(dayNum)}
                    </div>
                ))}
            </div>
        </div>
    );
});

// --- کامپوننت اسکلتون دقیق (Skeleton) ---
// این کامپوننت دقیقاً جایگزین ردیف‌های ماه می‌شود
const CalendarSkeleton = () => {
    // آرایه‌هایی برای تولید ۱۲ ماه و ۳۱ روز فیک
    const months = Array.from({ length: 12 });
    const days = Array.from({ length: 31 });

    return (
        <div className="space-y-1.5" style={{ direction: 'ltr' }}>
            {months.map((_, mIndex) => (
                <div key={`skeleton-month-${mIndex}`} className="flex items-center animate-pulse">
                    
                    {/* ردیف روزهای اسکلتون - دقیقاً مشابه ساختار اصلی */}
                    {/* از flex-row-reverse استفاده می‌کنیم تا ترتیب چیدمان با حالت واقعی یکی باشد */}
                    <div className={`flex flex-row-reverse ${CELL_GAP} px-1`}>
                        {days.map((_, dIndex) => (
                            <div 
                                key={`skeleton-day-${dIndex}`} 
                                className={`${CELL_SIZE} rounded-md bg-secondaryL/30 dark:bg-secondaryD/20 border border-transparent`}
                            />
                        ))}
                    </div>

                    {/* نام ماه اسکلتون */}
                    <div className={`${MONTH_NAME_WIDTH} shrink-0 pl-2 text-right flex justify-end`}>
                        {/* یک باکس خاکستری به جای متن نام ماه */}
                        <div className="h-5 w-14 bg-secondaryL/40 dark:bg-secondaryD/30 rounded-md" />
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
    // محاسبه گرید سال (این عملیات سریع و همزمان است)
    const yearGrid = useMemo(() => generateJalaliYearGrid(jalaliYear), [jalaliYear]);
    
    // دریافت دیتا از API (این بخش ناهمگام است)
    const { data: holidayMap, isLoading } = useGetHolidays(jalaliYear);
    
    const createHolidayMutation = useCreateHoliday();
    const deleteHolidayMutation = useDeleteHoliday();

    const handleDayClick = (gregorianDate: string | null, jalaliDate: string | null, currentHoliday?: Holiday) => {
        if (!jalaliDate || !gregorianDate) return;

        const isOfficial = (activeTool === HolidayType.OFFICIAL);
        const toolName = (activeTool === HolidayType.OFFICIAL) ? "تعطیلی رسمی" : "تعطیلی توافقی";

        if (activeTool === 'remove' || currentHoliday?.type === activeTool) {
            if (currentHoliday) deleteHolidayMutation.mutate(gregorianDate);
        }
        else {
            if (currentHoliday) deleteHolidayMutation.mutate(gregorianDate);
            createHolidayMutation.mutate({
                date: gregorianDate,
                name: toolName,
                is_official: isOfficial
            });
        }
    };

    // نکته مهم: دیگر کل کامپوننت را با Loading جایگزین نمی‌کنیم.
    // کانتینر اصلی همیشه رندر می‌شود تا پرش لایوت نداشته باشیم.

    return (
        <div className="bg-backgroundL-500 rounded-xl shadow-sm border border-borderL dark:bg-backgroundD dark:border-borderD overflow-hidden">
            {/* کانتینر اسکرول‌بار کاستوم */}
            <div className="overflow-x-auto pb-4 custom-scrollbar" style={{ direction: 'rtl' }}>
                <div className="min-w-max p-2 ltr">

                    {/* هدر همیشه نمایش داده می‌شود */}
                    <DayHeader />

                    {isLoading ? (
                        /* نمایش اسکلتون دقیق در زمان لودینگ */
                        <CalendarSkeleton />
                    ) : (
                        /* نمایش محتوای اصلی پس از لود */
                        <div className="space-y-1.5" style={{ direction: 'ltr' }}>
                            {yearGrid.map(month => (
                                <div key={month.name} className="flex items-center group">

                                    {/* ردیف روزها */}
                                    <div className={`flex flex-row-reverse ${CELL_GAP} px-1`}>
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
                                                        onClick={() => handleDayClick(day.gregorianDate, day.date, holiday)}
                                                        weekDayShort={day.weekDayShort}
                                                        dayNumber={day.dayOfMonth}
                                                    />
                                                );
                                            } else {
                                                // سلول خالی (Padding) انتهای ماه
                                                return (
                                                    <div key={day.key} className={`${CELL_SIZE} bg-gray-50/50 dark:bg-white/5 rounded-md`} />
                                                );
                                            }
                                        })}
                                    </div>
                                    
                                    {/* نام ماه */}
                                    <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm font-bold text-foregroundL/80 dark:text-foregroundD/80 pl-2 text-right`}>
                                        {month.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* راهنما برای موبایل */}
            <div className="md:hidden text-center text-[10px] text-muted-foregroundL/60 py-1 bg-secondaryL/20">
                برای مشاهده روزهای بیشتر به چپ و راست اسکرول کنید
            </div>
        </div>
    );
};