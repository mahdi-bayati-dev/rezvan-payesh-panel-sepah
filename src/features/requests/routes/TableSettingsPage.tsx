// features/requests/routes/TableSettingsPage.tsx
import { useState, useMemo } from 'react';
import { Plus, X, Settings2, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useLeaveTypes, useDeleteLeaveType } from '../hook/useLeaveTypes';
import { type LeaveType } from '../api/api-type';

import { LeaveTypeModal } from '../components/TableSettingsPage/LeaveTypeModal';
import { LeaveTypeRow } from '../components/TableSettingsPage/LeaveTypeRow';
import { Spinner } from '@/components/ui/Spinner';
import { SpinnerButton } from '@/components/ui/SpinnerButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { type User } from '@/features/requests/types';
import { Button } from '@/components/ui/Button';


const TableSettingsPage = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const [selectedRoot, setSelectedRoot] = useState<LeaveType | null>(null);
    const [selectedItemForModal, setSelectedItemForModal] = useState<LeaveType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // استیت‌های مربوط به حذف
    const [itemToDelete, setItemToDelete] = useState<LeaveType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // --- Hooks ---
    // ✅ نکته مهم: تمام هوک‌ها باید در بالاترین سطح و قبل از هرگونه return اجرا شوند.

    const currentUser = useAppSelector(selectUser) as User | null;

    // می‌توانیم فچ کردن را شرطی کنیم (اختیاری)، اما فراخوانی هوک باید بماند
    // اگر هوک شما آپشن enabled دارد: useLeaveTypes({ enabled: isSuperAdmin })
    const { data: requestTypes, isLoading, isError, error } = useLeaveTypes();
    const deleteMutation = useDeleteLeaveType();


    // ✅ جابجایی useMemo به بالا (قبل از Guard)
    // محاسبه لیست فرزندان برای ستون وسط
    const childrenOfRoot = useMemo(() => {
        if (!selectedRoot || !requestTypes) return [];
        // پیدا کردن نسخه جدید ریشه از لیست آپدیت شده
        const freshRoot = requestTypes.find(r => r.id === selectedRoot.id);
        return freshRoot?.children || [];
    }, [selectedRoot, requestTypes]);


    // --- Guard (بررسی دسترسی) ---
    // ❌ این بلوک قبلاً باعث ارور می‌شد چون بالای useMemo بود.
    // ✅ حالا که تمام هوک‌ها اجرا شده‌اند، می‌توانیم شرط خروج را چک کنیم.
    if (!currentUser || !currentUser.roles.includes('super_admin')) {
        return (
            <div className="p-6 max-w-lg mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطای دسترسی (403)</AlertTitle>
                    <AlertDescription>
                        شما دسترسی لازم (Super Admin) برای مشاهده این صفحه را ندارید.
                        <Navigate to="/requests" replace={true} />
                    </AlertDescription>
                </Alert>
            </div>
        );
    }


    // --- Event Handlers (توابع معمولی مشکلی با ترتیب ندارند) ---

    const handleSelectRoot = (root: LeaveType) => {
        setSelectedRoot(root);
        setSelectedItemForModal(null);
    };

    const handleEditItem = (item: LeaveType) => {
        setSelectedItemForModal(item);
        setIsModalOpen(true);
        if (item.parent && item.parent.id !== selectedRoot?.id) {
            setSelectedRoot(item.parent);
        } else if (!item.parent_id) {
            setSelectedRoot(item);
        }
    };

    const handleDeleteRootClick = (e: React.MouseEvent, root: LeaveType) => {
        e.stopPropagation();

        if (root.children && root.children.length > 0) {
            toast.warn("برای حذف این دسته‌بندی، ابتدا باید تمام زیرمجموعه‌های آن را حذف کنید.");
            return;
        }
        setItemToDelete(root);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRoot = () => {
        if (!itemToDelete) return;

        deleteMutation.mutate(itemToDelete.id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                if (selectedRoot?.id === itemToDelete.id) {
                    setSelectedRoot(null);
                }
            },
            onError: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    const clearSelectionAndCloseModal = () => {
        setSelectedItemForModal(null);
        setIsModalOpen(false);
    }

    const handleCancel = () => {
        navigate('/requests');
    };

    const handleAddRootClick = () => {
        setSelectedRoot(null);
        setSelectedItemForModal(null);
        setIsModalOpen(true);
    };

    const handleAddChildClick = () => {
        if (!selectedRoot) {
            toast.warn('ابتدا یک دسته بندی (ریشه) را انتخاب کنید.');
            return;
        }
        setSelectedItemForModal({
            id: -1,
            name: '',
            description: null,
            parent_id: selectedRoot.id,
            parent: selectedRoot,
            children: [],
        } as LeaveType);
        setIsModalOpen(true);
    };

    // --- Renders ---
    const renderRootTypesList = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-40"><Spinner text="در حال بارگذاری..." /></div>;
        }
        if (isError || !requestTypes) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{(error as Error).message || "خطا در دریافت داده‌ها."}</AlertDescription>
                </Alert>
            );
        }

        const roots = requestTypes.filter(lt => !lt.parent_id);

        return roots.map(rootType => {
            const isSelected = selectedRoot?.id === rootType.id;
            const hasChildren = rootType.children && rootType.children.length > 0;

            return (
                <div
                    key={rootType.id}
                    onClick={() => handleSelectRoot(rootType)}
                    className={`group flex items-center justify-between p-3 text-sm font-medium cursor-pointer rounded-lg transition-all duration-200
                        ${isSelected
                            ? 'bg-primaryL/10 dark:bg-primaryD/20 border-r-4 border-primaryL dark:border-primaryD text-primaryL dark:text-primaryD'
                            : 'hover:bg-white/60 dark:hover:bg-white/5 text-foregroundL dark:text-gray-300 border-r-4 border-transparent'}`
                    }
                >
                    <span className="truncate">{rootType.name}</span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                            onClick={(e) => { e.stopPropagation(); handleEditItem(rootType); }}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/30 dark:text-blue-400"
                            title="ویرایش نام"
                        >
                            <Pencil size={14} />
                        </Button>

                        {deleteMutation.isPending && deleteMutation.variables === rootType.id ? (
                            <SpinnerButton size="sm" />
                        ) : (
                            <Button
                                onClick={(e) => handleDeleteRootClick(e, rootType)}
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-full transition-colors
                                    ${hasChildren
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'hover:bg-red-100 text-red-500 dark:hover:bg-red-900/30 dark:text-red-400'
                                    }`}
                                disabled={hasChildren}
                                title={hasChildren ? "حذف غیرفعال (دارای زیرمجموعه)" : "حذف دسته‌بندی"}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                </div>
            );
        });
    };

    const renderChildrenList = () => {
        if (!selectedRoot) return <p className="text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD py-10">
            برای مشاهده زیرمجموعه‌ها، یک ریشه را از ستون کناری انتخاب کنید.
        </p>;

        if (childrenOfRoot.length === 0) return <p className="text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD py-10">
            {`ریشه "${selectedRoot.name}" زیرمجموعه‌ای ندارد. یک زیرمجموعه اضافه کنید.`}
        </p>;

        return childrenOfRoot.map(child => (
            <LeaveTypeRow
                key={child.id}
                leaveType={child}
                onSelect={handleEditItem}
                onDeleteSuccess={() => { /* React Query handles refetch */ }}
                isSelected={selectedItemForModal?.id === child.id && selectedItemForModal.id !== -1}
            />
        ));
    };


    return (
        <div className="p-4 sm:p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm  mx-auto min-h-[600px]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderL dark:border-borderD">
                <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD flex items-center gap-2">
                    <Settings2 size={24} className="text-primaryL dark:text-primaryD" />
                    تنظیمات انواع درخواست
                </h2>
                <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <X size={16} />
                    بازگشت
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* ستون ۱ (ریشه‌ها) */}
                <div className="md:col-span-1 flex flex-col gap-4 p-4 border border-borderL dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-right text-lg text-foregroundL dark:text-gray-200">دسته بندی ها</h3>
                        <span className="text-xs text-muted-foregroundL dark:text-gray-500 px-2 py-1 bg-white dark:bg-zinc-800 rounded-full border dark:border-zinc-700">
                            {requestTypes?.filter(t => !t.parent_id).length || 0} مورد
                        </span>
                    </div>

                    <Button
                        onClick={handleAddRootClick}
                        variant="primary"
                        size="sm"
                        className="flex items-center justify-center gap-1 w-full py-2.5 rounded-xl shadow-sm shadow-primaryL/20"
                    >
                        <Plus size={16} />
                        افزودن ریشه جدید
                    </Button>

                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                        {renderRootTypesList()}
                    </div>
                </div>

                {/* ستون ۲ (فرزندان) */}
                <div className="md:col-span-1 lg:col-span-2 flex flex-col gap-4 p-4 border border-borderL dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/10">
                    <div className="flex justify-between items-center pb-2">
                        <h3 className="font-bold text-right text-lg flex items-center gap-2 text-foregroundL dark:text-gray-200">
                            <span className="text-muted-foregroundL dark:text-gray-500 text-sm font-normal">زیرمجموعه‌های:</span>
                            "{selectedRoot?.name || '---'}"
                        </h3>
                        {selectedRoot && (
                            <Button
                                onClick={handleAddChildClick}
                                variant="secondary"
                                size="sm"
                                className="flex items-center justify-center gap-1"
                                disabled={isLoading}
                            >
                                <Plus size={16} />
                                افزودن زیرمجموعه
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col border border-borderL dark:border-zinc-800 rounded-xl divide-y divide-borderL dark:divide-zinc-800 max-h-[500px] overflow-y-auto bg-backgroundL-500 dark:bg-backgroundD">
                        {renderChildrenList()}
                    </div>
                </div>
            </div>

            <LeaveTypeModal
                isOpen={isModalOpen}
                onClose={clearSelectionAndCloseModal}
                selectedItem={selectedItemForModal}
                allLeaveTypes={requestTypes || []}
                defaultParent={selectedRoot}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteRoot}
                title="حذف دسته‌بندی اصلی"
                message={`آیا از حذف دسته‌بندی "${itemToDelete?.name}" مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

        </div>
    );
};

export default TableSettingsPage;