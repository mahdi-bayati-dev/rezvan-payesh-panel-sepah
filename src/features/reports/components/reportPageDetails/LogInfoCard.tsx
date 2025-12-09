/* reports/components/reportPageDetails/LogInfoCard.tsx */
import type { ActivityLog } from "@/features/reports/types";
import {
    Calendar,
    Clock,
    MapPin,
    Activity,
    Info,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileSignature
} from 'lucide-react';
import { toPersianNumbers } from '@/features/reports/utils/toPersianNumbers';

const InfoBox = ({
    label,
    value,
    icon,
    valueClassName = ""
}: {
    label: string;
    value: string | null | undefined;
    icon: React.ReactNode;
    valueClassName?: string;
}) => {
    if (!value) return null;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD px-1">
                {label}
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD transition-colors hover:bg-secondaryL/30 dark:hover:bg-secondaryD/20">
                <div className="text-muted-foregroundL dark:text-muted-foregroundD opacity-80">
                    {icon}
                </div>
                <span className={`text-sm font-semibold ${valueClassName || 'text-foregroundL dark:text-foregroundD'}`}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* ۱. وضعیت تایید */}
            <InfoBox
                label="وضعیت تایید"
                value={logData.is_allowed ? "تایید شده (مجاز)" : "در انتظار بررسی"}
                icon={
                    logData.is_allowed
                        ? <CheckCircle2 className="w-5 h-5 text-successL-foreground dark:text-successD-foreground" />
                        : <XCircle className="w-5 h-5 text-warningL-foreground dark:text-warningD-foreground" />
                }
                valueClassName={logData.is_allowed ? "text-successL-foreground dark:text-successD-foreground" : "text-warningL-foreground dark:text-warningD-foreground"}
            />

            {/* ۲. نوع فعالیت */}
            <InfoBox
                label="نوع فعالیت"
                value={activityLabelMap[logData.activityType] || logData.activityType}
                icon={<Activity className="w-5 h-5" />}
            />

            {/* ۳. تاریخ */}
            <InfoBox
                label="تاریخ ثبت"
                value={logData.date}
                icon={<Calendar className="w-5 h-5" />}
            />

            {/* ۴. ساعت */}
            <InfoBox
                label="ساعت ثبت"
                value={logData.time}
                icon={<Clock className="w-5 h-5" />}
            />

            {/* ۵. میزان تاخیر */}
            {logData.lateness_minutes > 0 && (
                <InfoBox
                    label="میزان تاخیر"
                    value={`${toPersianNumbers(logData.lateness_minutes)} دقیقه`}
                    icon={<Clock className="w-5 h-5 text-destructiveL-foreground dark:text-destructiveD-foreground" />}
                    valueClassName="text-destructiveL-foreground dark:text-destructiveD-foreground"
                />
            )}

            {/* ۶. میزان تعجیل */}
            {logData.early_departure_minutes > 0 && (
                <InfoBox
                    label="میزان تعجیل"
                    value={`${toPersianNumbers(logData.early_departure_minutes)} دقیقه`}
                    icon={<AlertTriangle className="w-5 h-5 text-warningL-foreground dark:text-warningD-foreground" />}
                    valueClassName="text-warningL-foreground dark:text-warningD-foreground"
                />
            )}

            {/* ۷. نحوه ثبت */}
            <InfoBox
                label="نحوه ثبت"
                value={logData.is_manual ? "ثبت دستی" : "ثبت سیستمی (خودکار)"}
                icon={<FileSignature className="w-5 h-5" />}
            />

            {/* ۸. منبع */}
            <InfoBox
                label="منبع (دستگاه/ناحیه)"
                value={logData.trafficArea}
                icon={<MapPin className="w-5 h-5" />}
            />

            {/* ۹. ملاحظات */}
            {logData.remarks && (
                <div className="sm:col-span-2 lg:col-span-3">
                    <InfoBox
                        label="ملاحظات / توضیحات"
                        value={logData.remarks}
                        icon={<Info className="w-5 h-5" />}
                    />
                </div>
            )}

        </div>
    );
};