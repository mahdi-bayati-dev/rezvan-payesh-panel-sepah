"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

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

// ✅ ایمپورت هوک حذف کاربر
import { useDeleteUser } from '@/features/User/hooks/hook'; // (فرض می‌کنیم هوک useDeleteUser وجود دارد یا باید تعریف شود)

// ✅ تعریف ConfirmationModal (فرض می‌کنیم در مسیر عمومی موجود است)
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // (مجدداً، این باید در روت برنامه در دسترس باشد)


/**
 * این کامپوننت به صورت مجزا ساخته شده تا بتواند از هوک useNavigate
 * بدون نقض قوانین React (react-hooks/rules-of-hooks) استفاده کند.
 */
const ActionsCell: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // ✅ فرض می‌کنیم هوک حذف کاربر در User/hooks/hook.ts وجود دارد (در غیر این صورت باید تعریف شود)
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    const handleViewProfile = () => {
        // (هدایت به صفحه پروفایل کاربر)
        navigate(`/organizations/users/${user.id}`);
    };

    // ✅ تابع بازکننده مودال حذف
    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    // ✅ تابع تایید حذف
    const confirmDelete = () => {
        deleteUser(user.id, {
            onSuccess: () => {
                toast.success(`کاربر ${user.user_name} با موفقیت حذف شد.`);
            },
            onError: (error) => {
                // خطای عمومی در هوک مدیریت می‌شود، اینجا فقط یک پیام اضافی می‌دهیم
                toast.error(`خطا در حذف کاربر: ${(error as Error).message}`);
            },
            onSettled: () => setIsDeleteModalOpen(false)
        });
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
                        onClick={handleDelete} // ✅ فراخوانی بازکننده مودال
                        className="text-red-600 dark:text-red-500"
                    >
                        حذف کاربر
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>

            {/* ✅ مودال حذف */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تایید حذف کاربر"
                message={`آیا مطمئنید که می‌خواهید کاربر "${user.user_name}" را حذف کنید؟ این عمل غیرقابل بازگشت است.`}
                confirmText={isDeleting ? 'در حال حذف...' : 'حذف کن'}
                variant="danger"
                icon={<Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />}
            />
        </div>
    );
};

export default ActionsCell;
