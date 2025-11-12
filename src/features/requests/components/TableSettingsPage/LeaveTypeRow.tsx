// features/requests/components/TableSettingsPage/LeaveTypeRow.tsx
import { Edit, Trash2 } from 'lucide-react';
// ✅ ۱. اصلاح مسیرهای ایمپورت بر اساس ساختار واقعی پروژه شما
import { type LeaveType } from '@/features/requests/api/api';
import { useDeleteLeaveType } from '@/features/requests/hook/useLeaveTypes';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // (این مسیر درست بود)
import { useState } from 'react';

interface LeaveTypeRowProps {
    /** آبجکت نوع مرخصی */
    leaveType: LeaveType;
    /** سطح تو در تو بودن (برای فاصله/padding) */
    level?: number;
    /** تابعی که هنگام کلیک روی دکمه "ویرایش" صدا زده می‌شود */
    onSelect: (leaveType: LeaveType) => void;
    /** تابعی که هنگام کلیک روی دکمه "حذف" صدا زده می‌شود (برای پاک کردن سلکشن) */
    onDeleteSuccess: () => void;
}

export const LeaveTypeRow = ({
    leaveType,
    level = 0,
    onSelect,
    onDeleteSuccess,
}: LeaveTypeRowProps) => {
    // هوک حذف
    const deleteMutation = useDeleteLeaveType();
    // استیت برای مدال تایید حذف
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // تابع باز کردن مدال
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    // تابع تایید حذف
    const confirmDelete = () => {
        // (منطق میوتیشن شما از قبل درست بود)
        deleteMutation.mutate(leaveType.id, {
            onSuccess: () => {
                onDeleteSuccess(); // به والد اطلاع بده که انتخاب را پاک کند
                setIsDeleteModalOpen(false); // مدال را ببند
            },
            onError: () => {
                setIsDeleteModalOpen(false); // در صورت خطا هم مدال را ببند
            }
        });
    };

    return (
        <>
            {/* ردیف اصلی (بدون تغییر) */}
            <div
                className="flex items-center justify-between p-3 border-b border-borderL dark:border-borderD last:border-b-0 hover:bg-secondaryL dark:hover:bg-secondaryD"
                style={{ paddingRight: `${level * 20 + 12}px` }}
            >
                <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">
                    {leaveType.name}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                    {/* ✅ ۲. مدیریت لودینگ در خود ردیف (این از قبل عالی بود) */}
                    {deleteMutation.isPending && deleteMutation.variables === leaveType.id ? (
                        <Spinner size="sm" />
                    ) : (
                        <>
                            <button
                                onClick={() => onSelect(leaveType)}
                                className="text-blue-600 hover:text-blue-800"
                                title="ویرایش"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="text-red-600 hover:text-red-800"
                                title="حذف"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* رندر کردن فرزندان به صورت بازگشتی (بدون تغییر) */}
            {leaveType.children &&
                leaveType.children.length > 0 &&
                leaveType.children.map((child) => (
                    <LeaveTypeRow
                        key={child.id}
                        leaveType={child}
                        level={level + 1}
                        onSelect={onSelect}
                        onDeleteSuccess={onDeleteSuccess}
                    />
                ))}

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
                // ✅ ۳. اتصال وضعیت لودینگ میوتیشن به مدال
                isLoading={deleteMutation.isPending}
            />
        </>
    );
};