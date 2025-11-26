import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import type { LeaveRequest } from "@/features/requests/types/index";

import ActionsMenuCell from "@/features/requests/components/mainRequests/ActionsMenuCell";
import UserAvatarCell from "@/features/requests/components/mainRequests/UserAvatarCell";
import StatusBadgeCell from "@/features/requests/components/mainRequests/StatusBadgeCell";
import CategoryBadgeCell from "@/features/requests/components/mainRequests/CategoryBadgeCell";
import { format, parseISO } from "date-fns-jalali";

// ✅ تابع کمکی مرکزی برای تبدیل اعداد (بهینه شده)
export const toPersianNumbers = (num: string | number | null | undefined): string => {
    if (num === null || num === undefined) return '---';
    const str = String(num);
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, (d) => persianNumbers[Number(d)]);
};

// تابع کمکی ترجمه مدت زمان
const translateDuration = (duration: string): string => {
    if (!duration) return '---';

    let translatedDuration = duration
        .replace('day', 'روز')
        .replace('days', 'روز')
        .replace('week', 'هفته')
        .replace('weeks', 'هفته')
        .replace('hours', 'ساعت')
        .replace('hour', 'ساعت')
        .replace('minute', 'دقیقه')
        .replace('minutes', 'دقیقه')
        .replace('second', 'ثانیه')
        .replace('seconds', 'ثانیه');

    translatedDuration = toPersianNumbers(translatedDuration);
    translatedDuration = translatedDuration.replace(/\s+/g, ' ').trim();

    return translatedDuration;
};

const DateCell = React.memo(({ isoDate }: { isoDate: string }) => {
    const formattedDate = useMemo(() => {
        try {
            const date = parseISO(isoDate);
            const formatted = format(date, "yyyy/MM/dd - HH:mm");
            return toPersianNumbers(formatted);
        } catch (e) {
            console.log(e);
            return isoDate;
        }
    }, [isoDate]);

    return <span className="text-sm font-medium text-foregroundL dark:text-foregroundD dir-ltr">{formattedDate}</span>;
});

const DurationCell = React.memo(({ duration }: { duration: string }) => {
    const translated = useMemo(() => translateDuration(duration), [duration]);
    return <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">{translated}</span>;
});

export const requestsColumns: ColumnDef<LeaveRequest>[] = [
    {
        accessorKey: "employee",
        header: "درخواست کننده",
        cell: ({ row }) => {
            const employee = row.original.employee;
            const { first_name, last_name, phone_number, images } = employee;
            const fullName = `${first_name} ${last_name}`;

            const explicitAvatar = (employee as any).avatarUrl || (employee as any).avatar;
            const galleryAvatar = images && images.length > 0 ? images[0].url : null;
            const finalAvatarUrl = explicitAvatar || galleryAvatar || null;

            return <UserAvatarCell
                name={fullName}
                // ✅ تبدیل شماره تلفن به فارسی
                phone={toPersianNumbers(phone_number)}
                avatarUrl={finalAvatarUrl}
            />;
        },
    },

    {
        accessorKey: "leave_type",
        header: "نوع مرخصی",
        cell: ({ row }) => {
            return (
                <CategoryBadgeCell
                    leaveType={row.original.leave_type}
                />
            );
        },
    },

    {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
            return <StatusBadgeCell status={row.original.status} />;
        },
    },

    {
        accessorKey: "start_time",
        header: "تاریخ شروع",
        cell: ({ row }) => {
            return <DateCell isoDate={row.original.start_time} />;
        },
    },
    {
        accessorKey: "end_time",
        header: "تاریخ پایان",
        cell: ({ row }) => {
            return <DateCell isoDate={row.original.end_time} />;
        },
    },

    {
        accessorKey: "duration_for_humans",
        header: "مدت زمان",
        cell: ({ row }) => {
            return <DurationCell duration={row.original.duration_for_humans} />;
        }
    },

    {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => {
            return <ActionsMenuCell requestId={row.original.id} />;
        },
    },
];