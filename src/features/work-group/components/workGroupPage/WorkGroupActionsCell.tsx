import { type WorkGroup } from "@/features/work-group/types/index";
import { useDeleteWorkGroup } from "@/features/work-group/hooks/hook";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, MoreHorizontal } from "lucide-react";

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

// کامپوننت نمایش عملیات (Action Cell) در جدول
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
            },
            onError: (error: any) => {
                if (error.response?.status === 409) {
                    setDeleteError(error.response.data.message || "این گروه کاری به دلیل وجود وابستگی‌ها قابل حذف نیست.");
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-backgroundL-300 dark:hover:bg-backgroundD-900 transition-colors">
                        <span className="sr-only">باز کردن منو</span>
                        <MoreHorizontal className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />
                    </Button>
                </DropdownTrigger>

                {/* ✅ حل خطای TS2322: استفاده از Type Assertion (as any) برای عبور از خطای تایپ DropdownContent */}
                <DropdownContent className="z-50 right-0 transform translate-x-1/2">
                    <DropdownItem
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/work-groups/${workGroup.id}`)}
                    >
                        مشاهده جزئیات
                    </DropdownItem>
                    <DropdownItem
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                title="تأیید حذف گروه کاری"
                message={
                    <>
                        <p className="text-sm">
                            آیا از حذف گروه کاری <strong className="font-bold text-red-600 dark:text-red-400">{workGroup.name}</strong> مطمئن هستید؟
                        </p>
                        <p className="mt-2 text-xs text-muted-foregroundL dark:text-muted-foregroundD">
                            این عمل قابل بازگشت نیست و تمامی وابستگی‌های احتمالی باید قبل از حذف بررسی شوند.
                        </p>
                        {deleteError && (
                            <div className="mt-4">
                                <Alert variant="destructive">
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
            />
        </>
    );
}