import { type WorkPatternUI, type DailyScheduleUI } from "../../types";
import clsx from "clsx";
import React from "react";
import { WorkPatternScheduleViewSkeleton } from "@/features/work-pattern/Skeleton/WorkPatternScheduleViewSkeleton";

// ==============================
//  Helper: تبدیل زمان به درصد
// ==============================
const timeToPercentage = (time: string | null): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;

  const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
  return 100 - percentage; // محور راست → چپ
};

// ==============================
//  Helper: استایل بلوک شیفت
// ==============================
const getBlockStyleAndClass = (
  daySchedule: DailyScheduleUI
): { style: React.CSSProperties; className: string } | null => {
  if (
    !daySchedule.is_working_day ||
    !daySchedule.start_time ||
    !daySchedule.end_time
  ) {
    return null;
  }

  const endPercent = timeToPercentage(daySchedule.start_time);
  const startPercent = timeToPercentage(daySchedule.end_time);
  const durationPercent = endPercent - startPercent;

  if (durationPercent <= 0) return null;

  // 🎨 رنگ‌های جدید زیبا
  const bgColorClass =
    daySchedule.atomicPattern?.type === "floating"
      ? "bg-blue-400/70 dark:bg-blue-500/60 border border-blue-300 dark:border-blue-400"
      : "bg-red-400/70 dark:bg-red-500/60 border border-red-300 dark:border-red-400";

  const style = {
    right: `${startPercent}%`,
    width: `${durationPercent}%`,
  };

  return { style, className: bgColorClass };
};

// ==============================
//      Component UI اصلی
// ==============================

export const WorkPatternScheduleView = ({
  selectedPattern,
  isLoadingDetails,
}: {
  selectedPattern: WorkPatternUI | null;
  isLoadingDetails?: boolean;
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days: DailyScheduleUI["dayOfWeekName"][] = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
  ];

  return (
    <div className="p-4 rounded-xl shadow bg-backgroundL-500/60 backdrop-blur-sm dark:bg-backgroundD/60 border border-borderL/70 dark:border-borderD/60 flex flex-col md:min-h-[450px]">
      <h3 className="text-lg font-semibold mb-4 text-foregroundL dark:text-foregroundD">
        شماتیک الگوی:{" "}
        {selectedPattern ? (
          <span className="text-blue-600 dark:text-blue-400">
            {selectedPattern.name}
          </span>
        ) : (
          ""
        )}
      </h3>

      {/* Loading */}
      {isLoadingDetails ? (
        <div className="flex-1 flex items-center justify-center">
          <WorkPatternScheduleViewSkeleton />
        </div>
      ) : !selectedPattern ? (
        // حالت بدون انتخاب الگو
        <div className="flex-1 flex items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border border-dashed border-borderL dark:border-borderD rounded-xl p-6">
          یک الگو را انتخاب کنید
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-borderL/70 dark:border-borderD/60 rounded-xl bg-backgroundL-500/50 dark:bg-backgroundD/50 relative">
          {/* ستون روزها */}
          <div className="sticky right-0 top-0 z-20 w-[65px] float-right">
            <div className="h-8 border-b border-l border-borderL dark:border-borderD bg-backgroundL-500/60 dark:bg-backgroundD/60"></div>

            {days.map((day) => (
              <div
                key={`day-${day}`}
                className="h-10 flex items-center justify-center text-xs font-medium border-b border-l border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD bg-backgroundL-500/60 dark:bg-backgroundD/60"
              >
                {day}
              </div>
            ))}
          </div>

          {/* گرید زمانی */}
          <div className="overflow-x-auto">
            <div className="relative min-w-[960px]">
              {/* لیبل ساعت‌ها */}
              <div className="sticky top-0 z-10 flex h-8 bg-backgroundL-500/70 dark:bg-backgroundD/70 border-b border-borderL dark:border-borderD">
                {hours.map((hour) => (
                  <div
                    key={`hour-${hour}`}
                    className="flex-1 min-w-[40px] border-l border-borderL/60 dark:border-borderD/60 flex items-center justify-center"
                  >
                    <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* خطوط عمودی */}
              <div className="absolute inset-0 flex z-0 pointer-events-none">
                {hours.map((hour) => (
                  <div
                    key={`line-${hour}`}
                    className="flex-1 border-l border-borderL/40 dark:border-borderD/40 min-w-[40px]"
                  ></div>
                ))}
              </div>

              {/* ردیف روزها */}
              {days.map((dayName) => {
                const daySchedule = selectedPattern.daily_schedules?.find(
                  (d) => d.dayOfWeekName === dayName
                );

                const isWorkDay = daySchedule?.is_working_day ?? false;
                const block = isWorkDay
                  ? getBlockStyleAndClass(daySchedule!)
                  : null;

                return (
                  <div
                    key={`row-${dayName}`}
                    className={clsx(
                      "h-10 relative border-b border-borderL dark:border-borderD transition-colors",
                      !isWorkDay && "bg-secondaryL/50 dark:bg-secondaryD/40"
                    )}
                  >
                    {block && (
                      <div
                        className={clsx(
                          "absolute top-0.5 bottom-0.5 rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.015] hover:shadow-md",
                          block.className
                        )}
                        style={block.style}
                        title={`${daySchedule?.start_time} - ${
                          daySchedule?.end_time
                        } (${daySchedule?.work_duration_minutes} دقیقه)`}
                      ></div>
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
