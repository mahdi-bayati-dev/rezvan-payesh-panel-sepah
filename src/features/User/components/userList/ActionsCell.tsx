"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';

// (مسیرها بر اساس فایل شما - فرض می‌کنم اینها مسیرهای مستعار صحیح شما هستند)
// ✅ اصلاح: استفاده از حروف کوچک برای نام فایل‌ها
import { Button } from "@/components/ui/Button";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem
} from "@/components/ui/Dropdown";
import { type User } from "@/features/User/types";

/**
 * این کامپوننت به صورت مجزا ساخته شده تا بتواند از هوک useNavigate
 * بدون نقض قوانین React (react-hooks/rules-of-hooks) استفاده کند.
 */
const ActionsCell: React.FC<{ user: User }> = ({ user }) => {
    // ✅ هوک useNavigate اکنون در یک کامپوننت React فراخوانی می‌شود
    const navigate = useNavigate();

    const handleViewProfile = () => {
        // (هدایت به صفحه پروفایل کاربر)
        navigate(`/organizations/users/${user.id}`);
    };

    const handleDelete = () => {
        // (شما باید منطق مودال حذف را در اینجا پیاده‌سازی کنید)
        // TODO: Implement delete confirmation modal
        alert(`TODO: Delete user ${user.id}`);
    };

    return (
        <div className="text-left" onClick={(e) => e.stopPropagation()}>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">باز کردن منو</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem
                        icon={<Eye className="h-4 w-4" />}
                        onClick={handleViewProfile}
                    >
                        مشاهده پروفایل
                    </DropdownItem>
                    <DropdownItem
                        icon={<Edit2 className="h-4 w-4" />}
                        // (ویرایش هم به همان صفحه پروفایل می‌رود)
                        onClick={handleViewProfile}
                    >
                        ویرایش کاربر
                    </DropdownItem>
                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={handleDelete}
                        className="text-red-600 dark:text-red-500"
                    >
                        حذف کاربر
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>
        </div>
    );
};

export default ActionsCell;

