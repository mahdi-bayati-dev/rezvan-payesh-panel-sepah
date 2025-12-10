import { type WorkGroup } from "@/features/work-group/types/index";
import { useDeleteWorkGroup } from "@/features/work-group/hooks/hook";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, MoreHorizontal } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem
} from "@/components/ui/Dropdown";

export const WorkGroupActionsCell = ({ row }: { row: { original: WorkGroup } }) => {
    const workGroup = row.original;
    const navigate = useNavigate();

    const deleteMutation = useDeleteWorkGroup();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState<React.ReactNode | null>(null);

    const handleDelete = async () => {
        if (deleteMutation.isPending) return;
        setDeleteError(null);

        deleteMutation.mutate(workGroup.id, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
            },
            onError: (error: any) => {
                if (error.response?.status === 409) {
                    setDeleteError(
                        <div className="flex flex-col gap-1 text-right">
                            <span className="font-bold">امکان حذف وجود ندارد!</span>
                            <span className="leading-6">
                                ابتدا باید کارمندان این گروه را مدیریت کنید و یا به گروه دیگری منتقل کنید تا بتوانید این گروه را پاک کنید.
                            </span>
                        </div>
                    );
                } else {
                    setDeleteError("خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.");
                }
            }
        });
    };

    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondaryL dark:hover:bg-secondaryD transition-colors">
                        <span className="sr-only">باز کردن منو</span>
                        <MoreHorizontal className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />
                    </Button>
                </DropdownTrigger>

                <DropdownContent className="z-50 right-0 transform translate-x-1/2">
                    <DropdownItem
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/work-groups/${workGroup.id}`)}
                    >
                        مشاهده جزئیات
                    </DropdownItem>
                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => {
                            setDeleteError(null);
                            setShowDeleteConfirm(true);
                        }}
                        className="text-destructiveL dark:text-destructiveD hover:bg-destructiveL-background dark:hover:bg-destructiveD-background"
                    >
                        حذف
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="تأیید حذف گروه کاری"
                message={
                    <>
                        <p className="text-sm">
                            آیا از حذف گروه کاری <strong className="font-bold text-destructiveL dark:text-destructiveD">{workGroup.name}</strong> مطمئن هستید؟
                        </p>
                        <p className="mt-2 text-xs text-muted-foregroundL dark:text-muted-foregroundD">
                            این عمل قابل بازگشت نیست و تمامی وابستگی‌های احتمالی باید قبل از حذف بررسی شوند.
                        </p>
                        {deleteError && (
                            <div className="mt-4">
                                <Alert variant="destructive" className="bg-destructiveL-background dark:bg-destructiveD-background border-destructiveL-foreground/10 text-destructiveL-foreground">
                                    <AlertTitle className="flex items-center">خطا در حذف</AlertTitle>
                                    <AlertDescription className="text-sm">{deleteError}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </>
                }
                variant="danger"
                confirmText={deleteMutation.isPending ? "در حال حذف..." : "حذف کن"}
                cancelText="انصراف"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
}