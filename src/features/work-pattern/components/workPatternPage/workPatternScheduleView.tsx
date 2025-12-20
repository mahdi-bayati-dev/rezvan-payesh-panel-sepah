import  { useMemo } from "react";
import clsx from "clsx";
import { type WorkPatternUI, type DailyScheduleUI } from "../../types";
import { WorkPatternScheduleViewSkeleton } from "../../Skeleton/WorkPatternScheduleViewSkeleton";
import { Calendar, Clock, TimerReset } from "lucide-react";
import { toPersianDigits, formatTimeToPersian } from "../../utils/persianUtils";

/**
 * @description محاسبه درصد دقیق موقعیت زمانی در یک بازه ۲۴ ساعته (۱۴۴۰ دقیقه)
 */
const timeToPercentage = (time: string | null): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return ((hours * 60 + minutes) / (24 * 60)) * 100;
};

/**
 * @description استخراج داده‌های بلاک بصری برای هر روز
 */
const getBlockData = (daySchedule: DailyScheduleUI) => {
  if (!daySchedule.is_working_day || !daySchedule.start_time || !daySchedule.end_time) return null;

  const startPct = timeToPercentage(daySchedule.start_time);
  const endPct = timeToPercentage(daySchedule.end_time);
  const durationPercent = endPct - startPct;

  if (durationPercent <= 0) return null;

  return {
    style: {
      right: `${startPct.toFixed(4)}%`,
      width: `${durationPercent.toFixed(4)}%`
    },
    isFloating: daySchedule.atomicPattern?.type === "floating",
    startTime: daySchedule.start_time,
    endTime: daySchedule.end_time,
  };
};

export const WorkPatternScheduleView = ({
  selectedPattern,
  isLoadingDetails
}: {
  selectedPattern: WorkPatternUI | null;
  isLoadingDetails?: boolean;
}) => {
  const hourSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const days: DailyScheduleUI["dayOfWeekName"][] = ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

  return (
    <div className="p-4 rounded-xl backdrop-blur-sm dark:bg-backgroundD/60 dark:border-borderD/60 flex flex-col md:min-h-[450px]" dir="rtl">

      {/* هدر شماتیک */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          شماتیک زمانی (هفتگی)
          {selectedPattern && (
            <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
              {selectedPattern.name}
            </span>
          )}
        </h3>

        {selectedPattern && (selectedPattern.floating_start || selectedPattern.floating_end) ? (
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800">
            <TimerReset className="w-3.5 h-3.5" />
            <span>شناوری:</span>
            {selectedPattern.floating_start ? <span>ورود {toPersianDigits(selectedPattern.floating_start)} م</span> : null}
            {selectedPattern.floating_start && selectedPattern.floating_end && <span className="opacity-30">|</span>}
            {selectedPattern.floating_end ? <span>خروج {toPersianDigits(selectedPattern.floating_end)} م</span> : null}
          </div>
        ) : null}
      </div>

      {isLoadingDetails ? (
        <div className="flex-1 flex items-center justify-center">
          <WorkPatternScheduleViewSkeleton />
        </div>
      ) : !selectedPattern ? (
        <div className="flex-1 flex flex-col gap-4 items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL/40 dark:border-borderD/40 rounded-2xl p-8 bg-secondaryL/5">
          <div className="p-5 rounded-full bg-secondaryL/20 dark:bg-secondaryD/20">
            <Calendar className="w-10 h-10 opacity-40" />
          </div>
          <span className="font-medium text-sm">یک الگوی کاری را از لیست انتخاب کنید</span>
        </div>
      ) : (
        <div className="flex-1 border border-borderL/70 dark:border-borderD/60 rounded-xl bg-white dark:bg-backgroundD shadow-inner overflow-hidden flex flex-row relative">

          {/* ✅ ستون روزها - فیکس در سمت راست */}
          <div className="w-[85px] shrink-0 border-l border-borderL dark:border-borderD bg-secondaryL/10 dark:bg-secondaryD/20 z-20 sticky right-0">
            <div className="h-10 border-b border-borderL dark:border-borderD flex items-center justify-center font-bold text-[10px] text-muted-foregroundL dark:text-muted-foregroundD/60 uppercase bg-secondaryL/20 dark:bg-black/20">روز</div>
            {days.map((day) => (
              <div key={day} className="h-14 flex items-center justify-center text-xs font-bold border-b border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD bg-white dark:bg-backgroundD">
                {day}
              </div>
            ))}
          </div>

          {/* ناحیه اسکرول‌شونده ساعت‌ها و بلاک‌ها */}
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

              {/* خطوط عمودی گرید (Background) */}
              <div className="absolute inset-0 top-10 flex pointer-events-none z-0">
                {hourSlots.map((hour) => (
                  <div key={`line-${hour}`} className={clsx(
                    "flex-1 border-l",
                    hour % 6 === 0 ? "border-borderL/40 dark:border-borderD/40 bg-secondaryL/[0.02]" : "border-borderL/10 dark:border-borderD/10"
                  )} />
                ))}
                <div className="border-l border-borderL/10 dark:border-borderD/10" />
              </div>

              {/* ردیف‌های بلاک‌های کاری */}
              <div className="relative z-10">
                {days.map((dayName) => {
                  const daySchedule = selectedPattern.daily_schedules?.find((d) => d.dayOfWeekName === dayName);
                  const block = daySchedule ? getBlockData(daySchedule) : null;

                  return (
                    <div key={`row-${dayName}`} className={clsx(
                      "h-14 relative border-b border-borderL/40 dark:border-borderD/40 transition-colors group",
                      !daySchedule?.is_working_day && "bg-secondaryL/5 dark:bg-secondaryD/5 opacity-50"
                    )}>
                      {block && (
                        <div
                          className={clsx(
                            "absolute top-2.5 bottom-2.5 rounded-lg shadow-sm flex items-center justify-center overflow-hidden whitespace-nowrap transition-all z-10 hover:shadow-md hover:scale-[1.005] border text-white ring-1 ring-white/10",
                            block.isFloating
                              ? "bg-gradient-to-r from-sky-500 to-sky-400 border-sky-600 dark:from-sky-600 dark:to-sky-500"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-600 dark:from-emerald-600 dark:to-emerald-500"
                          )}
                          style={block.style}
                        >
                          <div className="flex items-center gap-1.5 px-2 w-full justify-center text-[10px] font-bold drop-shadow-sm">
                            <Clock className="w-3 h-3 opacity-80 shrink-0" />
                            <span className="dir-ltr tracking-tight">
                              {formatTimeToPersian(block.startTime)} - {formatTimeToPersian(block.endTime)}
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
        </div>
      )}
    </div>
  );
};