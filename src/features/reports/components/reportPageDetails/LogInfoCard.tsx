// src/features/reports/components/reportPageDetails/LogInfoCard.tsx

import type { ActivityLog } from "@/features/reports/types";
// ۱. آیکون‌ها را برای بهبود UX و راهنمایی بصری ایمپورت می‌کنیم
import { Calendar, Clock, MapPin, Activity } from 'lucide-react';

/**
 * کامپوننت کوچک و داخلی برای نمایش هر باکس اطلاعات
 * این استایل "شبه-اینپوت" را ایجاد می‌کند
 */
const InfoBox = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string;
    icon: React.ReactNode // آیکون اجباری است
}) => (
    <div className="flex flex-col">
        {/* ۲. لیبل در بالای باکس قرار می‌گیرد */}
        <label className="text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1 px-1">
            {label}
        </label>
        {/* ۳. باکس حاوی اطلاعات با استایل شبیه به اینپوت */}
        <div className="flex items-center gap-2 p-3 h-10 rounded-2xl border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
            {/* آیکون با رنگ خنثی */}
            <div className="text-muted-foregroundL dark:text-muted-foregroundD">
                {icon}
            </div>
            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                {value}
            </span>
        </div>
    </div>
);

// ۴. مپ کردن نوع فعالیت به لیبل فارسی
// (نکته حرفه‌ای: می‌توانید این آبجکت را از یک فایل مشترک ایمپورت کنید
// تا بین 'columns.ts' و این فایل تکراری نباشد)
const activityLabelMap: Record<string, string> = {
    entry: 'ورود',
    exit: 'خروج',
    delay: 'تاخیر',
    haste: 'تعجیل',
};

interface LogInfoCardProps {
    logData: ActivityLog;
}

/**
 * کامپوننت ماژولار برای نمایش جزئیات اصلی لاگ فعالیت
 * (با استایل بهبود یافته ۴ باکسی)
 */
export const LogInfoCard = ({ logData }: LogInfoCardProps) => {
    return (
        // ۵. چیدمان گرید ۲x۲
        // (در موبایل ۱ ستونه و در دسکتاپ ۲ ستونه می‌شود)
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <InfoBox
                label="فعالیت"
                // استفاده از مپ برای نمایش فارسی + فال‌بک
                value={activityLabelMap[logData.activityType] || logData.activityType}
                icon={<Activity className="w-4 h-4" />}
            />

            <InfoBox
                label="ناحیه تردد"
                value={logData.trafficArea}
                icon={<MapPin className="w-4 h-4" />}
            />

            <InfoBox
                label="ساعت"
                value={logData.time}
                icon={<Clock className="w-4 h-4" />}
            />

            <InfoBox
                label="تاریخ"
                value={logData.date}
                icon={<Calendar className="w-4 h-4" />}
            />

        </div>
    );
};