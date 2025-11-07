import React, { useMemo } from 'react';
// ایمپورت کردن هوک‌ها و کامپوننت‌های مورد نیاز از مسیرهای پروژه
// (مسیرها بر اساس آخرین فایل صحیح شما تنظیم شده‌اند)
import { useGetHolidays, useCreateHoliday, useDeleteHoliday } from '@/features/work-calendar/hooks/useWorkCalendar';
import { DayCell } from '@/features/work-calendar/components/DayCell';
import type { Holiday } from '@/features/work-calendar/types';
import { HolidayType } from '@/features/work-calendar/types';
import type { ActiveTool } from '@/features/work-calendar/types';

// ایمپورت کردن تابع کمکی برای ساخت گرید
import { generateJalaliYearGrid } from '@/features/work-calendar/utils/calendarUtils';

// تعریف پراپ‌های کامپوننت گرید
interface WorkCalendarGridProps {
    jalaliYear: number; // سال جلالی انتخاب شده
    isEditing: boolean; // آیا حالت ویرایش فعال است؟
    activeTool: ActiveTool; // ابزار فعال (رسمی، توافقی، حذف)
}

// --- ثابت‌های مربوط به استایل و اندازه‌ها ---
// این مقادیر برای هماهنگی در هدر و سلول‌ها استفاده می‌شوند
const CELL_SIZE = "w-6 h-6"; // اندازه هر سلول روز
const HEADER_CELL_SIZE = "w-6 h-6"; // اندازه سلول‌های هدر (اعداد 1 تا 31)
const CELL_GAP = "gap-1"; // فاصله بین سلول‌ها
const MONTH_NAME_WIDTH = "w-24"; // عرض ستون نام ماه‌ها
// --- پایان ثابت‌ها ---


/**
 * کامپوننت هدر (سربرگ)
 * این کامپوننت به صورت بهینه (Memoized) رندر می‌شود.
 * فقط اعداد 1 تا 31 را نمایش می‌دهد.
 */
const DayHeader = React.memo(() => {
    return (
        <div className="flex items-center mb-2" style={{ direction: 'ltr' }}>

            {/* گرید هدر (اعداد 1 تا 31) */}
            <div className={`flex flex-row-reverse ${CELL_GAP}`}>
                {/* یک آرایه 31 عضوی ساخته و به ازای هر عدد، یک سلول هدر رندر می‌کنیم */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                    <div
                        key={dayNum}
                        className={`${HEADER_CELL_SIZE} flex items-center justify-center text-sm font-bold text-muted-foregroundL/70 dark:text-muted-foregroundD/70`}
                    >
                        {dayNum}
                    </div>
                ))}
            </div>
        </div>
    );
});


/**
 * کامپوننت اصلی گرید تقویم کاری
 */
