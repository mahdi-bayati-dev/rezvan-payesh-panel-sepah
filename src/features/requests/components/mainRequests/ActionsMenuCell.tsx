import { EllipsisVertical, Trash2, Eye } from "lucide-react";
import { useState } from "react"; // ۱. ایمپورت useState
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from "@/components/ui/Dropdown";
import { useNavigate } from "react-router-dom";
// ۲. ایمپورت هوک حذف و مدال تایید
import { useDeleteLeaveRequest } from "@/features/requests/hook/useLeaveRequests";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Spinner } from "@/components/ui/Spinner";

interface ActionsMenuCellProps {
    // ۳. آیدی عددی است
    requestId: number;
}

const ActionsMenuCell = ({ requestId }: ActionsMenuCellProps) => {
    const navigate = useNavigate();
    // ۴. استفاده از هوک حذف
    const deleteMutation = useDeleteLeaveRequest();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ۵. هندلرهای مشاهده و ویرایش (هر دو به صفحه جزئیات می‌روند)
    const handleView = () => {
        navigate(`/requests/${requestId}`);
    };

    // ۶. هندلرهای حذف
    const handleDelete = () => {
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(requestId, {
            onSuccess: () => {
                setIsModalOpen(false);
            },
            onError: () => {
                setIsModalOpen(false); // در صورت خطا هم مدال بسته شود
            }
        });
    };

    if (deleteMutation.isPending) {
        return <Spinner size="sm" />
    }

    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryL dark:focus:ring-offset-backgroundD">
                        <EllipsisVertical className="w-5 h-5" />
                    </button>
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem onClick={handleView} icon={<Eye size={16} />}>
                        مشاهده / ویرایش
                    </DropdownItem>
                    {/* <DropdownItem onClick={handleView} icon={<Pencil size={16} />}>
            ویرایش
          </DropdownItem> */}
                    <DropdownItem
                        onClick={handleDelete} // ۷. اتصال به هندلر حذف
                        className="text-red-600 dark:text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/40"
                        icon={<Trash2 size={16} />}
                    >
                        لغو درخواست
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>

            {/* ۸. مدال تایید حذف */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="تایید لغو درخواست"
                message="آیا از لغو (حذف) این درخواست مطمئن هستید؟ این عملیات قابل بازگشت نیست."
                confirmText="بله، لغو کن"
                cancelText="انصراف"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
};

export default ActionsMenuCell;