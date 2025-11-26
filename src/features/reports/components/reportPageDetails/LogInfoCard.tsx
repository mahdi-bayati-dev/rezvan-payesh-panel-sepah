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
            <div className="flex items-center gap-3 p-3 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-zinc-900/50 transition-colors hover:bg-secondaryL/30 dark:hover:bg-zinc-800">
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
                        ? <CheckCircle2 className="w-5 h-5 text-successL dark:text-successD" />
                        : <XCircle className="w-5 h-5 text-warningL dark:text-warningD" />
                }
                valueClassName={logData.is_allowed ? "text-successL dark:text-successD" : "text-warningL dark:text-warningD"}
            />

            {/* ۲. نوع فعالیت */}
            <InfoBox
                label="نوع فعالیت"
                value={activityLabelMap[logData.activityType] || logData.activityType}
                icon={<Activity className="w-5 h-5" />}
            />

            {/* ۳. تاریخ (قبلاً فارسی شده در مپر) */}
            <InfoBox
                label="تاریخ ثبت"
                value={logData.date}
                icon={<Calendar className="w-5 h-5" />}
            />

            {/* ۴. ساعت (قبلاً فارسی شده در مپر) */}
            <InfoBox
                label="ساعت ثبت"
                value={logData.time}
                icon={<Clock className="w-5 h-5" />}
            />

            {/* ۵. میزان تاخیر (فارسی سازی عدد) */}
            {logData.lateness_minutes > 0 && (
                <InfoBox
                    label="میزان تاخیر"
                    value={`${toPersianNumbers(logData.lateness_minutes)} دقیقه`}
                    icon={<Clock className="w-5 h-5 text-destructiveL dark:text-destructiveD" />}
                    valueClassName="text-destructiveL dark:text-destructiveD"
                />
            )}

            {/* ۶. میزان تعجیل (فارسی سازی عدد) */}
            {logData.early_departure_minutes > 0 && (
                <InfoBox
                    label="میزان تعجیل"
                    value={`${toPersianNumbers(logData.early_departure_minutes)} دقیقه`}
                    icon={<AlertTriangle className="w-5 h-5 text-warningL dark:text-warningD" />}
                    valueClassName="text-warningL dark:text-warningD"
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