export const WorkCalendarGrid: React.FC<WorkCalendarGridProps> = ({
    jalaliYear,
    isEditing,
    activeTool
}) => {
    console.log("WorkCalendarGrid: Render start");

    // گرید سالانه را با استفاده از useMemo می‌سازیم تا فقط در صورت تغییر سال، دوباره محاسبه شود
    const yearGrid = useMemo(() => {
        // این تابع از utils می‌آید و تمام محاسبات تاریخ و حروف روز هفته را انجام می‌دهد
        return generateJalaliYearGrid(jalaliYear);
    }, [jalaliYear]);

    // دریافت تعطیلات از سرور با استفاده از React Query
    const { data: holidayMap, isLoading, isError, error } = useGetHolidays(jalaliYear);
    // تعریف میوتیشن‌ها برای ایجاد و حذف تعطیلات
    const createHolidayMutation = useCreateHoliday();
    const deleteHolidayMutation = useDeleteHoliday();

    // لاگ کردن وضعیت دریافت دیتا
    console.log("WorkCalendarGrid: isLoading:", isLoading, "isError:", isError, "holidayMap:", holidayMap);
    if (isError) {
        console.error("WorkCalendarGrid: خطای React Query در useGetHolidays:", error);
    }

    // مدیریت کلیک روی یک سلول روز
    const handleDayClick = (gregorianDate: string | null, jalaliDate: string | null, currentHoliday?: Holiday) => {
        if (!jalaliDate || !gregorianDate) return; // اگر سلول خالی باشد، کاری نکن

        // بر اساس ابزار فعال، نوع تعطیلی را مشخص می‌کنیم
        const isOfficial = (activeTool === HolidayType.OFFICIAL);
        const toolName = (activeTool === HolidayType.OFFICIAL)
            ? "تعطیلی رسمی"
            : "تعطیلی توافقی";

        // منطق حذف یا تغییر نوع تعطیلی
        if (activeTool === 'remove' || currentHoliday?.type === activeTool) {
            // اگر ابزار "پاک کردن" فعال باشد، یا روی تعطیلی همنوع کلیک کنیم -> حذف می‌شود
            if (currentHoliday) {
                deleteHolidayMutation.mutate(gregorianDate);
            }
        }
        else {
            // اگر ابزار متفاوت باشد (مثلاً روز رسمی است و ما توافقی را میزنیم)
            if (currentHoliday) {
                // اول قبلی را حذف می‌کنیم
                deleteHolidayMutation.mutate(gregorianDate);
            }
            // و سپس تعطیلی جدید را با نوع ابزار فعال، ثبت می‌کنیم
            createHolidayMutation.mutate({
                date: gregorianDate,
                name: toolName,
                is_official: isOfficial
            });
        }
    };

    // تابع برای رندر کردن کل گرید ماه‌ها
    const renderGrid = () => {
        console.log("WorkCalendarGrid: renderGrid called. Grid rows:", yearGrid.length);
        if (!yearGrid.length) {
            return <div> خطا در ساخت گرید تقویم. (utils)</div >;
        }

        // به ازای هر ماه در گرید...
        return yearGrid.map(month => (
            <div key={month.name} className="flex items-center mb-1.5" style={{ direction: 'ltr' }}>
                {/* ردیف سلول‌های روز (از 1 تا 31) */}
                <div className={`flex flex-row-reverse ${CELL_GAP}`}>
                    {month.days.map((day) => {
                        // سلول‌های واقعی روزها (دارای تاریخ)
                        if (day.date !== null && day.gregorianDate) {
                            // اطلاعات تعطیلی این روز را از holidayMap برمی‌داریم
                            const holiday = holidayMap ? holidayMap[day.gregorianDate] : undefined;
                            return (
                                <DayCell
                                    key={day.key}
                                    className={CELL_SIZE}
                                    date={day.gregorianDate}
                                    holiday={holiday}
                                    isEditing={isEditing}
                                    onClick={() => handleDayClick(day.gregorianDate, day.date, holiday)}
                                    // *** مهم: حرف روز هفته را به سلول پاس می‌دهیم ***
                                    weekDayShort={day.weekDayShort}
                                />
                            );
                        } else {
                            // سلول خالی (padding در انتهای ماه)
                            return (
                                <div key={day.key} className={`${CELL_SIZE} bg-secondaryL/30 dark:bg-secondaryD/20 rounded-sm`} />
                            );
                        }
                    })}
                </div>
                {/* نمایش نام ماه در انتهای ردیف */}
                <span className={`${MONTH_NAME_WIDTH} shrink-0 text-sm text-muted-foregroundL font-semibold dark:text-muted-foregroundD`} style={{ direction: 'rtl' }}>
                    {month.name}
                </span>
            </div>
        ));
    };

    // رندر نهایی کامپوننت
    return (
        <div className="bg-backgroundL-500  rounded-lg shadow-sm border border-borderL dark:bg-backgroundD dark:border-borderD">
            <div className="p-4 border-t border-borderL dark:border-borderD overflow-x-auto">

                {/* رندر هدر (اعداد 1 تا 31) */}
                <DayHeader />

                {/* رندر گرید اصلی تقویم */}
                {renderGrid()}
            </div>
        </div>
    );
};