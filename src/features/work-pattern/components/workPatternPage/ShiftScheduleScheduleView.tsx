import { useMemo } from "react";
import clsx from "clsx";
import type { ShiftScheduleResource, ScheduleSlotResource } from "@/features/shift-schedule/types";
import { WorkPatternScheduleViewSkeleton } from "../../Skeleton/WorkPatternScheduleViewSkeleton";
import { Moon, ArrowLeft, CalendarRange, TimerReset, Clock } from "lucide-react";
import { toPersianDigits, formatTimeToPersian } from "../../utils/persianUtils";

/**
 * @description تبدیل زمان به دقیقه برای محاسبات دقیق بصری
 */
const getMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

/**
 * @description محاسبه درصد افقی بر اساس شبانه‌روز (۱۴۴۰ دقیقه)
 */
const timeToPercentage = (time: string): number => {
    const mins = getMinutes(time);
    return (mins / (24 * 60)) * 100;
};

interface VisualBlock {
    id: string;
    start: string;
    end: string;
    type: "normal" | "overflow";
    slot: ScheduleSlotResource;
}

export const ShiftScheduleScheduleView = ({
    schedule,
    isLoadingDetails,
}: {
    schedule: ShiftScheduleResource | null;
    isLoadingDetails?: boolean;
}) => {
    const hourSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const daysWithBlocks = useMemo(() => {
        if (!schedule) return [];
        const cycleLength = schedule.cycle_length_days;
        const days = Array.from({ length: cycleLength }, (_, i) => ({
            dayNumber: i + 1,
            blocks: [] as VisualBlock[],
        }));

        schedule.slots.forEach((slot) => {
            if (!slot.work_pattern && !slot.override_start_time) return;
            const startStr = slot.override_start_time || slot.work_pattern!.start_time;
            const endStr = slot.override_end_time || slot.work_pattern!.end_time;
            if (!startStr || !endStr) return;

            const startMins = getMinutes(startStr);
            const endMins = getMinutes(endStr);
            const currentDayIndex = slot.day_in_cycle - 1;

            if (startMins < endMins) {
                if (days[currentDayIndex]) {
                    days[currentDayIndex].blocks.push({
                        id: `slot-${slot.id}-normal`,
                        start: startStr,
                        end: endStr,
                        type: "normal",
                        slot,
                    });
                }
            } else {
                if (days[currentDayIndex]) {
                    days[currentDayIndex].blocks.push({
                        id: `slot-${slot.id}-part1`,
                        start: startStr,
                        end: "24:00",
                        type: "normal",
                        slot,
                    });
                }
                const nextDayIndex = (currentDayIndex + 1) % cycleLength;
                if (days[nextDayIndex]) {
                    days[nextDayIndex].blocks.push({
                        id: `slot-${slot.id}-part2`,
                        start: "00:00",
                        end: endStr,
                        type: "overflow",
                        slot,
                    });
                }
            }
        });
        return days;
    }, [schedule]);

    return (
        <div className="p-4 rounded-xl backdrop-blur-sm dark:bg-backgroundD/60 dark:border-borderD/60 flex flex-col md:min-h-[450px]" dir="rtl">
            <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                    <CalendarRange className="w-5 h-5 text-violet-500" />
                    شماتیک چرخه شیفت
                    {schedule && (
                        <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                            {schedule.name} ({toPersianDigits(schedule.cycle_length_days)} روزه)
                        </span>
                    )}
                </h3>

                {schedule && (schedule.floating_start || schedule.floating_end) ? (
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800">
                        <TimerReset className="w-3.5 h-3.5" />
                        <span>شناوری:</span>
                        {schedule.floating_start ? <span>ورود {toPersianDigits(schedule.floating_start)} م</span> : null}
                        {schedule.floating_start && schedule.floating_end && <span className="opacity-30">|</span>}
                        {schedule.floating_end ? <span>خروج {toPersianDigits(schedule.floating_end)} م</span> : null}
                    </div>
                ) : null}
            </div>

            {isLoadingDetails ? (
                <div className="flex-1 flex items-center justify-center">
                    <WorkPatternScheduleViewSkeleton />
                </div>
            ) : !schedule ? (
                <div className="flex-1 flex flex-col gap-4 items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL/40 dark:border-borderD/40 rounded-2xl p-8 bg-secondaryL/5">
                    <div className="p-5 rounded-full bg-secondaryL/20 dark:bg-secondaryD/20">
                        <CalendarRange className="w-10 h-10 opacity-40" />
                    </div>
                    <span className="font-medium text-sm">لطفاً یک برنامه شیفتی را انتخاب کنید</span>
                </div>
            ) : (
                <div className="flex-1 border border-borderL/70 dark:border-borderD/60 rounded-xl bg-white dark:bg-backgroundD shadow-inner overflow-hidden flex flex-row relative">

                    {/* ✅ ستون روزها - فیکس در سمت راست */}
                    <div className="w-[85px] shrink-0 border-l border-borderL dark:border-borderD bg-secondaryL/10 dark:bg-secondaryD/20 z-20 sticky right-0">
                        <div className="h-10 border-b border-borderL dark:border-borderD flex items-center justify-center font-bold text-[10px] text-muted-foregroundL dark:text-muted-foregroundD/60 uppercase bg-secondaryL/20 dark:bg-black/20">روز چرخه</div>
                        {daysWithBlocks.map((day) => (
                            <div key={day.dayNumber} className="h-14 flex items-center justify-center text-xs font-bold border-b border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD bg-white dark:bg-backgroundD">
                                روز {toPersianDigits(day.dayNumber)}
                            </div>
                        ))}
                    </div>

                    {/* بخش اسکرول‌شونده */}
                    <div className="flex-1 overflow-x-auto custom-scrollbar overflow-y-hidden">
                        <div className="relative min-w-[1000px] h-full">

                            {/* هدر ساعت‌ها */}
                            <div className="flex h-10 bg-secondaryL/5 dark:bg-black/20 border-b border-borderL dark:border-borderD relative sticky top-0 z-10">
                                {hourSlots.map((hour) => (
                                    <div key={hour} className="flex-1 border-l border-borderL/20 dark:border-borderD/20 relative">
                                        <span className="absolute -right-3 top-2.5 text-[9px] font-medium text-muted-foregroundL dark:text-muted-foregroundD/70">
                                            {toPersianDigits(String(hour).padStart(2, '0'))}:۰۰
                                        </span>
                                    </div>
                                ))}
                                <div className="flex-none w-0 relative">
                                    <span className="absolute -right-3 top-2.5 text-[9px] font-medium text-muted-foregroundL dark:text-muted-foregroundD/70">
                                        {toPersianDigits("۲۴")}:۰۰
                                    </span>
                                </div>
                            </div>

                            {/* خطوط عمودی گرید */}
                            <div className="absolute inset-0 top-10 flex pointer-events-none z-0">
                                {hourSlots.map((hour) => (
                                    <div key={`line-${hour}`} className={clsx(
                                        "flex-1 border-l",
                                        hour % 6 === 0 ? "border-borderL/40 dark:border-borderD/40 bg-secondaryL/[0.02]" : "border-borderL/10 dark:border-borderD/10"
                                    )} />
                                ))}
                                <div className="border-l border-borderL/10 dark:border-borderD/10" />
                            </div>

                            {/* ردیف‌های بلاک‌های شیفت */}
                            <div className="relative z-10">
                                {daysWithBlocks.map((day) => (
                                    <div key={day.dayNumber} className="h-14 relative border-b border-borderL/40 dark:border-borderD/40 transition-colors hover:bg-violet-50/10 dark:hover:bg-violet-900/10 group">
                                        {day.blocks.map((block) => {
                                            const startPct = timeToPercentage(block.start);
                                            const endPct = block.end === "24:00" ? 100 : timeToPercentage(block.end);
                                            const widthPct = endPct - startPct;
                                            const isFloating = block.slot.work_pattern?.type === "floating";
                                            const isOverflow = block.type === "overflow";

                                            return (
                                                <div
                                                    key={block.id}
                                                    className={clsx(
                                                        "absolute top-2.5 bottom-2.5 rounded-lg shadow-sm flex items-center justify-center overflow-hidden whitespace-nowrap transition-all z-10 hover:shadow-md hover:scale-[1.005] border text-white ring-1 ring-white/10",
                                                        isFloating
                                                            ? "bg-gradient-to-r from-sky-500 to-sky-400 border-sky-600 dark:from-sky-600 dark:to-sky-500"
                                                            : "bg-gradient-to-r from-violet-500 to-violet-400 border-violet-600 dark:from-violet-600 dark:to-violet-500",
                                                        isOverflow && "opacity-90 border-dashed border-2 from-violet-400 to-violet-300"
                                                    )}
                                                    style={{
                                                        right: `${startPct.toFixed(4)}%`,
                                                        width: `${widthPct.toFixed(4)}%`,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1.5 px-2 w-full justify-center text-[10px] font-bold drop-shadow-sm">
                                                        {isOverflow && <ArrowLeft className="w-3 h-3 shrink-0" />}
                                                        <Clock className="w-3 h-3 opacity-80 shrink-0" />
                                                        <span className="dir-ltr tracking-tight">
                                                            {formatTimeToPersian(block.start)} - {formatTimeToPersian(block.end)}
                                                        </span>
                                                        {block.end === "24:00" && <Moon className="w-2.5 h-2.5 shrink-0 ml-1 fill-yellow-200 text-yellow-200" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};