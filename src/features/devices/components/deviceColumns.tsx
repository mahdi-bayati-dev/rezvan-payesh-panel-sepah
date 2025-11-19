// src/features/devices/components/deviceColumns.tsx

import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "../types";
import Badge from "@/components/ui/Badge"; // فرض بر وجود کامپوننت Badge
import { ArrowUpDown, Activity, Wifi, WifiOff } from "lucide-react";

/**
 * 💡 کامپوننت سلول وضعیت (جدا شده برای خوانایی بهتر)
 */
const StatusCell = ({ status }: { status: Device["status"] }) => {
    const isOnline = status === "online";
    
    return (
        <div className="flex items-center gap-2">
            {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <Badge
                label={isOnline ? "آنلاین" : "آفلاین"}
                variant={isOnline ? "success" : "danger"}
                className="text-xs px-2 py-0.5"
            />
        </div>
    );
};

/**
 * 💡 تعریف ستون‌های جدول
 */
export const columns: ColumnDef<Device>[] = [
    {
        accessorKey: "name",
        header: "نام دستگاه",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                    {row.getValue("name")}
                </span>
                {/* نمایش API Key به صورت ریز زیر نام برای دسترسی سریع ادمین */}
                <span className="text-[10px] text-gray-400 font-mono">
                    Key: {row.original.api_key}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "source_name",
        header: "موقعیت / منبع",
        cell: ({ row }) => (
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {row.getValue("source_name")}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "وضعیت شبکه",
        cell: ({ row }) => <StatusCell status={row.getValue("status")} />,
    },
    {
        accessorKey: "last_seen",
        // قابلیت مرتب‌سازی برای پیدا کردن دستگاه‌هایی که قطع شده‌اند
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    آخرین رویت
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </button>
            )
        },
        cell: ({ row }) => {
            const rawDate = row.getValue("last_seen") as string;
            
            if (!rawDate || rawDate === "Never") {
                return <span className="text-gray-400 text-xs italic">هرگز دیده نشده</span>;
            }
            
            // نمایش تاریخ به فرمت لوکال و خوانا
            return (
                <div className="text-xs font-mono text-gray-600 dark:text-gray-300" dir="ltr">
                    {rawDate}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => {
            const { health_url, status } = row.original;
            
            // اگر دستگاه آفلاین است یا لینک سلامت ندارد، دکمه غیرفعال نمایش داده شود
            if (status === "offline" || !health_url) {
                return <span className="text-gray-300 text-xs cursor-not-allowed opacity-50">بررسی سلامت</span>;
            }

            return (
                <a
                    href={health_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors border border-blue-200 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100"
                    title="باز کردن لینک سلامت دستگاه"
                >
                    <Activity className="h-3 w-3" />
                    بررسی سلامت
                </a>
            );
        },
    },
];