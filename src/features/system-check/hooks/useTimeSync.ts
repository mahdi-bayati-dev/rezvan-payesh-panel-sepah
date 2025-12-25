import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setChecking,
  setTimeSyncStatus,
} from "@/store/slices/systemCheckSlice";
import axiosInstance from "@/lib/AxiosConfig";
import { selectLicenseStatus } from "@/store/slices/licenseSlice";
import { selectIsLicenseLocked } from "@/store/slices/authSlice";

/**
 * هوک بهینه شده برای همگام‌سازی زمان
 * اصلاح شده: اگر لایسنس مشکل داشته باشد، درخواست ارسال نمی‌شود.
 */
export const useTimeSync = () => {
  const dispatch = useAppDispatch();
  const { isTimeSynced, isChecking, serverTime, timeDiff } = useAppSelector(
    (state) => state.systemCheck
  );

  const licenseStatus = useAppSelector(selectLicenseStatus);
  const isAuthLocked = useAppSelector(selectIsLicenseLocked);

  const isPending = useRef(false);

  const checkTimeSync = useCallback(async () => {
    // اگر لایسنس از قبل مشکل دارد یا لاک شده، درخواست زمان نزن
    const invalidStatuses = [
      "expired",
      "tampered",
      "trial_expired",
      "license_expired",
    ];
    if (
      isAuthLocked ||
      (licenseStatus && invalidStatuses.includes(licenseStatus))
    ) {
      return;
    }

    if (isPending.current) return;

    isPending.current = true;
    dispatch(setChecking());

    try {
      const startTime = Date.now();
      const response = await axiosInstance.get("/time");
      const data = response.data;
      const endTime = Date.now();

      const networkLatency = (endTime - startTime) / 2;
      const estimatedServerTime = data.timestamp * 1000 + networkLatency;
      const diff = estimatedServerTime - endTime;

      const MAX_ALLOWED_DIFF = 5 * 60 * 1000;
      const isSynced = Math.abs(diff) < MAX_ALLOWED_DIFF;

      dispatch(
        setTimeSyncStatus({
          isSynced: isSynced,
          diff: diff,
          serverTime: data.display_time,
        })
      );
    } catch (error: any) {
      console.error("❌ [TimeSync] خطا در دریافت زمان:", error);

      // اگر خطا مربوط به لایسنس بود (مثلا ۴۹۹ یا ۴۰۳ لایسنس)، وضعیت را غیر سینک نکن
      // اجازه بده سیستم لایسنس کارش را انجام دهد.
      const isLicenseError =
        error.response?.status === 499 || error.response?.status === 403;

      dispatch(
        setTimeSyncStatus({
          isSynced: isLicenseError ? true : false, // اگر خطای لایسنس بود، گارد زمان را رد کن
          diff: 0,
          serverTime: null,
        })
      );
    } finally {
      isPending.current = false;
    }
  }, [dispatch, licenseStatus, isAuthLocked]);

  return { isTimeSynced, isChecking, checkTimeSync, serverTime, timeDiff };
};
