import { Skeleton } from "@/components/ui/Skeleton";

/**
 * اسکلت لودینگ برای WorkPatternScheduleView (نسخه هم‌راستا با گراف واقعی)
 */
export const WorkPatternScheduleViewSkeleton = () => {
  // روزهای هفته
  const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  // ساعت‌ها
  const hours = Array.from({ length: 16 }, (_, i) => `${5 + i}:00`);

  return (
    <div className="bg-backgroundL-500 max-w-2xl dark:bg-backgroundD border border-borderL dark:border-borderD rounded-lg p-4">
      {/* --- عنوان و هدر --- */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* --- جدول زمان‌بندی --- */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] border border-borderL dark:border-borderD rounded-md">
          {/* هدر ساعت‌ها */}
          <div className="grid grid-cols-[100px_repeat(16,1fr)] border-b border-borderL dark:border-borderD">
            <div></div>
            {hours.map(( i) => (
              <Skeleton key={i} className="h-5 mx-1 my-2" />
            ))}
          </div>

          {/* ردیف‌های روزها */}
          {days.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[100px_repeat(16,1fr)] border-b border-borderL dark:border-borderD h-10 items-center"
            >
              {/* ستون روز */}
              <div className="flex justify-end ">
                <Skeleton className="h-5 w-12" />
              </div>

              {/* ستون‌های ساعت */}
              <div className="col-span-16 flex items-center space-x-1 rtl:space-x-reverse px-2">
                {/* نوار لودینگ افقی (شبیه نوار قرمز اصلی) */}
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
