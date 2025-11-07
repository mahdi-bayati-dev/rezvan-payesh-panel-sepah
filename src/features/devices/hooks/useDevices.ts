import { useQuery, type UseQueryResult } from "@tanstack/react-query"; // UseQueryResult را ایمپورت کنید
import { getDevices, getDevice } from "../api/api";
import type { Device } from "../types"; // Device type را ایمپورت کنید
// کلیدهای کشینگ React Query
export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  // 💡 کلید لیست را به‌روز می‌کنیم تا شامل pageSize هم باشد
  list: (page: number, pageSize: number) =>
    [...deviceKeys.lists(), { page, pageSize }] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (id: number) => [...deviceKeys.details(), id] as const,
};

/**
 * 💡 هوک سفارشی برای فچ کردن لیست دستگاه‌ها
 * @param page - شماره صفحه (از 1 شروع می‌شود)
 * @param pageSize - تعداد در هر صفحه
 */
export function useDevices(
  page: number,
  pageSize: number
): UseQueryResult<Device[], Error> {
  // 💡 ۱. نوع بازگشتی هوک را مشخص می‌کنیم
  return useQuery<Device[], Error>({
    // 💡 ۲. جنریک‌ها را به useQuery اضافه می‌کنیم
    queryKey: deviceKeys.list(page, pageSize),
    queryFn: () => getDevices(page, pageSize),

    // ❌ آپشن قدیمی در v4
    // keepPreviousData: true,

    // ✅ آپشن جدید در v5 برای جلوگیری از چشمک زدن UI هنگام تغییر صفحه
    placeholderData: (previousData) => previousData, // 💡 ۳. جایگزینی keepPreviousData
  });
}

/**
 * 💡 هوک سفارشی برای فچ کردن جزئیات یک دستگاه
 * @param deviceId - شناسه دستگاه
 */
export function useDevice(deviceId: number) {
  return useQuery({
    // نکته مهم: استفاده از کلید استاندارد و شامل ID دستگاه
    queryKey: deviceKeys.detail(deviceId),
    queryFn: () => getDevice(deviceId),
    // فعال‌سازی کوئری فقط زمانی که deviceId معتبر باشد
    enabled: deviceId > 0,
  });
}
