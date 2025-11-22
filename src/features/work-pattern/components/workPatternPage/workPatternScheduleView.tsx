import clsx from "clsx";
import { type WorkPatternUI, type DailyScheduleUI } from "../../types";
import { WorkPatternScheduleViewSkeleton } from "@/features/work-pattern/Skeleton/WorkPatternScheduleViewSkeleton";
import { Calendar, Clock } from "lucide-react";

// ==============================
//  Helper: تبدیل زمان به درصد
// ==============================
const timeToPercentage = (time: string | null): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;

  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / (24 * 60)) * 100;
};

// ==============================
//  Helper: محاسبه استایل بلوک
// ==============================
const getBlockData = (daySchedule: DailyScheduleUI) => {
  if (
    !daySchedule.is_working_day ||
    !daySchedule.start_time ||
    !daySchedule.end_time
  ) {
    return null;
  }

  const startPct = timeToPercentage(daySchedule.start_time);
  const endPct = timeToPercentage(daySchedule.end_time);
  const durationPercent = endPct - startPct;

  if (durationPercent <= 0) return null;

  const isFloating = daySchedule.atomicPattern?.type === "floating";

  return {
    style: {
      right: `${startPct}%`,
      width: `${durationPercent}%`,
    },
    isFloating,
    startTime: daySchedule.start_time,
    endTime: daySchedule.end_time,
    duration: daySchedule.work_duration_minutes
  };
};

export const WorkPatternScheduleView = ({
  selectedPattern,
  isLoadingDetails,
}: {
  selectedPattern: WorkPatternUI | null;
  isLoadingDetails?: boolean;
}) => {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  const days: DailyScheduleUI["dayOfWeekName"][] = [
    "شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه",
  ];

  return (
    <div className="p-4 rounded-xl shadow bg-backgroundL-500/60 backdrop-blur-sm dark:bg-backgroundD/60 border border-borderL/70 dark:border-borderD/60 flex flex-col md:min-h-[450px]">
      
      <h3 className="text-lg font-semibold mb-4 text-foregroundL dark:text-foregroundD flex items-center gap-2">
        شماتیک هفتگی
        {selectedPattern && (
          // ✅ بج با تم سبز ملایم برای هماهنگی با بلوک‌ها
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {selectedPattern.name}
          </span>
        )}
      </h3>

      {isLoadingDetails ? (
        <div className="flex-1 flex items-center justify-center">
          <WorkPatternScheduleViewSkeleton />
        </div>
      ) : !selectedPattern ? (
        <div className="flex-1 flex flex-col gap-3 items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL/60 dark:border-borderD/60 rounded-xl p-6 bg-secondaryL/10">
          <div className="p-4 rounded-full bg-secondaryL/30 dark:bg-secondaryD/30">
            <Calendar className="w-8 h-8 opacity-50" />
          </div>
          <span className="font-medium">لطفاً یک الگوی کاری را از لیست انتخاب کنید</span>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-borderL/70 dark:border-borderD/60 rounded-xl bg-backgroundL-500/50 dark:bg-backgroundD/50 relative shadow-inner">
          
          <div className="sticky right-0 top-0 z-20 w-[70px] float-right shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(0,0,0,0.2)]">
            <div className="h-10 border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD flex items-center justify-center font-bold text-xs text-muted-foregroundL/80">
              روز
            </div>
            {days.map((day) => (
              <div key={`day-label-${day}`} className="h-12 flex items-center justify-center text-sm font-medium border-b border-l border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD bg-backgroundL-500 dark:bg-backgroundD">
                {day}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="relative min-w-[1200px]">
              
              <div className="sticky top-0 z-10 flex h-10 bg-backgroundL-500/95 dark:bg-backgroundD/95 border-b border-borderL dark:border-borderD backdrop-blur-sm">
                {hours.map((hour) => (
                  <div key={`hour-${hour}`} className="flex-1 min-w-[40px] border-l border-borderL/30 dark:border-borderD/30 flex items-center justify-start px-1 relative group">
                    <span className="absolute -right-2 top-3 text-[10px] font-mono text-muted-foregroundL dark:text-muted-foregroundD group-hover:text-foregroundL dark:group-hover:text-foregroundD transition-colors">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 flex z-0 pointer-events-none">
                {hours.map((hour) => (
                  <div key={`line-${hour}`} className={clsx("flex-1 border-l min-w-[40px]", hour % 6 === 0 ? "border-borderL/40 dark:border-borderD/40 bg-foregroundL/[0.02]" : "border-borderL/10 dark:border-borderD/10")}></div>
                ))}
              </div>

              {days.map((dayName) => {
                const daySchedule = selectedPattern.daily_schedules?.find((d) => d.dayOfWeekName === dayName);
                const isWorkDay = daySchedule?.is_working_day ?? false;
                const blockData = isWorkDay ? getBlockData(daySchedule!) : null;

                return (
                  <div key={`row-${dayName}`} className={clsx("h-12 relative border-b border-borderL/50 dark:border-borderD/50 transition-colors group", "hover:bg-secondaryL/20 dark:hover:bg-secondaryD/10", !isWorkDay && "bg-[url('/diagonal-stripes.svg')] bg-secondaryL/30 dark:bg-secondaryD/20")}>
                    {!isWorkDay && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-xs text-muted-foregroundL/60 font-medium px-2 py-1 bg-backgroundL/80 rounded">تعطیل</span>
                        </div>
                    )}

                    {blockData && (
                      <div
                        className={clsx(
                          "absolute top-2 bottom-2 rounded-md shadow-sm flex items-center justify-center overflow-hidden whitespace-nowrap transition-all cursor-help z-10",
                          "hover:shadow-md hover:scale-[1.01] hover:z-20",
                          "border text-white",
                          // ✅✅✅ رنگ سبز دلنشین برای الگوی ثابت
                          blockData.isFloating
                            ? "bg-gradient-to-r from-sky-500/90 to-sky-400/90 border-sky-600" // شناور (آبی)
                            : "bg-gradient-to-r from-emerald-500/90 to-emerald-400/90 border-emerald-600" // ثابت (سبز)
                        )}
                        style={blockData.style}
                      >
                        <div className="flex items-center gap-1.5 px-2 w-full justify-center text-[11px] font-medium drop-shadow-sm">
                          <Clock className="w-3 h-3 opacity-80 shrink-0" />
                          <span className="truncate dir-ltr">
                            {blockData.startTime} - {blockData.endTime}
                          </span>
                        </div>

                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none z-30 flex flex-col items-center gap-0.5">
                            <span>{dayName}</span>
                            <span className="font-mono dir-ltr text-emerald-200">
                                {blockData.startTime} - {blockData.endTime}
                            </span>
                            <span className="text-[10px] opacity-80">
                                ({Math.floor(blockData.duration / 60)} ساعت و {blockData.duration % 60} دقیقه)
                            </span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
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