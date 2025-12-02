// src/features/devices/components/deviceColumns.tsx

import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "../types";
import Badge from "@/components/ui/Badge";
import { ArrowUpDown, Wifi, WifiOff } from "lucide-react";
// ✅ ایمپورت تابع ماژولار تبدیل اعداد فارسی
import { toPersianNumber } from '@/features/User/utils/numberHelper';

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

export const columns: ColumnDef<Device>[] = [
    {
        // تغییر از name به source_name چون در داکیومنت name وجود نداشت
        accessorKey: "source_name",
        header: "نام منبع / دستگاه",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                    {row.getValue("source_name")}
                </span>
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

            return (
                <div className="text-xs text-gray-600 dark:text-gray-300" dir="ltr">
                    {/* ✅ تبدیل رشته زمان به اعداد فارسی */}
                    {toPersianNumber(rawDate)}
                </div>
            );
        },
    },
    // ستون Actions حذف شد چون health_url در ریسپانس داکیومنت وجود ندارد.
    // اگر در آینده اضافه شد، دوباره آن را برمی‌گردانیم.
];