import { type WorkGroup } from "@/features/work-group/types/index";
import { useDeleteWorkGroup } from "@/features/work-group/hooks/hook";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, MoreHorizontal } from "lucide-react"; // آیکون‌ها

// ایمپورت کامپوننت‌های UI شما
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem
} from "@/components/ui/Dropdown";

// این کامپوننت حالا در فایل خودش قرار دارد و به صورت پیش‌فرض اکسپورت می‌شود
export const WorkGroupActionsCell = ({ row }: { row: { original: WorkGroup } }) => {
    const workGroup = row.original;
    const navigate = useNavigate();

    // --- مدیریت حذف ---
    const deleteMutation = useDeleteWorkGroup();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (deleteMutation.isPending) return;
        setDeleteError(null);

        deleteMutation.mutate(workGroup.id, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                // toast.success("گروه کاری با موفقیت حذف شد.");
            },
            onError: (error: any) => {
                if (error.response?.status === 409) {
                    setDeleteError(error.response.data.message);
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">باز کردن منو</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownTrigger>

                <DropdownContent>
                    <DropdownItem
                        icon={<Eye className="h-4 w-4" />}
                        // نکته: مسیر روت شما احتمالاً 'work-groups' (جمع) است
                        onClick={() => navigate(`/work-group/${workGroup.id}`)}
                    >
                        مشاهده
                    </DropdownItem>



                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 dark:text-red-500"
                    >
                        حذف
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>

            {/* مودال تأیید حذف */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="تأیید حذف"
                message={
                    <>
                        <p>
                            آیا از حذف گروه کاری <strong className="font-bold">{workGroup.name}</strong> مطمئن هستید؟
                        </p>
                        <p className="mt-2 text-xs">
                            این عمل قابل بازگشت نیست.
                        </p>



                        {deleteError && (
                            <div className="mt-4">
                                <Alert variant="destructive">
                                    <AlertTitle>خطا در حذف</AlertTitle>
                                    <AlertDescription>{deleteError}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                    </>
                }
                variant="danger"
                confirmText={deleteMutation.isPending ? "در حال حذف..." : "حذف کن"}
                cancelText="انصراف"
            >
                {/* این بخش (children) حذف شد چون کامپوننت شما آن را نمی‌پذیرد
                */}
            </ConfirmationModal>
        </>
    );
}

