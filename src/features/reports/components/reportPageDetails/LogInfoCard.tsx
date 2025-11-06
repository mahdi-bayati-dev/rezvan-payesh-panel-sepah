import type { ActivityLog } from "@/features/reports/types";
// ۱. آیکون‌های جدید
import { Calendar, Clock, MapPin, Activity, Info } from 'lucide-react';

const InfoBox = ({
    label,
    value,
    icon
}: {
    label: string;
    value: string | null | undefined; // ۲. مقدار می‌تواند null باشد
    icon: React.ReactNode
}) => {
    // ۳. اگر مقدار وجود ندارد، این باکس را رندر نکن
    if (!value) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1 px-1">
                {label}
            </label>
            <div className="flex items-center gap-2 p-3 min-h-10 rounded-2xl border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
                <div className="text-muted-foregroundL dark:text-muted-foregroundD">
                    {icon}
                </div>
                <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                    {value}
                </span>
            </div>
        </div>
    );
};

// ... مپ‌های activityLabelMap ... (کپی شده از فایل ستون‌ها)
const activityLabelMap: Record<string, string> = {
    entry: 'ورود',
    exit: 'خروج',
    delay: 'تاخیر',
    haste: 'تعجیل',
};


interface LogInfoCardProps {
    logData: ActivityLog;
}

export const LogInfoCard = ({ logData }: LogInfoCardProps) => {
    return (
        // ۴. گرید به ۳ ستون تغییر یافت تا "ملاحظات" هم جا شود
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <InfoBox
                label="فعالیت"
                value={activityLabelMap[logData.activityType] || logData.activityType}
                icon={<Activity className="w-4 h-4" />}
            />

            {/* ۵. ❗️ "ناحیه تردد" به "منبع" تغییر یافت */}
            <InfoBox
                label="منبع (ناحیه)"
                value={logData.trafficArea} // این فیلد اکنون حاوی 'source_name' است
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

            {/* ۶. ❗️ فیلد "ملاحظات" اضافه شد */}
            <InfoBox
                label="ملاحظات (دلیل)"
                value={logData.remarks} // نمایش فیلد جدید
                icon={<Info className="w-4 h-4" />}
            />

        </div>
    );
};