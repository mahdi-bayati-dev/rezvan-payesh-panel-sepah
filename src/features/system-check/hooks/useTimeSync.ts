import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setChecking,
  setTimeSyncStatus,
} from "@/store/slices/systemCheckSlice";
import axiosInstance from "@/lib/AxiosConfig";

/**
 * هوک بهینه شده برای همگام‌سازی زمان در شبکه داخلی (Intranet)
 * در شبکه داخلی، زمان سرور تنها مرجع معتبر است و تلورانس باید کمتر باشد.
 */
export const useTimeSync = () => {
  const dispatch = useAppDispatch();
  const { isTimeSynced, isChecking, serverTime, timeDiff } = useAppSelector(
    (state) => state.systemCheck
  );

  const isPending = useRef(false);

  const checkTimeSync = useCallback(async () => {
    // جلوگیری از ارسال درخواست‌های همزمان
    if (isPending.current) return;

    isPending.current = true;
    dispatch(setChecking());

    try {
      // ثبت زمان دقیق شروع درخواست (میلی‌ثانیه)
      const startTime = Date.now();

      // دریافت زمان از سرور داخلی
      const response = await axiosInstance.get("/time");
      const data = response.data;

      // ثبت زمان دقیق پایان درخواست
      const endTime = Date.now();

      /**
       * محاسبه Latency (تاخیر شبکه):
       * در شبکه داخلی معمولاً این عدد بسیار ناچیز است، اما محاسبه آن
       * برای دقت میلی‌ثانیه‌ای (به خصوص اگر ترافیک شبکه داخلی بالا باشد) ضروری است.
       */
      const networkLatency = (endTime - startTime) / 2;

      // تخمین زمان واقعی سرور در لحظه رسیدن پاسخ به کلاینت
      const estimatedServerTime = data.timestamp * 1000 + networkLatency;

      // محاسبه اختلاف زمان کلاینت با سرور
      const diff = estimatedServerTime - endTime;

      const MAX_ALLOWED_DIFF = 5 * 60 * 1000; // 5 دقیقه تلورانس

      const isSynced = Math.abs(diff) < MAX_ALLOWED_DIFF;

      dispatch(
        setTimeSyncStatus({
          isSynced: isSynced,
          diff: diff,
          serverTime: data.display_time,
        })
      );
    } catch (error) {
      console.error("❌ [TimeSync] خطا در دسترسی به سرور محلی:", error);

      /**
       * در حالت آفلاین/شبکه داخلی، اگر سرور در دسترس نباشد،
       * نباید فرض کنیم زمان سینک است (برخلاف نسخه‌های اینترنتی).
       * اینجا وضعیت را به صورت غیرسینک نگه می‌داریم تا کاربر متوجه اختلال شود.
       */
      dispatch(
        setTimeSyncStatus({
          isSynced: false, // در شبکه داخلی عدم پاسخ سرور یعنی عدم اطمینان به زمان
          diff: 0,
          serverTime: null,
        })
      );
    } finally {
      isPending.current = false;
    }
  }, [dispatch]);

  return { isTimeSynced, isChecking, checkTimeSync, serverTime, timeDiff };
};
