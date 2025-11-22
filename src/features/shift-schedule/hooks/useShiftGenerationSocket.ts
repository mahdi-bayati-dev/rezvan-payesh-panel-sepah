import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";

interface ShiftGeneratedEvent {
  schedule_id: number;
  message: string;
  status: "success" | "error";
  timestamp: string;
}

/**
 * هوک گوش دادن به رویداد تولید شیفت‌ها
 * @param currentScheduleId شناسه برنامه شیفتی که کاربر در حال مشاهده آن است
 */
export const useShiftGenerationSocket = (currentScheduleId: number | string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // ۱. دریافت اینستنس Echo (که در GlobalWebSocketHandler قبلاً init شده)
    const echo = getEcho();
    if (!echo || !currentScheduleId) return;

    // نام کانال طبق داکیومنت: Private Channel 'super-admin-global'
    const channelName = "super-admin-global";
    
    // نام ایونت طبق داکیومنت: '.shift.generated' (نقطه اول برای حذف Namespace لاراول مهم است)
    const eventName = ".shift.generated";

    console.log(`[Socket] Subscribing to channel: ${channelName}, Event: ${eventName}`);

    // ۲. سابسکرایب به کانال
    const channel = echo.private(channelName);

    // ۳. گوش دادن به ایونت
    channel.listen(eventName, (event: ShiftGeneratedEvent) => {
      console.log("[Socket] Shift Generated Event Received:", event);

      // ۴. بررسی اینکه آیا ایونت مربوط به همین صفحه است؟
      // (چون کانال گلوبال است، ممکن است پیام مربوط به یک شیفت دیگر بیاید)
      if (String(event.schedule_id) === String(currentScheduleId)) {
        
        // الف: نمایش نوتیفیکیشن موفقیت
        if (event.status === "success") {
            toast.success(event.message || "شیفت‌ها با موفقیت تولید شدند.");
            
            // ب: باطل کردن کش لیست شیفت‌ها (باعث رفرش خودکار جدول می‌شود)
            queryClient.invalidateQueries({ 
                queryKey: ["generatedShifts", Number(currentScheduleId)] 
            });
            
            console.log("[Socket] List invalidated for schedule:", currentScheduleId);
        } else {
            toast.error(event.message || "خطا در تولید شیفت‌ها.");
        }
      }
    });

    // ۵. پاکسازی (Cleanup): قطع اتصال از کانال هنگام Unmount شدن کامپوننت
    return () => {
      console.log(`[Socket] Leaving channel: ${channelName}`);
      echo.leave(channelName);
    };
  }, [currentScheduleId, queryClient]);
};