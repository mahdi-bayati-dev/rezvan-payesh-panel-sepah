"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/features/User/types";
import { MoreHorizontal, User as UserIcon, Edit2, Trash2, Eye } from "lucide-react";

// ✅ ۱. ایمپورت کامپوننت‌های UI شما
import { Button } from "@/components/ui/Button";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem
} from "@/components/ui/Dropdown";

// ✅ ۲. ایمپورت کامپوننت Badge شما
// (فرض می‌کنم فایل بج شما در این مسیر است و export default دارد)
import Badge from "@/components/ui/Badge";
import { type BadgeVariant } from "@/components/ui/Badge"; // (ایمپورت تایپ)

/**
 * تعریف ستون‌های جدول کارمندان
 */

// ✅ ۳. مپ کردن نام نقش به ظاهر بج (variant)
// (شما می‌توانید این مپ را طبق سلیقه خودتان تغییر دهید)
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

            // نمایش نام کامل یا نام کاربری در صورت نبودن نام
            const displayName = (firstName || lastName)
                ? `${firstName || ''} ${lastName || ''}`.trim()
                : user.user_name;

            return (
                <div className="flex items-center gap-2">
                    {/* آیکون آواتار موقت */}
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondaryL dark:bg-secondaryD">
                        <UserIcon className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />
                    </span>
                    <span className="font-medium">{displayName}</span>
                </div>
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
        // دسترسی به آبجکت تودرتو
        accessorFn: (row) => row.employee?.position,
        id: "position",
        header: "عنوان شغلی",
        cell: info => info.getValue() || "---", // نمایش "---" اگر تعریف نشده بود
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
            // نمایش نقش‌ها با استایل
            if (!row.original.roles || row.original.roles.length === 0) {
                return "---";
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map(role => {
                        // ✅ ۴. منطق جایگزینی "user" با "کارمند"
                        const displayLabel = role === "user" ? "کارمند" : role;
                        return (
                            <Badge
                                key={role}
                                label={displayLabel}
                                // استفاده از مپ برای تعیین variant،
                                // اگر نقشی در مپ نبود، از 'default' استفاده می‌کند
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
        cell: ({ row }) => {
            const user = row.original;

            // ✅ ۲. استفاده از کامپوننت‌های Dropdown و Button شما
            return (
                <div className="text-left" onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                        <DropdownTrigger>
                            {/* استفاده از کامپوننت Button شما */}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">باز کردن منو</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent>
                            {/* استفاده از کامپوننت DropdownItem شما */}
                            <DropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => alert(`TODO: View user ${user.id}`)}
                            >
                                مشاهده پروفایل
                            </DropdownItem>
                            <DropdownItem
                                icon={<Edit2 className="h-4 w-4" />}
                                onClick={() => alert(`TODO: Edit user ${user.id}`)}
                            >
                                ویرایش کاربر
                            </DropdownItem>
                            <DropdownItem
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => alert(`TODO: Delete user ${user.id}`)}
                                className="text-red-600 dark:text-red-500" // اعمال کلاس سفارشی
                            >
                                حذف کاربر
                            </DropdownItem>
                        </DropdownContent>
                    </Dropdown>
                </div>
            );
        },
    },
];



