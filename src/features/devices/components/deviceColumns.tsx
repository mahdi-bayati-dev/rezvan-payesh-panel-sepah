import { type ColumnDef } from "@tanstack/react-table";
import type { Device } from "../types";
import Badge from "@/components/ui/Badge";
import { ArrowUpDown, Wifi, WifiOff } from "lucide-react";
import { toPersianNumber } from '@/features/User/utils/numberHelper';

const StatusCell = ({ status }: { status: Device["status"] }) => {
    const isOnline = status === "online";

    return (
        <div className="flex items-center gap-2">
            {isOnline ? (
                <Wifi className="w-4 h-4 text-successL-foreground dark:text-successD-foreground" />
            ) : (
                <WifiOff className="w-4 h-4 text-destructiveL-foreground dark:text-destructiveD-foreground" />
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
        accessorKey: "source_name",
        header: "نام منبع / دستگاه",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-foregroundL dark:text-foregroundD">
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
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foregroundL hover:text-primaryL transition-colors dark:text-muted-foregroundD dark:hover:text-primaryD"
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
                return <span className="text-muted-foregroundL/70 dark:text-muted-foregroundD/70 text-xs italic">هرگز دیده نشده</span>;
            }

            return (
                <div className="text-xs text-foregroundL dark:text-foregroundD" dir="ltr">
                    {toPersianNumber(rawDate)}
                </div>
            );
        },
    },
];