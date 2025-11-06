import { type WorkPatternUI, type DailyScheduleUI } from '../../types';
// import { Spinner } from '@/components/ui/Spinner';
import clsx from 'clsx';
import React from 'react';
import { WorkPatternScheduleViewSkeleton } from '@/features/work-pattern/Skeleton/WorkPatternScheduleViewSkeleton';


interface WorkPatternScheduleViewProps {
  selectedPattern: WorkPatternUI | null;
  isLoadingDetails?: boolean;
}

// تابع کمکی تبدیل زمان به درصد
const timeToPercentage = (time: string | null): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    console.error("Invalid time format passed to timeToPercentage:", time);
    return 0;
  }
  const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
  // کامنت: چون محور ما از راست (00:00) به چپ (24:00) است، درصد را برعکس می‌کنیم
  return 100 - percentage;
};

// تابع کمکی برای استایل بلاک زمانی
const getBlockStyleAndClass = (daySchedule: DailyScheduleUI): { style: React.CSSProperties; className: string } | null => {
  if (!daySchedule.is_working_day || !daySchedule.start_time || !daySchedule.end_time) {
    return null;
  }

  const endPercent = timeToPercentage(daySchedule.start_time);
  const startPercent = timeToPercentage(daySchedule.end_time);

  const durationPercent = endPercent - startPercent;

  // کامنت: مدیریت شیفت شبانه (اگر پایان به روز بعد برود)
  if (durationPercent < 0) {

    return null;
  }
  if (durationPercent === 0) {
    console.warn("Zero duration calculated for:", daySchedule);
    return null;
  }

  const bgColorClass = daySchedule.atomicPattern?.type === 'floating'
    ? 'bg-infoL/80 dark:bg-infoD/70 border border-infoL dark:border-infoD'
    : 'bg-destructiveL/80 dark:bg-destructiveD/70 border border-destructiveL dark:border-destructiveD';

  const style = {
    right: `${startPercent}%`, // نقطه شروع از راست
    width: `${durationPercent}%`, // طول بلاک
  };

  return { style, className: bgColorClass };
};

export const WorkPatternScheduleView = ({ selectedPattern, isLoadingDetails }: WorkPatternScheduleViewProps) => {
  // کامنت: ساعت‌ها از 0 تا 23
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days: DailyScheduleUI['dayOfWeekName'][] = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  return (
    <div className="p-4 bg-backgroundL-500 rounded-lg shadow md:min-h-[450px] flex flex-col dark:bg-backgroundD border border-borderL dark:border-borderD">
      <h3 className="text-lg font-semibold mb-4 text-foregroundL dark:text-foregroundD shrink-0">
        شماتیک الگوی: {selectedPattern ? `${selectedPattern.name} ` : ''}
      </h3>

      {isLoadingDetails ? (
        <div className="flex-1 flex items-center justify-center">
          <WorkPatternScheduleViewSkeleton />
        </div>
      ) : !selectedPattern ? (
        <div className="flex-1 flex items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border border-dashed border-borderL dark:border-borderD rounded">
          لطفا یک الگو را انتخاب کنید
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-borderL dark:border-borderD rounded bg-backgroundL-500 dark:bg-backgroundD relative">
          {/* ۱. ستون ثابت نام روزها در سمت راست */}
          <div className="sticky right-0 top-0 z-20 w-[60px] float-right">
            {/* کامنت: سلول خالی گوشه بالا-راست */}
            <div className="h-8 border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD"></div>
            {days.map(day => (
              <div key={`day-label-${day}`} className="h-10 flex items-center justify-center border-b border-l border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                <span className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* ۲. محفظه اسکرول شونده برای گرید زمانی */}
          <div className="overflow-x-auto">
            <div className="relative min-w-[960px]">

              {/* ۲.۱. ردیف ثابت لیبل ساعت‌ها در بالا */}
              <div className="sticky top-0 z-10 flex h-8 bg-backgroundL-500 dark:bg-backgroundD border-b border-borderL dark:border-borderD">
                {hours.map((hour) => (
                  <div key={`hour-label-${hour}`} className="flex-1 border-l border-borderL dark:border-borderD flex items-center justify-center min-w-[40px]">
                    <span className="text-[9px] text-muted-foregroundL dark:text-muted-foregroundD">
                      {`${String(hour).padStart(2, '0')}:00`}
                    </span>
                  </div>
                ))}
              </div>

              {/* ۲.۲. ردیف‌های روزها برای نمایش خطوط و بلاک‌ها */}
              <div className="relative">
                {/* ۲.۲.۱. خطوط عمودی ساعت */}
                <div className="absolute inset-0 flex z-0">
                  {hours.map((hour) => (
                    <div key={`vline-${hour}`} className="flex-1 border-l border-borderL dark:border-borderD min-w-[40px]"></div>
                  ))}
                </div>

                {/* ۲.۲.۲. رندر ردیف‌های روز و بلاک‌های زمانی */}
                {days.map((dayName) => {
                  {/*dayIndex */ }
                  // ✅✅✅ اصلاح خطای ۸: اضافه کردن Optional Chaining ✅✅✅
                  const daySchedule = selectedPattern.daily_schedules?.find(d => d.dayOfWeekName === dayName);
                  const isWorkDay = daySchedule?.is_working_day ?? false;
                  const blockInfo = isWorkDay ? getBlockStyleAndClass(daySchedule!) : null;

                  return (
                    <div
                      key={`row-${dayName}`}
                      className={clsx(
                        "h-10 border-b border-borderL dark:border-borderD relative",
                        !isWorkDay && "bg-secondaryL dark:bg-secondaryD/60"
                      )}
                    >
                      {blockInfo && ( // کامنت: اطمینان از null نبودن بلاک
                        <div
                          className={clsx(
                            "absolute top-0.5 bottom-0.5 rounded z-10",
                            blockInfo.className
                          )}
                          style={blockInfo.style}
                          title={`${daySchedule?.start_time} - ${daySchedule?.end_time} (${daySchedule?.work_duration_minutes} دقیقه)`}
                        >
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

