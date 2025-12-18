import React, { useMemo } from 'react';
import moment from 'jalali-moment';
import { useGetHolidays, useCreateHoliday, useDeleteHoliday } from '../hooks/useWorkCalendar';
import { DayCell } from './DayCell';
import type { Holiday, HolidayMap } from '../types/index';
import { HolidayType } from '../types/index';
import type { ActiveTool } from '../types/index';
import { generateJalaliYearGrid } from '../utils/calendarUtils';
import { toPersianDigits } from '../utils/numberUtils';

interface WorkCalendarGridProps {
    jalaliYear: number;
    isEditing: boolean;
    activeTool: ActiveTool;
    holidayMap?: HolidayMap;
    isLoading?: boolean;
}

const CELL_SIZE = "min-w-[2.2rem] h-9";
const CELL_GAP = "gap-1";
const MONTH_NAME_WIDTH = "w-24 md:w-28";

/**
 * بخش راهنمای پایین تقویم برای درک رنگ‌ها
 */
const CalendarLegend = () => (
    <div className="mt-8 pt-6 border-t border-borderL dark:border-borderD flex flex-wrap gap-6 text-[11px] font-bold">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructiveL dark:bg-destructiveD"></div>
            <span className="text-foregroundL dark:text-foregroundD">تعطیل رسمی</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warningL-background dark:bg-warningD-background border border-warningL-foreground/30"></div>
            <span className="text-foregroundL dark:text-foregroundD">تعطیل توافقی</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructiveL-background dark:bg-destructiveD-background border border-destructiveL-foreground/20"></div>
            <span className="text-foregroundL dark:text-foregroundD">جمعه (آخر هفته)</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-infoL-foreground dark:border-infoD-foreground"></div>
            <span className="text-foregroundL dark:text-foregroundD">امروز</span>
        </div>
    </div>
);

export const WorkCalendarGrid: React.FC<WorkCalendarGridProps> = ({
    jalaliYear,
    isEditing,
    activeTool,
    holidayMap: externalHolidayMap,
    isLoading: externalLoading
}) => {
    const todayStr = useMemo(() => moment().format("YYYY-MM-DD"), []);
    const yearGrid = useMemo(() => generateJalaliYearGrid(jalaliYear), [jalaliYear]);
    const { data: internalHolidayMap, isLoading: internalLoading } = useGetHolidays(jalaliYear);

    const holidayMap = externalHolidayMap || internalHolidayMap;
    const isLoading = externalLoading ?? internalLoading;

    const createHolidayMutation = useCreateHoliday();
    const deleteHolidayMutation = useDeleteHoliday();

    const handleDayClick = (gregorianDate: string | null, currentHoliday?: Holiday) => {
        if (!gregorianDate || !isEditing) return;

        if (activeTool === 'remove' || (currentHoliday && currentHoliday.type === activeTool)) {
            if (currentHoliday) deleteHolidayMutation.mutate(currentHoliday.date);
        } else {
            const isOfficial = activeTool === HolidayType.OFFICIAL;
            if (currentHoliday) deleteHolidayMutation.mutate(currentHoliday.date);
            createHolidayMutation.mutate({
                date: gregorianDate,
                name: isOfficial ? "تعطیلی رسمی" : "تعطیلی توافقی",
                is_official: isOfficial
            });
        }
    };

    return (
        <div className="w-full bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm border border-borderL dark:border-borderD overflow-hidden">
            <div className="overflow-x-auto pb-4 custom-scrollbar" style={{ direction: 'rtl' }}>
                <div className="min-w-max p-6 mx-auto w-fit">
                    {/* هدر شماره روزها */}
                    <div className="flex items-center mb-4 sticky top-0 bg-backgroundL-500 dark:bg-backgroundD z-10 py-2 border-b border-borderL/30 dark:border-borderD/30">
                        <div className={`${MONTH_NAME_WIDTH} shrink-0`} />
                        <div className={`flex items-center ${CELL_GAP} px-1`}>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                                <div key={dayNum} className={`${CELL_SIZE} flex items-center justify-center text-[10px] font-bold text-muted-foregroundL dark:text-muted-foregroundD`}>
                                    {toPersianDigits(dayNum)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-96 flex items-center justify-center text-infoL-foreground dark:text-infoD-foreground animate-pulse font-bold">در حال دریافت اطلاعات...</div>
                    ) : (
                        <div className="space-y-2">
                            {yearGrid.map(month => (
                                <div key={month.name} className="flex items-center group hover:bg-secondaryL dark:hover:bg-secondaryD/20 rounded-lg transition-colors">
                                    <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm font-black text-foregroundL dark:text-foregroundD pr-2`}>
                                        {month.name}
                                    </span>
                                    <div className={`flex ${CELL_GAP} px-1`}>
                                        {month.days.map((day) => (
                                            day.date ? (
                                                <DayCell
                                                    key={day.key}
                                                    className={CELL_SIZE}
                                                    date={day.gregorianDate!}
                                                    holiday={holidayMap?.[day.gregorianDate!]}
                                                    isEditing={isEditing}
                                                    isToday={day.gregorianDate === todayStr}
                                                    onClick={() => handleDayClick(day.gregorianDate, holidayMap?.[day.gregorianDate!])}
                                                    weekDayShort={day.weekDayShort}
                                                    dayNumber={day.dayOfMonth}
                                                />
                                            ) : (
                                                <div key={day.key} className={`${CELL_SIZE} bg-borderL/10 dark:bg-borderD/10 rounded-md opacity-20`} />
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* راهنمای تقویم */}
                    <CalendarLegend />
                </div>
            </div>
        </div>
    );
};