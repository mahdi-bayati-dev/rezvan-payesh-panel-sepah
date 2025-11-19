// src/features/devices/hooks/useDevices.ts

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getDevicesStatus } from "../api/api";
import type { DevicesAPIResponse } from "../types";

// کلیدهای کشینگ برای مدیریت بهتر وضعیت
export const deviceKeys = {
  all: ["devices"] as const,
  status: () => [...deviceKeys.all, "status"] as const,
};

/**
 * 💡 هوک مدیریت دیتای دستگاه‌ها
 * @param refetchInterval زمان رفرش خودکار به میلی‌ثانیه (برای مانیتورینگ) - پیش‌فرض ۳۰ ثانیه
 */
export function useDevices(refetchInterval: number | false = 30000): UseQueryResult<DevicesAPIResponse, Error> {
  return useQuery({
    queryKey: deviceKeys.status(),
    queryFn: getDevicesStatus,
    
    // ✅ تنظیمات بهینه‌سازی برای مانیتورینگ:
    
    // ۱. جلوگیری از درخواست‌های تکراری سریع (تا ۱۰ ثانیه دیتا تازه محسوب می‌شود)
    staleTime: 10 * 1000, 
    
    // ۲. کش کردن دیتا برای ۵ دقیقه (اگر کاربر رفت و برگشت، لودینگ نبیند)
    gcTime: 5 * 60 * 1000, 

    // ۳. تنظیم فاصله زمانی آپدیت خودکار (Polling)
    refetchInterval: refetchInterval,
    
    // ۴. اگر کاربر روی پنجره مرورگر کلیک کرد، دیتا آپدیت شود (اطمینان از تازگی)
    refetchOnWindowFocus: true,
  });
}