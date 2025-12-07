import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';
import { X } from 'lucide-react';

// --- ۱. اینترفیس اصلی مودال ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    /** (اختیاری) اندازه‌های مختلف مودال */
    // ✅ اضافه شدن سایزهای بزرگتر برای انعطاف‌پذیری بیشتر
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

// --- ۲. کامپوننت‌های هدر و بدنه ---
export const ModalHeader = ({ children, onClose }: { children: ReactNode, onClose: () => void }) => (
    <div className="flex items-start justify-between p-4 border-b border-borderL dark:border-borderD rounded-t-2xl bg-backgroundL-500 dark:bg-backgroundD">
        <Dialog.Title as="div" className="w-full">
            {children}
        </Dialog.Title>
        <button
            type="button"
            className="p-1.5 text-muted-foregroundL dark:text-muted-foregroundD rounded-lg hover:bg-secondaryL dark:hover:bg-secondaryD transition-colors"
            onClick={onClose}
        >
            <span className="sr-only">بستن مودال</span>
            <X className="h-5 w-5" />
        </button>
    </div>
);

export const ModalBody = ({ children }: { children: ReactNode }) => (
    <div className="p-5 space-y-6">
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

    // ✅ مپ کردن سایزهای جدید به کلاس‌های Tailwind
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        'full': 'w-full max-w-[95vw]', // حالت تمام صفحه با کمی فاصله از لبه‌ها
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                {/* کانتینر اصلی مودال */}
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
                            <Dialog.Panel
                                className={`w-full ${sizeClasses[size]} transform rounded-2xl 
                                            bg-backgroundL-500 dark:bg-backgroundD 
                                            text-right shadow-2xl transition-all 
                                            border border-borderL dark:border-borderD
                                            overflow-visible`}
                            >
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};