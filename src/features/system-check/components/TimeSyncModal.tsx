import React, { useEffect, useMemo } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useTimeSync } from "../hooks/useTimeSync";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectLicenseStatus } from "@/store/slices/licenseSlice";
import { selectIsLicenseLocked } from "@/store/slices/authSlice";

export const TimeSyncGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isTimeSynced, isChecking, checkTimeSync } = useTimeSync();

    // دریافت وضعیت لایسنس برای تصمیم‌گیری در مورد نمایش گارد
    const licenseStatus = useAppSelector(selectLicenseStatus);
    const isAuthLocked = useAppSelector(selectIsLicenseLocked);

    // تشخیص معتبر بودن لایسنس
    const isLicenseInvalid = useMemo(() => {
        const invalidStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];
        return isAuthLocked || (licenseStatus && invalidStatuses.includes(licenseStatus));
    }, [licenseStatus, isAuthLocked]);

    useEffect(() => {
        // فقط اگر لایسنس مشکلی نداشت، بررسی زمان را شروع کن
        if (!isLicenseInvalid) {
            checkTimeSync();
            const periodicCheck = setInterval(checkTimeSync, 30 * 60 * 1000);
            return () => clearInterval(periodicCheck);
        }
    }, [checkTimeSync, isLicenseInvalid]);

    // اگر لایسنس نامعتبر است، گارد زمان را کاملاً نادیده بگیر (Pass-through)
    // تا MainLayout بتواند کاربر را به صفحه لایسنس هدایت کند.
    if (isLicenseInvalid) {
        return <>{children}</>;
    }

    if (isChecking && !isTimeSynced) {
        return null; // یا نمایش اسکلتون
    }

    if (!isTimeSynced) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/95 backdrop-blur-md p-4">
                <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800 border border-red-100 dark:border-red-900/20">
                    <div className="bg-red-50 p-8 text-center dark:bg-red-500/10">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                            <Clock className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">اختلاف زمانی شناسایی شد</h2>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            ساعت سیستم شما با ساعت رسمی سرور هماهنگ نیست. برای عملکرد صحیح سیستم، لطفا ساعت خود را تنظیم کنید.
                        </p>
                    </div>

                    <div className="p-8">
                        <button
                            onClick={() => checkTimeSync()}
                            disabled={isChecking}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primaryL p-4 text-sm font-black text-white transition-all hover:bg-primaryL-600 disabled:opacity-50 dark:bg-primaryD"
                        >
                            <RefreshCw className={`h-5 w-5 ${isChecking ? 'animate-spin' : ''}`} />
                            بررسی مجدد تنظیمات
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};