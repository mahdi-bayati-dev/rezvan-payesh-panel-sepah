// features/requests/routes/TableSettingsPage.tsx
import { useState, useMemo } from 'react'; // ✅ useMemo اضافه شد
import { Plus, X, Settings2, Pencil } from 'lucide-react'; // ✅ Settings2 و Pencil اضافه شد
import { useNavigate, Navigate } from 'react-router-dom';

// [مسیرها اصلاح شد]
import { useLeaveTypes } from '../hook/useLeaveTypes';
import { type LeaveType } from '../api/api-type';
// ✅ جایگزینی با کامپوننت مودال
import { LeaveTypeModal } from '../components/TableSettingsPage/LeaveTypeModal';
import { LeaveTypeRow } from '../components/TableSettingsPage/LeaveTypeRow';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { type User } from '@/features/requests/types';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';


const TableSettingsPage = () => {
    const navigate = useNavigate();
    // ✅ ۱. مدیریت انتخاب ریشه (والد اصلی)
    const [selectedRoot, setSelectedRoot] = useState<LeaveType | null>(null);
    // ✅ ۲. مدیریت آیتمی که قرار است در مودال ویرایش/ایجاد شود
    const [selectedItemForModal, setSelectedItemForModal] = useState<LeaveType | null>(null);
    // ✅ ۳. مدیریت وضعیت مودال
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- بررسی دسترسی‌ها (Guard) ---
    const currentUser = useAppSelector(selectUser) as User | null;

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

    // --- ادامه منطق صفحه ---
    const { data: requestTypes, isLoading, isError, error } = useLeaveTypes();

    // ✅ ۴. محاسبه لیست فرزندان برای ستون وسط
    const childrenOfRoot = useMemo(() => {
        if (!selectedRoot || !requestTypes) return [];
        // در این مدل، فرزندان بلافاصله در خود root ذخیره شده‌اند
        return selectedRoot.children || [];
    }, [selectedRoot, requestTypes]);

    // ۵. توابع مدیریت انتخاب (برای ستون ریشه)
    const handleSelectRoot = (root: LeaveType) => {
        setSelectedRoot(root);
        setSelectedItemForModal(null); // پاک کردن آیتم انتخاب شده برای مودال
    };

    // ۶. توابع مدیریت ویرایش (برای ردیف‌ها یا دکمه‌های ویرایش)
    const handleEditItem = (item: LeaveType) => {
        setSelectedItemForModal(item);
        setIsModalOpen(true);

        // اطمینان از اینکه ریشه صحیح انتخاب شده است (اگر آیتم فرزند بود)
        if (item.parent && item.parent.id !== selectedRoot?.id) {
            setSelectedRoot(item.parent);
        } else if (!item.parent_id) {
            // اگر خودش ریشه بود و در ستون ریشه کلیک شده
            setSelectedRoot(item);
        }
    };

    // ✅ ۷. تابع برای پاک کردن انتخاب و بستن مودال (فراخوانی از داخل مودال)
    const clearSelectionAndCloseModal = () => {
        setSelectedItemForModal(null);
        setIsModalOpen(false);
    }

    const handleCancel = () => {
        navigate('/requests'); // بازگشت به لیست
    };

    // ✅ ۸. هندلر برای دکمه "افزودن ریشه جدید"
    const handleAddRootClick = () => {
        // برای ریشه جدید، selectedItemForModal = null و defaultParent = null است
        setSelectedRoot(null);
        setSelectedItemForModal(null);
        setIsModalOpen(true);
    };

    // ✅ ۹. هندلر برای دکمه "افزودن زیرمجموعه" (فرزند برای ریشه انتخاب شده)
    const handleAddChildClick = () => {
        if (!selectedRoot) {
            toast.warn('ابتدا یک دسته بندی (ریشه) را انتخاب کنید.');
            return;
        }
        // ساخت یک آیتم موقت با parent_id تنظیم شده
        setSelectedItemForModal({
            id: -1, // یک ID موقت برای حالت ایجاد
            name: '',
            description: null,
            parent_id: selectedRoot.id,
            parent: selectedRoot,
            children: [],
        } as LeaveType);
        setIsModalOpen(true);
    };

    // --- رندر لیست ریشه‌ها (ستون ۱) ---
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

        return roots.map(rootType => (
            <div
                key={rootType.id}
                // ✅ انتخاب ریشه برای نمایش فرزندان
                onClick={() => handleSelectRoot(rootType)}
                className={`flex items-center justify-between p-3 text-sm font-medium cursor-pointer rounded-lg transition-all 
                    ${selectedRoot?.id === rootType.id
                        ? 'bg-primaryL/10 dark:bg-primaryD/20 border-r-4 border-primaryL dark:border-primaryD'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`
                }
            >
                <span>{rootType.name}</span>
                {/* دکمه ویرایش ریشه در اینجا قرار می‌گیرد */}
                <Button
                    onClick={(e) => { e.stopPropagation(); handleEditItem(rootType); }}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                >
                    <Pencil size={14} className="text-gray-500 dark:text-gray-400" />
                </Button>
            </div>
        ));
    };

    // --- رندر لیست فرزندان (ستون ۲) ---
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
                onSelect={handleEditItem} // اکنون مستقیماً مودال را باز می‌کند
                // onDeleteSuccess نیازی به پاک کردن selectedItem ندارد چون فچ مجدد اتفاق می‌افتد
                onDeleteSuccess={() => { /* no-op or re-fetch logic if needed */ }}
                // ✅ استایل انتخاب برای ویرایش
                isSelected={selectedItemForModal?.id === child.id && selectedItemForModal.id !== -1}
            />
        ));
    };


    return (
        <div className="p-4 sm:p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderL dark:border-borderD">
                <h2 className="text-xl font-bold text-right dark:text-backgroundL-500 flex items-center gap-2">
                    <Settings2 size={24} />
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

            {/* ✅ چیدمان دو ستونه ریسپانسیو (فرم به مودال منتقل شد) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* ستون ۱ (ریشه‌ها - 1/2 یا 1/3 عرض) */}
                <div className="md:col-span-1 flex flex-col gap-4 p-4 border border-borderL dark:border-borderD rounded-lg bg-gray-50 dark:bg-zinc-900">
                    <h3 className="font-bold text-right text-lg">دسته بندی ها (ریشه)</h3>
                    <Button
                        onClick={handleAddRootClick}
                        variant="primary"
                        size="sm"
                        className="flex items-center justify-center gap-1"
                    >
                        <Plus size={16} />
                        افزودن ریشه جدید
                    </Button>
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {renderRootTypesList()}
                    </div>
                </div>

                {/* ستون ۲ (فرزندان - 1/2 یا 2/3 عرض) */}
                <div className="md:col-span-1 lg:col-span-2 flex flex-col gap-4 p-4 border border-borderL dark:border-borderD rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-right text-lg">
                            زیرمجموعه‌های: "{selectedRoot?.name || 'انتخاب نشده'}"
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
                    <div className="flex flex-col border border-borderL dark:border-borderD rounded-lg divide-y divide-borderL dark:divide-borderD max-h-96 overflow-y-auto">
                        {renderChildrenList()}
                    </div>
                </div>
            </div>

            {/* ✅ مودال ایجاد/ویرایش */}
            <LeaveTypeModal
                isOpen={isModalOpen}
                onClose={clearSelectionAndCloseModal}
                selectedItem={selectedItemForModal}
                allLeaveTypes={requestTypes || []}
                defaultParent={selectedRoot} // این فقط در حالت افزودن زیرمجموعه استفاده می‌شود
            />

        </div>
    );
};

export default TableSettingsPage;