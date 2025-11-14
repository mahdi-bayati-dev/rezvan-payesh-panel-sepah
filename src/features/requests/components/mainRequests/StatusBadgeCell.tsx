import Badge, { type BadgeVariant } from "@/components/ui/Badge";

// ۱. تایپ جدید بر اساس API
export type LeaveRequestStatus = "pending" | "approved" | "rejected";

// ۲. مپینگ جدید مقادیر
const statusToVariantMap: Record<LeaveRequestStatus, BadgeVariant> = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
};

// ۳. مپینگ ترجمه فارسی
const statusToLabelMap: Record<LeaveRequestStatus, string> = {
    approved: "تایید شده",
    pending: "در انتظار",
    rejected: "رد شده",
}

interface StatusBadgeCellProps {
    status: LeaveRequestStatus;
}

const StatusBadgeCell = ({ status }: StatusBadgeCellProps) => {
    const variant = statusToVariantMap[status] || "default";
    const label = statusToLabelMap[status] || status;

    return <Badge label={label} variant={variant} />;
};

export default StatusBadgeCell;