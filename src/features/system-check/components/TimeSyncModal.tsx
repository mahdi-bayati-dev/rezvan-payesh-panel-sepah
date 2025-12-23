import React, { useEffect } from "react";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useTimeSync } from "../hooks/useTimeSync";

export const TimeSyncGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isTimeSynced, isChecking, checkTimeSync } = useTimeSync();

    useEffect(() => {
        // اولین بررسی در هنگام لود برنامه
        checkTimeSync();

        // بهینه‌سازی: بررسی مجدد زمان هر ۳۰ دقیقه برای جلوگیری از Drift ساعت کلاینت
        const periodicCheck = setInterval(checkTimeSync, 30 * 60 * 1000);

        return () => clearInterval(periodicCheck);
    }, [checkTimeSync]);

    if (isChecking && !isTimeSynced) {
        // نمایش اسکلتون یا لودینگ در اولین بررسی اگر ساعت سینک نیست
        return null;
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
                            ساعت سیستم شما با ساعت رسمی سرور هماهنگ نیست. برای امنیت تراکنش‌ها و ثبت دقیق حضور، لطفاً تنظیمات تاریخ و ساعت گوشی یا کامپیوتر خود را روی
                            <span className="font-bold text-red-600 dark:text-red-400"> "تنظیم خودکار" </span>
                            قرار دهید.
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>بدون اصلاح زمان، امکان دسترسی به بخش‌های حساس پنل وجود ندارد.</p>
                        </div>

                        <button
                            onClick={() => checkTimeSync()}
                            disabled={isChecking}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primaryL p-4 text-sm font-black text-white transition-all hover:bg-primaryL-600 active:scale-95 disabled:opacity-50 dark:bg-primaryD"
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