// features/requests/components/TableSettingsPage/LeaveTypeModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LeaveTypeForm } from './LeaveTypeForm';
import { type LeaveType } from '@/features/requests/api/api-type';

interface LeaveTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    selectedItem: LeaveType | null;
    allLeaveTypes: LeaveType[];
    defaultParent: LeaveType | null; // برای افزودن زیرمجموعه
}

/**
 * کامپوننت مودال برای نمایش فرم ایجاد/ویرایش انواع درخواست مرخصی
 * این کامپوننت فرم LeaveTypeForm را در یک دیالوگ مرکزی نمایش می‌دهد.
 */
export const LeaveTypeModal = ({ 
    isOpen, 
    onClose, 
    selectedItem, 
    allLeaveTypes, 
    defaultParent 
}: LeaveTypeModalProps) => {
    
    // فراخوانی تابع والد برای بستن مودال و پاک کردن stateها
    const handleClose = () => {
        onClose(); 
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Overlay - پس‌زمینه نیمه‌شفاف */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
                </Transition.Child>

                {/* Content - محتوای مودال */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-6 text-right align-middle shadow-xl transition-all border border-borderL dark:border-borderD">
                                
                                {/* فرم اصلی با قابلیت بستن مودال پس از ذخیره */}
                                <LeaveTypeForm
                                    selectedLeaveType={selectedItem}
                                    allLeaveTypes={allLeaveTypes}
                                    onClearSelection={handleClose} // بستن مودال پس از موفقیت یا لغو
                                    defaultParent={defaultParent}
                                />
                                
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};