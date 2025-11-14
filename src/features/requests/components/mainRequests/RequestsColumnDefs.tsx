// features/requests/components/RequestsColumnDefs.tsx
import { type ColumnDef } from "@tanstack/react-table";
import type { LeaveRequest } from "@/features/requests/types/index";

import ActionsMenuCell from "@/features/requests/components/mainRequests/ActionsMenuCell";
import UserAvatarCell from "@/features/requests/components/mainRequests/UserAvatarCell";
import StatusBadgeCell from "@/features/requests/components/mainRequests/StatusBadgeCell";
import CategoryBadgeCell from "@/features/requests/components/mainRequests/CategoryBadgeCell";
import { format, parseISO } from "date-fns-jalali";


/**
 * تابع کمکی برای تبدیل اعداد انگلیسی به فارسی در یک رشته
 * @param str رشته ورودی (شامل اعداد لاتین)
 * @returns رشته با اعداد فارسی
 */
const toPersianNumbers = (str: string): string => {
    if (!str) return '---';
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = str;
    for (let i = 0; i < 10; i++) {
        // استفاده از ریجکس گلوبال برای جایگزینی تمام تکرارها
        result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
    }
    return result;
};


/**
 * تابع کمکی برای ترجمه عبارت‌های زمان‌بندی انگلیسی به فارسی
 * این تابع '2 days' را به '۲ روز' و '5 hours' را به '۵ ساعت' تبدیل می‌کند.
 * (از toPersianNumbers برای ترجمه اعداد استفاده می‌کند)
 */
const translateDuration = (duration: string): string => {
    if (!duration) return '---';

    // ۱. ترجمه واژه‌های کلیدی
    let translatedDuration = duration
        .replace('day', 'روز')
        .replace('days', 'روز')
        .replace('week', 'هفته')
        .replace('weeks', 'هفته')
        // .replace('hour', 'ساعت')
        .replace('hours', 'ساعت')
        .replace('minute', 'دقیقه')
        .replace('minutes', 'دقیقه')
        .replace('second', 'ثانیه')
        .replace('seconds', 'ثانیه');

    // ۲. تبدیل اعداد لاتین به فارسی
    translatedDuration = toPersianNumbers(translatedDuration);

    // حذف فاصله اضافی قبل از واحد (اگر وجود داشته باشد)
    translatedDuration = translatedDuration.replace(/\s+/g, ' ').trim();

    return translatedDuration;
};


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
            try {
                const date = parseISO(row.original.start_time);
                // ۱. فرمت تاریخ به صورت شمسی-میلادی
                const formatted = format(date, "yyyy/MM/dd - HH:mm");
                // ۲. تبدیل اعداد به فارسی
                return toPersianNumbers(formatted);
            } catch (e) {
                return row.original.start_time;
            }
        },
    },
    {
        accessorKey: "end_time",
        header: "تاریخ پایان",
        cell: ({ row }) => {
            try {
                const date = parseISO(row.original.end_time);
                // ۱. فرمت تاریخ به صورت شمسی-میلادی
                const formatted = format(date, "yyyy/MM/dd - HH:mm");
                // ۲. تبدیل اعداد به فارسی
                return toPersianNumbers(formatted);
            } catch (e) {
                return row.original.end_time;
            }
        },
    },

    // ترجمه مدت زمان (که از تابع جدید استفاده می‌کند)
    {
        accessorKey: "duration_for_humans",
        header: "مدت",
        cell: ({ row }) => {
            return translateDuration(row.original.duration_for_humans);
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