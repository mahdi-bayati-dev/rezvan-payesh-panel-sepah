import type { ActivityLog } from "@/features/reports/types";
import {
    Calendar,
    Clock,
    MapPin,
    Activity,
    Info,
    // آیکون‌های جدید
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
// اصلاح: استفاده از مسیر مطلق (Alias) برای جلوگیری از خطای بیلد
import { toPersianNumbers } from '@/features/reports/utils/toPersianNumbers';

const InfoBox = ({
    label,
    value,
    icon,
    valueClassName = "" // پراپ جدید برای رنگ‌بندی متن
}: {
    label: string;
    value: string | null | undefined;
    icon: React.ReactNode;
    valueClassName?: string;
}) => {
    if (!value) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1 px-1">
                {label}
            </label>
            <div className="flex items-center gap-2 p-3 min-h-[42px] rounded-2xl border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
                <div className="text-muted-foregroundL dark:text-muted-foregroundD">
                    {icon}
                </div>
                <span className={`text-sm font-medium ${valueClassName || 'text-foregroundL dark:text-foregroundD'}`}>
                    {value}
                </span>
            </div>
        </div>
    );
};

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
        // گرید ریسپانسیو (تا 4 ستون در سایز بزرگ)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ۱. وضعیت تایید (جدید) */}
            <InfoBox
                label="وضعیت تایید"
                value={logData.is_allowed ? "تایید شده (مجاز)" : "در انتظار بررسی"}
                icon={
                    logData.is_allowed
                        ? <CheckCircle2 className="w-4 h-4 text-successL dark:text-successD" />
                        : <XCircle className="w-4 h-4 text-warningL dark:text-warningD" />
                }
                valueClassName={logData.is_allowed ? "text-successL dark:text-successD" : "text-warningL dark:text-warningD"}
            />

            {/* ۲. نوع فعالیت */}
            <InfoBox
                label="نوع فعالیت"
                value={activityLabelMap[logData.activityType] || logData.activityType}
                icon={<Activity className="w-4 h-4" />}
            />

            {/* ۳. تاریخ */}
            <InfoBox
                label="تاریخ"
                value={logData.date}
                icon={<Calendar className="w-4 h-4" />}
            />

            {/* ۴. ساعت */}
            <InfoBox
                label="ساعت ثبت"
                value={logData.time}
                icon={<Clock className="w-4 h-4" />}
            />

            {/* ۵. میزان تاخیر (فقط اگر وجود داشته باشد) */}
            {logData.lateness_minutes > 0 && (
                <InfoBox
                    label="میزان تاخیر"
                    value={`${toPersianNumbers(logData.lateness_minutes)} دقیقه`}
                    icon={<Clock className="w-4 h-4 text-destructiveL dark:text-destructiveD" />}
                    valueClassName="text-destructiveL dark:text-destructiveD"
                />
            )}

            {/* ۶. میزان تعجیل (فقط اگر وجود داشته باشد) */}
            {logData.early_departure_minutes > 0 && (
                <InfoBox
                    label="میزان تعجیل"
                    value={`${toPersianNumbers(logData.early_departure_minutes)} دقیقه`}
                    icon={<AlertTriangle className="w-4 h-4 text-warningL dark:text-warningD" />}
                    valueClassName="text-warningL dark:text-warningD"
                />
            )}

            {/* ۷. منبع */}
            <InfoBox
                label="منبع (دستگاه/ناحیه)"
                value={logData.trafficArea}
                icon={<MapPin className="w-4 h-4" />}
            />

            {/* ۸. ملاحظات */}
            <InfoBox
                label="ملاحظات / توضیحات"
                value={logData.remarks}
                icon={<Info className="w-4 h-4" />}
            />

        </div>
    );
};