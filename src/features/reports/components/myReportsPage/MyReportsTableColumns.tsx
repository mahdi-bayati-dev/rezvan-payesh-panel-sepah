import { type ColumnDef } from "@tanstack/react-table";
import { type ActivityLog } from "@/features/reports/types/index";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from "@/components/ui/Dropdown";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { MoreVertical, Eye, ScanEye, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";


// مپ کردن نوع فعالیت
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

// کامپوننت سلول عملیات (مختص کاربر)
const MyActionsMenuCell = ({ log }: { log: ActivityLog }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        // به روت جزئیات "my" هدایت می‌شود
        navigate(`/reports/my/${log.id}`);
    };

    return (
        <div className="text-left">
            <Dropdown>
                <DropdownTrigger>
                    <button
                        type="button"
                        className="p-2 rounded-md hover:bg-secondaryL dark:hover:bg-secondaryD
                         text-muted-foregroundL dark:text-muted-foregroundD transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>
                    {/* در حال حاضر، طبق API، کاربر اقدام دیگری (مثل ویرایش) ندارد */}
                </DropdownContent>
            </Dropdown>
        </div>
    );
};

// تعریف ستون‌ها (مختص کاربر)
export const myReportsColumns: ColumnDef<ActivityLog>[] = [
    // ستون نوع فعالیت
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
    // ستون منبع / ناحیه
    {
        accessorKey: "trafficArea",
        header: "منبع / ناحیه",
        cell: ({ row }) => (
            <span className="text-sm">{row.original.trafficArea}</span>
        ),
    },
    // ستون تاریخ
    {
        accessorKey: "date",
        header: "تاریخ",
    },
    // ستون ساعت
    {
        accessorKey: "time",
        header: "ساعت",
    },
    // [جدید] ستون تاخیر
    {
        accessorKey: "lateness_minutes",
        header: "تاخیر (دقیقه)",
        cell: ({ row }) => {
            const minutes = row.original.lateness_minutes;
            return (
                <span
                    className={
                        minutes > 0
                            ? "text-destructiveL dark:text-destructiveD font-medium"
                            : "text-muted-foregroundL dark:text-muted-foregroundD"
                    }
                >
                    {/* [اصلاح] اعمال تبدیل به فارسی */}
                    {toPersianNumbers(minutes)}
                </span>
            );
        },
    },
    // [جدید] ستون دستی
    {
        accessorKey: "is_manual",
        header: "نحوه ثبت",
        cell: ({ row }) => {
            const isManual = row.original.is_manual;
            return isManual ? (
                < NotebookPen className="w-5 h-5 " />
            ) : (
                < ScanEye className="w-5 h-5" />
            );
        },
    },
    // [جدید] ستون ملاحظات (برای جستجو)
    {
        accessorKey: "remarks",
        header: "ملاحظات",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD truncate max-w-xs">
                {row.original.remarks || "---"}
            </span>
        ),
    },
    // ستون عملیات (مختص کاربر)
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return <MyActionsMenuCell log={row.original} />;
        },
    },
];