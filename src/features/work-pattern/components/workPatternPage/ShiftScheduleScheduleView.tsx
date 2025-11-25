import { useMemo } from "react";
import clsx from "clsx";
import type {
    ShiftScheduleResource,
    ScheduleSlotResource,
} from "@/features/shift-schedule/types";

import { WorkPatternScheduleViewSkeleton } from "@/features/work-pattern/Skeleton/WorkPatternScheduleViewSkeleton";
import { Moon, ArrowLeft, CalendarRange, TimerReset } from "lucide-react";

interface VisualBlock {
    id: string;
    start: string;
    end: string;
    type: "normal" | "overflow";
    slot: ScheduleSlotResource;
}

const getMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const timeToPercentage = (time: string): number => {
    const mins = getMinutes(time);
    return (mins / (24 * 60)) * 100;
};

export const ShiftScheduleScheduleView = ({
    schedule,
    isLoadingDetails,
}: {
    schedule: ShiftScheduleResource | null;
    isLoadingDetails?: boolean;
}) => {
    const hours = Array.from({ length: 25 }, (_, i) => i);

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
        <div className="p-4 rounded-xl shadow bg-backgroundL-500/60 backdrop-blur-sm dark:bg-backgroundD/60 border border-borderL/70 dark:border-borderD/60 flex flex-col md:min-h-[450px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                    شماتیک چرخشی
                    {schedule && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                            {schedule.name} ({schedule.cycle_length_days} روزه)
                        </span>
                    )}
                </h3>

                {/* ✅ اضافه شده: نمایش اطلاعات شناوری برای هماهنگی با داکیومنت و سایر ویوها */}
                {schedule && (schedule.floating_start || schedule.floating_end) ? (
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800" title="منطق آستانه فعال است">
                        <TimerReset className="w-3.5 h-3.5" />
                        <span>شناوری:</span>
                        {schedule.floating_start ? <span>ورود {schedule.floating_start} دقیقه</span> : null}
                        {schedule.floating_start && schedule.floating_end ? <span className="mx-0.5">|</span> : null}
                        {schedule.floating_end ? <span>خروج {schedule.floating_end} دقیقه</span> : null}
                    </div>
                ) : null}
            </div>

            {isLoadingDetails ? (
                <div className="flex-1 flex items-center justify-center">
                    <WorkPatternScheduleViewSkeleton />
                </div>
            ) : !schedule ? (
                <div className="flex-1 flex flex-col gap-3 items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL/60 dark:border-borderD/60 rounded-xl p-6 bg-secondaryL/10">
                    <div className="p-4 rounded-full bg-secondaryL/30 dark:bg-secondaryD/30">
                        <CalendarRange className="w-8 h-8 opacity-50" />
                    </div>
                    <span className="font-medium">لطفاً یک برنامه شیفتی را انتخاب کنید</span>
                </div>
            ) : (
                <div className="flex-1 overflow-auto border border-borderL/70 dark:border-borderD/60 rounded-xl bg-backgroundL-500/50 dark:bg-backgroundD/50 relative shadow-inner">
                    
                    <div className="sticky right-0 top-0 z-20 w-[70px] float-right shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                        <div className="h-10 border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD flex items-center justify-center font-bold text-xs text-muted-foregroundL">
                            روز
                        </div>
                        {daysWithBlocks.map((day) => (
                            <div key={day.dayNumber} className="h-12 flex items-center justify-center text-sm font-medium border-b border-l border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD bg-backgroundL-500 dark:bg-backgroundD">
                                روز {day.dayNumber}
                            </div>
                        ))}
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="relative min-w-[1200px]">
                            
                            <div className="sticky top-0 z-10 flex h-10 bg-backgroundL-500/90 dark:bg-backgroundD/90 border-b border-borderL dark:border-borderD backdrop-blur-md">
                                {hours.map((hour) => (
                                    <div key={hour} className="flex-1 border-l border-borderL/30 dark:border-borderD/30 flex items-center justify-start px-1 relative">
                                        <span className="absolute -right-2 top-3 text-[10px] text-muted-foregroundL dark:text-muted-foregroundD font-mono">
                                            {hour.toString().padStart(2, "0")}:00
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute inset-0 flex z-0 pointer-events-none">
                                {hours.map((hour) => (
                                    <div key={`line-${hour}`} className={clsx("flex-1 border-l min-w-[40px]", hour % 6 === 0 ? "border-borderL/40 dark:border-borderD/40" : "border-borderL/10 dark:border-borderD/10")}></div>
                                ))}
                            </div>

                            {daysWithBlocks.map((day) => (
                                <div key={day.dayNumber} className="h-12 relative border-b border-borderL/50 dark:border-borderD/50 transition-colors hover:bg-secondaryL/20 dark:hover:bg-secondaryD/10 group">
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
                                                    "absolute top-2 bottom-2 rounded-md shadow-sm flex items-center justify-center overflow-hidden whitespace-nowrap transition-all hover:shadow-md hover:scale-[1.01] cursor-help z-10",
                                                    "border text-white",
                                                    isFloating
                                                        ? "bg-gradient-to-r from-sky-500/90 to-sky-400/90 border-sky-600"
                                                        : "bg-gradient-to-r from-violet-500/90 to-violet-400/90 border-violet-600",
                                                    isOverflow && "opacity-80 border-dashed border-2 brightness-110 from-violet-400/80 to-violet-300/80"
                                                )}
                                                style={{
                                                    right: `${startPct}%`,
                                                    width: `${widthPct}%`,
                                                }}
                                            >
                                                <div className="flex items-center gap-1 px-2 w-full justify-center text-[11px] font-medium drop-shadow-sm">
                                                    {isOverflow && <ArrowLeft className="w-3 h-3 shrink-0" />}
                                                    <span className="truncate dir-ltr">
                                                        {block.start}-{block.end}
                                                    </span>
                                                    {block.end === "24:00" && <Moon className="w-3 h-3 shrink-0 ml-1" />}
                                                </div>

                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none z-30 flex flex-col items-center gap-0.5">
                                                    <span>روز {day.dayNumber}</span>
                                                    <span className="font-mono dir-ltr text-violet-200">
                                                        {block.start} - {block.end}
                                                    </span>
                                                    <span className="text-[10px] opacity-80">
                                                        ({block.slot.work_pattern?.name || 'شیفت'})
                                                    </span>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};