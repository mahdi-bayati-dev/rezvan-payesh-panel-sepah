import clsx from "clsx";
import { type WorkPatternUI, type DailyScheduleUI } from "../../types";
import { WorkPatternScheduleViewSkeleton } from "@/features/work-pattern/Skeleton/WorkPatternScheduleViewSkeleton";
import { Calendar, Clock, TimerReset } from "lucide-react";
// ✅ ایمپورت اعداد فارسی
import { toPersianDigits, formatTimeToPersian } from '@/features/work-pattern/utils/persianUtils';

const timeToPercentage = (time: string | null): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return ((hours * 60 + minutes) / (24 * 60)) * 100;
};

const getBlockData = (daySchedule: DailyScheduleUI) => {
  if (!daySchedule.is_working_day || !daySchedule.start_time || !daySchedule.end_time) return null;
  const startPct = timeToPercentage(daySchedule.start_time);
  const endPct = timeToPercentage(daySchedule.end_time);
  const durationPercent = endPct - startPct;
  if (durationPercent <= 0) return null;
  const isFloating = daySchedule.atomicPattern?.type === "floating";
  return {
    style: { right: `${startPct}%`, width: `${durationPercent}%` },
    isFloating,
    startTime: daySchedule.start_time,
    endTime: daySchedule.end_time,
    duration: daySchedule.work_duration_minutes
  };
};

export const WorkPatternScheduleView = ({ selectedPattern, isLoadingDetails }: { selectedPattern: WorkPatternUI | null; isLoadingDetails?: boolean; }) => {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  const days: DailyScheduleUI["dayOfWeekName"][] = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

  return (
    <div className="p-4 rounded-xl backdrop-blur-sm dark:bg-backgroundD/60 dark:border-borderD/60 flex flex-col md:min-h-[450px]">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
          شماتیک هفتگی
          {selectedPattern && (
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
              {selectedPattern.name}
            </span>
          )}
        </h3>

        {/* ✅ نمایش اطلاعات شناوری با اعداد فارسی */}
        {selectedPattern && (selectedPattern.floating_start || selectedPattern.floating_end) ? (
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800" title="منطق آستانه فعال است">
            <TimerReset className="w-3.5 h-3.5" />
            <span>شناوری:</span>
            {selectedPattern.floating_start ? <span>ورود {toPersianDigits(selectedPattern.floating_start)} دقیقه</span> : null}
            {selectedPattern.floating_start && selectedPattern.floating_end ? <span className="mx-0.5">|</span> : null}
            {selectedPattern.floating_end ? <span>خروج {toPersianDigits(selectedPattern.floating_end)} دقیقه</span> : null}
          </div>
        ) : null}
      </div>

      {isLoadingDetails ? (
        <div className="flex-1 flex items-center justify-center"><WorkPatternScheduleViewSkeleton /></div>
      ) : !selectedPattern ? (
        <div className="flex-1 flex flex-col gap-3 items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL/60 dark:border-borderD/60 rounded-xl p-6 bg-secondaryL/10 dark:bg-secondaryD/10">
          <div className="p-4 rounded-full bg-secondaryL/30 dark:bg-secondaryD/20"><Calendar className="w-8 h-8 opacity-50" /></div>
          <span className="font-medium">لطفاً یک الگوی کاری را انتخاب کنید</span>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-borderL/70 dark:border-borderD/60 rounded-xl bg-backgroundL-500/50 dark:bg-backgroundD/50 relative shadow-inner">

          {/* ستون روزها (چسبنده سمت راست) */}
          <div className="sticky right-0 top-0 z-20 w-[80px] float-right shadow-sm">
            <div className="h-10 border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD flex items-center justify-center font-bold text-xs text-muted-foregroundL/80 dark:text-muted-foregroundD/80">روزهای هفته</div>
            {days.map((day) => (
              <div key={`day-label-${day}`} className="h-14 flex items-center justify-center text-sm font-medium border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD text-foregroundL dark:text-foregroundD">
                {day}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="relative min-w-[1200px]">

              {/* هدر ساعت‌ها (چسبنده بالا) با اعداد فارسی */}
              <div className="sticky top-0 z-10 flex h-10 bg-backgroundL-500/95 dark:bg-backgroundD/95 border-b border-borderL dark:border-borderD backdrop-blur-sm">
                {hours.map((hour) => (
                  <div key={`hour-${hour}`} className="flex-1 min-w-[40px] border-l border-borderL/30 dark:border-borderD/30 flex items-center justify-start px-1 relative">
                    <span className="absolute -right-3 top-3 text-[10px] font-mono text-muted-foregroundL dark:text-muted-foregroundD">
                      {toPersianDigits(String(hour).padStart(2, "0"))}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* خطوط پس‌زمینه گرید */}
              <div className="absolute inset-0 flex z-0 pointer-events-none">
                {hours.map((hour) => (
                  <div key={`line-${hour}`} className={clsx("flex-1 border-l min-w-[40px]", hour % 6 === 0 ? "border-borderL/40 dark:border-borderD/30 bg-foregroundL/[0.02] dark:bg-white/[0.02]" : "border-borderL/10 dark:border-borderD/10")}></div>
                ))}
              </div>

              {/* ردیف‌های روزانه */}
              {days.map((dayName) => {
                const daySchedule = selectedPattern.daily_schedules?.find((d) => d.dayOfWeekName === dayName);
                const isWorkDay = daySchedule?.is_working_day ?? false;
                const blockData = isWorkDay ? getBlockData(daySchedule!) : null;
                return (
                  <div key={`row-${dayName}`} className={clsx(
                    "h-14 relative border-b border-borderL/50 dark:border-borderD/50 transition-colors group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10",
                    !isWorkDay && "bg-[url('/diagonal-stripes.svg')] bg-secondaryL/30 dark:bg-secondaryD/20 dark:opacity-60"
                  )}>
                    {blockData && (
                      <div className={clsx("absolute top-2.5 bottom-2.5 rounded-lg shadow-sm flex items-center justify-center overflow-hidden whitespace-nowrap transition-all z-10 hover:shadow-md hover:scale-[1.01] border text-white", blockData.isFloating ? "bg-gradient-to-r from-sky-500/90 to-sky-400/90 border-sky-600 dark:from-sky-600 dark:to-sky-500 dark:border-sky-400" : "bg-gradient-to-r from-emerald-500/90 to-emerald-400/90 border-emerald-600 dark:from-emerald-600 dark:to-emerald-500 dark:border-emerald-400")} style={blockData.style}>
                        <div className="flex items-center gap-1.5 px-2 w-full justify-center text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 opacity-90 shrink-0" />
                            <span className="truncate dir-ltr font-mono tracking-tight">
                                {formatTimeToPersian(blockData.startTime)} - {formatTimeToPersian(blockData.endTime)}
                            </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};