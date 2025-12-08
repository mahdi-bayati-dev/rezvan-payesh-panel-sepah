import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/Button";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem
} from "@/components/ui/Dropdown";
import { type User } from "@/features/User/types";
import { useDeleteUser } from '@/features/User/hooks/hook';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

const ActionsCell: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    const handleViewProfile = () => navigate(`/organizations/users/${user.id}`);

    const confirmDelete = () => {
        deleteUser(user.id, {
            onSuccess: () => {
                toast.success(`کاربر ${user.user_name} حذف شد.`);
                setIsDeleteModalOpen(false);
            },
            onError: (error) => {
                console.error(error);
            }
        });
    };

    return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            {/* ✅ Fix: حذف پراپ‌های open و onOpenChange چون در تایپ Dropdown وجود ندارند */}
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <span className="sr-only">منوی عملیات</span>
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </Button>
                </DropdownTrigger>
                {/* ✅ Fix: حذف align="end" چون در تایپ DropdownContent وجود ندارد */}
                <DropdownContent className="w-48">
                    <DropdownItem icon={<Eye className="h-4 w-4" />} onClick={handleViewProfile}>
                        پرونده الکترونیکی کارمند
                    </DropdownItem>



                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        حذف کاربر
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف کاربر"
                message={
                    <span>
                        آیا مطمئنید می‌خواهید کاربر <strong>{user.user_name}</strong> را حذف کنید؟
                        <br />
                        <span className="text-sm text-red-500 mt-1 block">این عملیات غیرقابل بازگشت است.</span>
                    </span>
                }
                confirmText={isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
                variant="danger"
            />
        </div>
    );
};

export default ActionsCell;