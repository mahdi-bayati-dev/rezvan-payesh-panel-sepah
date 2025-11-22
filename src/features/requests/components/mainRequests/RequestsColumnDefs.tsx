// features/requests/components/RequestsColumnDefs.tsx

import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react"; // ✅ اضافه کردن React
import type { LeaveRequest } from "@/features/requests/types/index";

import ActionsMenuCell from "@/features/requests/components/mainRequests/ActionsMenuCell";
import UserAvatarCell from "@/features/requests/components/mainRequests/UserAvatarCell";
import StatusBadgeCell from "@/features/requests/components/mainRequests/StatusBadgeCell";
import CategoryBadgeCell from "@/features/requests/components/mainRequests/CategoryBadgeCell";
import { format, parseISO } from "date-fns-jalali";

/**
 * تابع کمکی برای تبدیل اعداد انگلیسی به فارسی در یک رشته
 */
const toPersianNumbers = (str: string): string => {
    if (!str) return '---';
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = str;
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
    }
    return result;
};

/**
 * تابع کمکی برای ترجمه عبارت‌های زمان‌بندی انگلیسی به فارسی
 */
const translateDuration = (duration: string): string => {
    if (!duration) return '---';

    let translatedDuration = duration
        .replace('day', 'روز')
        .replace('days', 'روز')
        .replace('week', 'هفته')
        .replace('weeks', 'هفته')
        .replace('hours', 'ساعت')
        .replace('minute', 'دقیقه')
        .replace('minutes', 'دقیقه')
        .replace('second', 'ثانیه')
        .replace('seconds', 'ثانیه');

    translatedDuration = toPersianNumbers(translatedDuration);
    translatedDuration = translatedDuration.replace(/\s+/g, ' ').trim();

    return translatedDuration;
};

// ✅ [بهینه‌سازی Performance]
// استخراج کامپوننت سلول تاریخ برای جلوگیری از محاسبات تکراری در هر رندر جدول.
// با استفاده از React.memo، این کامپوننت فقط وقتی رندر می‌شود که isoDate تغییر کند.
const DateCell = React.memo(({ isoDate }: { isoDate: string }) => {
    const formattedDate = useMemo(() => {
        try {
            const date = parseISO(isoDate);
            // فرمت تاریخ به صورت شمسی-میلادی
            const formatted = format(date, "yyyy/MM/dd - HH:mm");
            // تبدیل اعداد به فارسی
            return toPersianNumbers(formatted);
        } catch (e) {
            console.log(e);
            
            return isoDate;
        }
    }, [isoDate]);

    return <span>{formattedDate}</span>;
});

// ✅ [بهینه‌سازی Performance]
// کامپوننت memo شده برای مدت زمان
const DurationCell = React.memo(({ duration }: { duration: string }) => {
    const translated = useMemo(() => translateDuration(duration), [duration]);
    return <span>{translated}</span>;
});


// === تعریف ستون‌ها ===

export const requestsColumns: ColumnDef<LeaveRequest>[] = [
    {
        accessorKey: "employee",
        header: "مشخصات",
        cell: ({ row }) => {
            const { first_name, last_name, phone_number } = row.original.employee;
            const fullName = `${first_name} ${last_name}`;

            return <UserAvatarCell
                name={fullName}
                phone={phone_number || '---'}
                avatarUrl={undefined}
            />;
        },
    },

    {
        accessorKey: "leave_type",
        header: "نوع درخواست",
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
            // ✅ استفاده از کامپوننت بهینه شده
            return <DateCell isoDate={row.original.start_time} />;
        },
    },
    {
        accessorKey: "end_time",
        header: "تاریخ پایان",
        cell: ({ row }) => {
            // ✅ استفاده از کامپوننت بهینه شده
            return <DateCell isoDate={row.original.end_time} />;
        },
    },

    {
        accessorKey: "duration_for_humans",
        header: "مدت",
        cell: ({ row }) => {
            // ✅ استفاده از کامپوننت بهینه شده
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