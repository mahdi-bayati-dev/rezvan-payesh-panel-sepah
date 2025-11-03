import React, { useMemo } from 'react';
import { useGetHolidays, useCreateHoliday, useDeleteHoliday } from '../hooks/useWorkCalendar';
import { DayCell } from './DayCell';
import type { Holiday } from '../types';
import { HolidayType } from '../types';
import type { ActiveTool } from '../types';

import { generateJalaliYearGrid } from '../utils/calendarUtils';

interface WorkCalendarGridProps {
    jalaliYear: number;
    isEditing: boolean;
    activeTool: ActiveTool;
}

// --- اصلاحیه: تعریف متغیرهای سایز برای خوانایی و نگهداری آسان ---
// با تغییر این متغیرها، کل گرید به صورت هماهنگ بزرگ یا کوچک می‌شود.
const CELL_SIZE = "w-6 h-6"; // اندازه جدید سلول‌های روز (قبلاً w-5 h-5)
const HEADER_CELL_SIZE = "w-6 h-6"; // اندازه سلول‌های هدر (قبلاً w-5 h-5)
const CELL_GAP = "gap-1"; // فاصله جدید بین سلول‌ها (قبلاً gap-1)
const MONTH_NAME_WIDTH = "w-24"; // عرض ستون نام ماه (قبلاً w-20)
// --- پایان اصلاحیه ---


const DayHeader = React.memo(() => {
    return (
        <div className="flex items-center mb-2" style={{ direction: 'ltr' }}>
            {/* سلول خالی برای نام ماه (باید با گرید هماهنگ باشد) */}
            {/* <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm`}></span> */}

            {/* گرید هدر روزها */}
            {/* --- اصلاحیه: استفاده از متغیرهای سایز --- */}
            <div className={`flex flex-row-reverse ${CELL_GAP}`}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                    <div
                        key={dayNum}
                        // --- اصلاحیه: سایز بزرگتر و رنگ از متغیرها ---
                        className={`${HEADER_CELL_SIZE} flex items-center justify-center text-sm font-bold text-muted-foregroundL/70 dark:text-muted-foregroundD/70`}
                    >
                        {dayNum}
                    </div>
                ))}
            </div>
            {/* --- پایان اصلاحیه --- */}
        </div>
    );
});


export const WorkCalendarGrid: React.FC<WorkCalendarGridProps> = ({
    jalaliYear,
    isEditing,
    activeTool
}) => {
    console.log("WorkCalendarGrid: Render start");

    const yearGrid = useMemo(() => {
        return generateJalaliYearGrid(jalaliYear);
    }, [jalaliYear]);

    const { data: holidayMap, isLoading, isError, error } = useGetHolidays(jalaliYear);
    const createHolidayMutation = useCreateHoliday();
    const deleteHolidayMutation = useDeleteHoliday();

    console.log("WorkCalendarGrid: isLoading:", isLoading, "isError:", isError, "holidayMap:", holidayMap);
    if (isError) {
        console.error("WorkCalendarGrid: خطای React Query در useGetHolidays:", error);
    }

    const handleDayClick = (gregorianDate: string | null, jalaliDate: string | null, currentHoliday?: Holiday) => {
        if (!jalaliDate || !gregorianDate) return;

        const isOfficial = (activeTool === HolidayType.OFFICIAL);
        const toolName = (activeTool === HolidayType.OFFICIAL)
            ? "تعطیلی رسمی"
            : "تعطیلی توافقی";

        if (activeTool === 'remove' || currentHoliday?.type === activeTool) {
            if (currentHoliday) {
                deleteHolidayMutation.mutate(gregorianDate);
            }
        }
        else {
            if (currentHoliday) {
                deleteHolidayMutation.mutate(gregorianDate);
            }
            createHolidayMutation.mutate({
                date: gregorianDate,
                name: toolName,
                is_official: isOfficial
            });
        }
    };

    const renderGrid = () => {
        console.log("WorkCalendarGrid: renderGrid called. Grid rows:", yearGrid.length);
        if (!yearGrid.length) {
            return <div> خطا در ساخت گرید تقویم. (utils)</div >;
        }

        return yearGrid.map(month => (
            // --- اصلاحیه: فاصله عمودی mb-1.5 ---
            <div key={month.name} className="flex items-center mb-1.5" style={{ direction: 'ltr' }}>


                {/* --- اصلاحیه: استفاده از متغیر فاصله --- */}
                <div className={`flex flex-row-reverse ${CELL_GAP}`}>
                    {month.days.map((day) => {
                        // سلول‌های واقعی روزها
                        if (day.date !== null && day.gregorianDate) {
                            const holiday = holidayMap ? holidayMap[day.gregorianDate] : undefined;
                            return (
                                <DayCell
                                    key={day.key}
                                    // --- اصلاحیه: پاس دادن سایز به کامپوننت فرزند ---
                                    className={CELL_SIZE}
                                    date={day.gregorianDate}
                                    holiday={holiday}
                                    isEditing={isEditing}
                                    onClick={() => handleDayClick(day.gregorianDate, day.date, holiday)}
                                />
                            );
                        } else {
                            // سلول خالی (padding در انتهای ماه)
                            // --- اصلاحیه: استفاده از متغیر سایز و رنگ ---
                            return (
                                <div key={day.key} className={`${CELL_SIZE} bg-secondaryL/30 dark:bg-secondaryD/20 rounded-sm`} />
                            );
                        }
                    })}
                </div>
                <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm text-muted-foregroundL font-semibold dark:text-muted-foregroundD`} style={{ direction: 'rtl' }}>
                    {month.name}
                </span>
            </div>
        ));
    };

    return (
        // --- اصلاحیه: استفاده از متغیرهای رنگی CSS ---
        <div className="bg-backgroundL-500  rounded-lg shadow-sm border border-borderL dark:bg-backgroundD dark:border-borderD">

            {/* --- اصلاحیه: استفاده از متغیرهای رنگی CSS --- */}
            <div className="p-4 border-t border-borderL dark:border-borderD overflow-x-auto">
                <DayHeader />
                {renderGrid()}
            </div>
        </div>
    );
};

