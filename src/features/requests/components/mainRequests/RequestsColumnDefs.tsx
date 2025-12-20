import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import type { LeaveRequest } from "../../types/index";
import ActionsMenuCell from "./ActionsMenuCell";
import UserAvatarCell from "./UserAvatarCell";
import StatusBadgeCell from "./StatusBadgeCell";
import CategoryBadgeCell from "./CategoryBadgeCell";
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export const toPersianNumbers = (num: string | number | null | undefined): string => {
    if (num === null || num === undefined) return '---';
    const str = String(num);
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, (d) => persianNumbers[Number(d)]);
};

/**
 * ✅ اصلاح شده: پارس کردن تاریخ با در نظر گرفتن منطقه زمانی محلی
 */
const parseDateSafe = (dateStr: string): DateObject => {
    if (!dateStr) return new DateObject();

    // تبدیل رشته به آبجکت Date نیتیو (که Timezone را مدیریت می‌کند)
    const localDate = new Date(dateStr);

    // اگر رشته ISO نبود یا خطا داشت، به روش دستی برمی‌گردیم
    if (isNaN(localDate.getTime())) {
        const pureDate = dateStr.substring(0, 10);
        const [y, m, d] = pureDate.split("-").map(Number);
        return new DateObject({ year: y, month: m, day: d, calendar: gregorian, locale: gregorian_en });
    }

    // استخراج اجزاء به وقت محلی سیستم (ایران)
    // این کار باعث می‌شود 20:30 UTC تبدیل به 00:00 روز بعد در تهران شود
    return new DateObject({
        year: localDate.getFullYear(),
        month: localDate.getMonth() + 1,
        day: localDate.getDate(),
        hour: localDate.getHours(),
        minute: localDate.getMinutes(),
        calendar: gregorian,
        locale: gregorian_en
    });
};

const DateCell = React.memo(({ isoDate }: { isoDate: string }) => {
    const formattedDate = useMemo(() => {
        try {
            const dateObj = parseDateSafe(isoDate);
            dateObj.convert(persian, persian_fa);
            return toPersianNumbers(dateObj.format("YYYY/MM/DD - HH:mm"));
        } catch (e) {
            return isoDate;
        }
    }, [isoDate]);

    return <span className="text-sm font-medium text-foregroundL dark:text-foregroundD dir-ltr">{formattedDate}</span>;
});

export const requestsColumns: ColumnDef<LeaveRequest>[] = [
    {
        accessorKey: "employee",
        header: "درخواست کننده",
        cell: ({ row }) => {
            const employee = row.original.employee;
            return <UserAvatarCell name={`${employee.first_name} ${employee.last_name}`} phone={toPersianNumbers(employee.phone_number)} avatarUrl={employee.images?.[0]?.url} />;
        },
    },
    {
        accessorKey: "leave_type",
        header: "نوع مرخصی",
        cell: ({ row }) => <CategoryBadgeCell leaveType={row.original.leave_type} />,
    },
    {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
    {
        accessorKey: "start_time",
        header: "تاریخ شروع",
        cell: ({ row }) => <DateCell isoDate={row.original.start_time} />,
    },
    {
        accessorKey: "end_time",
        header: "تاریخ پایان",
        cell: ({ row }) => <DateCell isoDate={row.original.end_time} />,
    },
    {
        accessorKey: "duration_for_humans",
        header: "مدت زمان",
        cell: ({ row }) => {
            const duration = row.original.duration_for_humans
                .replace('day', 'روز').replace('days', 'روز')
                .replace('hour', 'ساعت').replace('hours', 'ساعت')
                .replace('minute', 'دقیقه').replace('minutes', 'دقیقه');
            return <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">{toPersianNumbers(duration)}</span>;
        }
    },
    {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => <ActionsMenuCell requestId={row.original.id} />,
    },
];