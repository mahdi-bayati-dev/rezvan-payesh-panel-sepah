import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/Dropdown";
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
            onError: (error) => { console.error(error); }
        });
    };

    return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondaryL dark:hover:bg-secondaryD rounded-full text-muted-foregroundL dark:text-muted-foregroundD">
                        <span className="sr-only">منوی عملیات</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownTrigger>
                <DropdownContent className="w-48">
                    <DropdownItem icon={<Eye className="h-4 w-4" />} onClick={handleViewProfile}>
                        پرونده الکترونیکی سرباز
                    </DropdownItem>
                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-destructiveL dark:text-destructiveD focus:text-destructiveL focus:bg-destructiveL-background"
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
                        <span className="text-sm text-destructiveL dark:text-destructiveD mt-1 block">این عملیات غیرقابل بازگشت است.</span>
                    </span>
                }
                confirmText={isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
                variant="danger"
            />
        </div>
    );
};

export default ActionsCell;