// features/requests/components/TableSettingsPage/LeaveTypeRow.tsx
import { Edit, Trash2 } from 'lucide-react';
// ✅ ۱. اصلاح مسیرهای ایمپورت بر اساس ساختار واقعی پروژه شما
import { type LeaveType } from '@/features/requests/api/api-type';
import { useDeleteLeaveType } from '@/features/requests/hook/useLeaveTypes';
import { SpinnerButton } from '@/components/ui/SpinnerButton';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // (این مسیر درست بود)
import { useState } from 'react';
import { toast } from 'react-toastify'; // برای نمایش پیام‌های حذف

interface LeaveTypeRowProps {
    /** آبجکت نوع مرخصی */
    leaveType: LeaveType;
    /** تابعی که هنگام کلیک روی ردیف/دکمه ویرایش صدا زده می‌شود (باز کردن مودال) */
    onSelect: (leaveType: LeaveType) => void;
    /** تابعی که هنگام حذف موفق صدا زده می‌شود (برای پاک کردن سلکشن در والد) */
    onDeleteSuccess: () => void;
    // ✅ پراپ جدید برای هایلایت کردن آیتم انتخاب شده
    isSelected?: boolean; 
}

export const LeaveTypeRow = ({
    leaveType,
    onSelect,
    onDeleteSuccess,
    isSelected = false,
}: LeaveTypeRowProps) => {
    // هوک حذف
    const deleteMutation = useDeleteLeaveType();
    // استیت برای مدال تایید حذف
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // تابع باز کردن مدال
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        
        // اگر فرزند داشت، اجازه حذف نده
        if (leaveType.children && leaveType.children.length > 0) {
            toast.warn("برای حذف این آیتم، ابتدا باید تمام زیرمجموعه‌های آن حذف شوند.");
            return;
        }

        setIsDeleteModalOpen(true);
    };

    // تابع تایید حذف
    const confirmDelete = () => {
        deleteMutation.mutate(leaveType.id, {
            onSuccess: () => {
                onDeleteSuccess(); // به والد اطلاع بده که انتخاب را پاک کند
                setIsDeleteModalOpen(false);
            },
            onError: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };
    
    // ✅ استایل‌های ریسپانسیو جدید برای ردیف
    const rowClasses = `flex items-center justify-between p-3 transition-all cursor-pointer 
        ${isSelected 
            ? 'bg-primaryL/10 dark:bg-primaryD/20 border-r-4 border-primaryL dark:border-primaryD font-semibold' 
            : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`;

    return (
        <>
            <div
                className={rowClasses}
                // هنگام کلیک روی ردیف، مودال ویرایش باز می‌شود
                onClick={() => onSelect(leaveType)}
            >
                <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                    {leaveType.name}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                    {/* ✅ مدیریت لودینگ در خود ردیف */}
                    {deleteMutation.isPending && deleteMutation.variables === leaveType.id ? (
                        <SpinnerButton size="sm" />
                    ) : (
                        <>
                            {/* دکمه ویرایش (اضافی، اما برای UX بهتر حفظ می‌شود) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelect(leaveType); }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                                title="ویرایش"
                            >
                                <Edit size={14} />
                            </button>
                            {/* دکمه حذف */}
                            <button
                                onClick={handleDeleteClick}
                                className={`text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 
                                    ${leaveType.children && leaveType.children.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={leaveType.children && leaveType.children.length > 0 ? "برای حذف ابتدا زیرمجموعه‌ها را حذف کنید" : "حذف"}
                                disabled={!!leaveType.children && leaveType.children.length > 0}
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* مدال تایید حذف */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تایید حذف"
                message={`آیا از حذف "${leaveType.name}" مطمئن هستید؟`}
                confirmText="حذف کن"
                cancelText="لغو"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
};