"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Link } from 'react-router-dom';
import { User as UserIcon } from "lucide-react";

// (مسیرهای مستعار با حروف کوچک)
import Badge from "@/components/ui/Badge";
import { type BadgeVariant } from "@/components/ui/Badge";
import { type User } from "@/features/User/types";

// ✅ قدم نهایی: ایمپورت کامپوننت مجزایی که ساختیم
// (از مسیر نسبی چون در همین پوشه است)
import ActionsCell from '@/features/User/components/userList/ActionsCell';
// --- مپ کردن نقش‌ها (بدون تغییر) ---
const roleVariantMap: Record<string, BadgeVariant> = {
    "super_admin": "danger",
    "org-admin-l2": "warning",
    "org-admin-l3": "info",
    "user": "default",
};

// --- تعریف ستون‌ها ---
// (این فایل اکنون فقط 'columns' را اکسپورت می‌کند)
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

            return (
                <Link
                    to={`/organizations/users/${user.id}`}
                    className="flex items-center gap-2 group hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondaryL dark:bg-secondaryD group-hover:bg-primaryL/10">
                        <UserIcon className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD group-hover:text-primaryL" />
                    </span>
                    <span className="font-medium group-hover:text-infoD-foreground">{displayName}</span>
                </Link>
            );
        },
    },
    {
        accessorKey: "email",
        header: "ایمیل / نام کاربری",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{user.email}</span>
                    <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">
                        {user.user_name}
                    </span>
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.employee?.position,
        id: "position",
        header: "عنوان شغلی",
        cell: info => info.getValue() || "---",
    },
    {
        accessorFn: (row) => row.employee?.personnel_code,
        id: "personnel_code",
        header: "کد پرسنلی",
        cell: info => info.getValue() || "---",
    },
    {
        id: "roles",
        header: "نقش",
        cell: ({ row }) => {
            if (!row.original.roles || row.original.roles.length === 0) {
                return "---";
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map(role => {
                        const displayLabel = role === "user" ? "کارمند" : role;
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
        // ✅ تابع cell اکنون کامپوننت ActionsCell را رندر می‌کند
        cell: ({ row }) => {
            return <ActionsCell user={row.original} />;
        },
    },
];

