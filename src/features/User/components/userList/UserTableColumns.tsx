import { type ColumnDef } from "@tanstack/react-table";
import { Link } from 'react-router-dom';
import { CalendarDays } from "lucide-react"; // آیکون Phone اضافه شد

import Badge from "@/components/ui/Badge";
import { type BadgeVariant } from "@/components/ui/Badge";
import { type User } from "@/features/User/types";

// ✅ ایمپورت کامپوننت استاندارد
import { Avatar } from "@/components/ui/Avatar";
import ActionsCell from '@/features/User/components/userList/ActionsCell';
import { formatDateToPersian } from '@/features/User/utils/dateHelper';
import { getFullImageUrl } from '@/features/User/utils/imageHelper';
import { toPersianNumber } from '@/features/User/utils/numberHelper';

const roleVariantMap: Record<string, BadgeVariant> = {
    "super_admin": "danger",
    "org-admin-l2": "warning",
    "org-admin-l3": "info",
    "user": "default",
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "employee.full_name",
        header: "نام و نام خانوادگی",
        cell: ({ row }) => {
            const user = row.original;
            const firstName = user.employee?.first_name;
            const lastName = user.employee?.last_name;
            const displayName = (firstName || lastName)
                ? `${firstName || ''} ${lastName || ''}`.trim()
                : user.user_name;

            const rawPath = user.employee?.images?.[0]?.url;
            const profileImage = getFullImageUrl(rawPath);

            return (
                <Link
                    to={`/organizations/users/${user.id}`}
                    className="flex items-center gap-3 group hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Avatar
                        src={profileImage}
                        alt={displayName}
                        className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105"
                    />

                    <span className="font-medium group-hover:text-primaryL transition-colors">
                        {displayName}
                    </span>
                </Link>
            );
        },
    },
    {
        // تغییر accessorKey به چیزی که مرتبط‌تر باشه (هرچند برای نمایش مهم نیست، برای سورت ممکنه مهم باشه)
        accessorFn: (row) => row.employee?.phone_number,
        id: "contact_info",
        header: "اطلاعات تماس",
        cell: ({ row }) => {
            const user = row.original;
            const phoneNumber = user.employee?.phone_number;

            return (
                <div className="flex flex-col gap-1">
                    {/* ✅ نمایش شماره موبایل به جای ایمیل */}
                    <div className="flex items-center  gap-1 text-sm font-medium dir-ltr text-right">
                        <span>{phoneNumber ? toPersianNumber(phoneNumber) : '---'}</span>
                        {/* <Phone className="h-3 w-3 text-muted-foregroundL" /> */}
                    </div>

                    <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD dir-ltr text-right">
                        @{user.user_name}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 dir-ltr text-right">
                        ID: {toPersianNumber(user.id)}
                    </span>
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.employee?.position,
        id: "position",
        header: "عنوان شغلی",
        cell: info => info.getValue() || <span className="text-muted-foregroundL/50">---</span>,
    },
    {
        accessorKey: "created_at",
        header: "تاریخ عضویت",
        cell: ({ row }) => {
            return (
                // ✅ اصلاح رنگ در حالت دارک مود (dark:text-muted-foregroundD اضافه شد)
                <div className="flex items-center gap-1 text-xs text-muted-foregroundL dark:text-muted-foregroundD">
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDateToPersian(row.original.created_at, 'short')}</span>
                </div>
            );
        }
    },
    {
        id: "roles",
        header: "نقش‌ها",
        cell: ({ row }) => {
            if (!row.original.roles || row.original.roles.length === 0) {
                return <span className="text-xs text-muted-foregroundL">بدون نقش</span>;
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map(role => {
                        const displayLabel = role === "user" ? "کارمند"
                            : role === "super_admin" ? "ادمین کل"
                                : role === "org-admin-l2" ? "ادمین سازمان"
                                    : role;

                        return (
                            <Badge
                                key={role}
                                label={displayLabel}
                                variant={roleVariantMap[role] || 'default'}
                            />
                        );
                    })}
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => <ActionsCell user={row.original} />,
    },
];