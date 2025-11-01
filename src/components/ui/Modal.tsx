import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';
import { X } from 'lucide-react';

// --- ۱. اینترفیس اصلی مودال ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    /** (اختیاری) اندازه‌های مختلف مودال */
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// --- ۲. کامپوننت‌های هدر و بدنه (برای راحتی) ---
export const ModalHeader = ({ children, onClose }: { children: ReactNode, onClose: () => void }) => (
    <div className="flex items-start justify-between p-4 border-b border-borderL dark:border-borderD rounded-t">
        {/*
          Dialog.Title برای دسترسی‌پذیری (accessibility) مهم است
          و به Headless UI کمک می‌کند فوکوس را مدیریت کند
        */}
        <Dialog.Title as="div" className="w-full">
            {children}
        </Dialog.Title>
        <button
            type="button"
            className="p-1.5 text-muted-foregroundL dark:text-muted-foregroundD rounded-lg hover:bg-secondaryL dark:hover:bg-secondaryD"
            onClick={onClose}
        >
            <span className="sr-only">بستن مودال</span>
            <X className="h-5 w-5" />
        </button>
    </div>
);

export const ModalBody = ({ children }: { children: ReactNode }) => (
    <div className="p-6 space-y-6">
        {children}
    </div>
);

// --- ۳. کامپوننت اصلی مودال ---
export const Modal = ({
    isOpen,
    onClose,
    children,
    size = 'md',
}: ModalProps) => {
     if (!isOpen) return null;

    // مپ کردن سایز به کلاس‌های Tailwind
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            {/* Dialog اصلی که از Headless UI می‌آید.
              onClose به صورت خودکار با زدن Esc یا کلیک بیرون، فراخوانی می‌شود
            */}
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop (سایه‌ی پشت مودال) */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                {/* کانتینر اصلی مودال (برای وسط‌چین کردن) */}
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
                            {/* پنل اصلی مودال (کارت سفید) */}
                            <Dialog.Panel
                                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl 
                                            bg-backgroundL-500 dark:bg-backgroundD 
                                            text-right shadow-xl transition-all`}
                            >
                                {/* محتوای مودال (که شامل ModalHeader و ModalBody 
                                  می‌شود) اینجا به عنوان children قرار می‌گیرد
                                */}
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


