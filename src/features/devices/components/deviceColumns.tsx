
import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "../types";
import Badge from "@/components/ui/Badge"; // فرض می‌کنیم کامپوننت Badge دارید
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
// import { Button } from "@/components/ui/Button"; // برای دکمه‌های عملیات

// این کامپوننت ستون‌های جدول شما را تعریف می‌کند

/**
 * 💡 کامپوننت برای نمایش وضعیت به صورت Badge
 */
const StatusCell = ({ status }: { status: Device["status"] }) => {
    // 💡 منطق اصلاح شده بر اساس دیتای Postman
    const isOnline = status === "online";

    // کامنت: variant ها باید با BadgeProps شما مطابقت داشته باشند
    const variant = isOnline ? "success" : "danger";
    const text = isOnline ? "آنلاین" : status || "آفلاین";



    return (
        <Badge
            label={text}
            variant={variant}
            className="text-xs"
        />
    );
};

export const columns: ColumnDef<Device>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "name",
        header: "نام دستگاه",
        cell: ({ row }) => <div className="text-right">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "registration_area",
        header: "منطقه ثبت",
        cell: ({ row }) => <div className="text-right">{row.getValue("registration_area")}</div>,
    },
    {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusCell status={row.getValue("status")} />,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            // کامنت: افزودن قابلیت مرتب‌سازی به ستون تاریخ
            return (
                <button
                    className="flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    تاریخ ثبت
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            )
        },
        cell: ({ row }) => {
            // کامنت: فرمت کردن تاریخ (می‌توانید از کتابخانه date-fns یا جلالی استفاده کنید)
            const formattedDate = new Date(row.getValue("created_at")).toLocaleDateString("fa-IR");
            return <div className="">{formattedDate}</div>;
        },
    },
    {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => {
            const device = row.original;
            // کامنت: اینجا می‌توانید Dropdown یا دکمه مشاهده جزئیات را قرار دهید
            return (
                <button
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => console.log("مشاهده جزئیات:", device.id)}
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            );
        },
    },
];