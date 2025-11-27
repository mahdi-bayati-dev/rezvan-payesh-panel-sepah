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

const CELL_SIZE = "min-w-[2rem] h-8"; // min-w برای جلوگیری از جمع شدن در موبایل
const CELL_GAP = "gap-1";
const MONTH_NAME_WIDTH = "w-20 md:w-24";

// هدر اعداد ۱ تا ۳۱
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

// کامپوننت لودینگ (Skeleton)
const GridSkeleton = () => (
    <div className="animate-pulse space-y-2">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 rtl:space-x-reverse">
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
        ))}
    </div>
);

export const WorkCalendarGrid: React.FC<WorkCalendarGridProps> = ({
    jalaliYear,
    isEditing,
    activeTool
}) => {
    const yearGrid = useMemo(() => generateJalaliYearGrid(jalaliYear), [jalaliYear]);
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

    if (isLoading) return <GridSkeleton />;

    return (
        <div className="bg-backgroundL-500 rounded-xl shadow-sm border border-borderL dark:bg-backgroundD dark:border-borderD overflow-hidden">
            {/* کانتینر اسکرول‌بار کاستوم */}
            <div className="overflow-x-auto pb-4 custom-scrollbar" style={{ direction: 'rtl' }}>
                <div className="min-w-max p-2 ltr">

                    {/* هدر */}
                    <DayHeader />

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
                                            // سلول خالی با استایل ملایم
                                            return (
                                                <div key={day.key} className={`${CELL_SIZE} bg-gray-50/50 dark:bg-white/5 rounded-md`} />
                                            );
                                        }
                                    })}
                                </div>
                                {/* نام ماه - چسبیده به سمت راست (در نمای LTR میشه چپ، ولی چون فلکس Reverse داریم هندل میشه) */}
                                <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm font-bold text-foregroundL/80 dark:text-foregroundD/80 pl-2 text-right`}>
                                    {month.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* راهنما برای موبایل که اسکرول کنند */}
            <div className="md:hidden text-center text-[10px] text-muted-foregroundL/60 py-1 bg-secondaryL/20">
                برای مشاهده روزهای بیشتر به چپ و راست اسکرول کنید
            </div>
        </div>
    );
};