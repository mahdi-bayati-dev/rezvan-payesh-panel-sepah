import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { useAppSelector } from "@/hook/reduxHooks";

/**
 * کامپوننت ساعت هدر - بهینه شده برای عملکرد بالا
 * ۱. استفاده از Intl.DateTimeFormat کش شده
 * ۲. محاسبه دقیق تیک ثانیه
 */
export const SyncedClock = () => {
    const { timeDiff } = useAppSelector((state) => state.systemCheck);

    // زمان شروع را با اختلاف سرور تنظیم می‌کنیم
    const [currentTime, setCurrentTime] = useState(() => new Date(Date.now() + timeDiff));

    // بهینه‌سازی: ایجاد فرمتر خارج از چرخه رندر اصلی برای جلوگیری از Garbage Collection مداوم
    const timeFormatter = useMemo(() => new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }), []);

    useEffect(() => {
        // ایجاد یک اینتروال دقیق
        // نکته: برای دقت بالاتر در اپلیکیشن‌های حساس، می‌توان اینتروال را روی ۱۰۰ میلی‌ثانیه گذاشت
        // اما برای نمایش ثانیه، ۱۰۰۰ میلی‌ثانیه کافیست.
        const timer = setInterval(() => {
            setCurrentTime(new Date(Date.now() + timeDiff));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeDiff]);

    return (
        <div className="flex items-center gap-1 rounded-lg bg-secondaryL/50 px-1 py-1.5 dark:bg-secondaryD/50 border border-borderL dark:border-borderD transition-colors">
            <Clock size={16} className="text-primaryL dark:text-primaryD animate-pulse" />
            <span className="text-xs  font-bold text-foregroundL dark:text-foregroundD min-w-[65px] text-center">
                {timeFormatter.format(currentTime)}
            </span>
        </div>
    );
};