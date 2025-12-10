import { type ColumnDef } from "@tanstack/react-table";
import { type ActivityLog } from "@/features/reports/types/index";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { ScanEye, NotebookPen } from "lucide-react";
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";
import { MyActionsMenuCell } from "./MyActionsMenuCell";


// تابع کمکی برای فرمت زمان
const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${toPersianNumbers(minutes)} دقیقه`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${toPersianNumbers(hours)} ساعت`;
    }

    return `${toPersianNumbers(hours)} ساعت و ${toPersianNumbers(remainingMinutes)} دقیقه`;
};

const activityVariantMap: Record<ActivityLog["activityType"], BadgeVariant> = {
    entry: "success",
    exit: "info",
    delay: "danger",
    haste: "warning",
};

const activityLabelMap: Record<ActivityLog["activityType"], string> = {
    entry: "ورود",
    exit: "خروج",
    delay: "تاخیر",
    haste: "تعجیل",
};

export const myReportsColumns: ColumnDef<ActivityLog>[] = [
    {
        accessorKey: "activityType",
        header: "فعالیت",
        cell: ({ row }) => {
            const type = row.original.activityType;
            return (
                <Badge
                    label={activityLabelMap[type] || type}
                    variant={activityVariantMap[type] || "success"}
                />
            );
        },
    },
    {
        accessorKey: "trafficArea",
        header: "منبع / ناحیه",
        cell: ({ row }) => (
            <span className="text-sm text-foregroundL dark:text-foregroundD">{row.original.trafficArea}</span>
        ),
    },
    {
        accessorKey: "date",
        header: "تاریخ",
        cell: ({ row }) => (
            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD dir-ltr block text-right">
                {row.original.date}
            </span>
        )
    },
    {
        accessorKey: "time",
        header: "ساعت",
        cell: ({ row }) => (
            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD dir-ltr block text-right">
                {row.original.time}
            </span>
        )
    },
    // ✅ ستون تاخیر با هدر و فرمت اصلاح شده
    {
        accessorKey: "lateness_minutes",
        header: "مدت تاخیر",
        cell: ({ row }) => {
            const minutes = row.original.lateness_minutes;

            if (!minutes || minutes === 0) {
                return <span className="text-muted-foregroundL/20 text-xs select-none">---</span>;
            }

            return (
                <span className="text-destructiveL dark:text-destructiveD font-bold bg-destructiveL/10 dark:bg-destructiveD/10 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                    {formatDuration(minutes)}
                </span>
            );
        },
    },
    {
        accessorKey: "is_manual",
        header: "نحوه ثبت",
        cell: ({ row }) => {
            const isManual = row.original.is_manual;
            return isManual ? (
                <div className="flex items-center gap-1.5 text-foregroundL dark:text-foregroundD" title="ثبت دستی توسط کاربر/ادمین">
                    <NotebookPen className="w-4 h-4 text-primaryL dark:text-primaryD" />
                    <span className="text-xs">دستی</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-muted-foregroundL dark:text-muted-foregroundD" title="ثبت خودکار توسط سیستم">
                    <ScanEye className="w-4 h-4 opacity-70" />
                    <span className="text-xs opacity-70">سیستمی</span>
                </div>
            );
        },
    },
    {
        accessorKey: "remarks",
        header: "ملاحظات",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD truncate max-w-[150px] block" title={row.original.remarks || ""}>
                {row.original.remarks || "---"}
            </span>
        ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return <MyActionsMenuCell log={row.original} />;
        },
    },
];