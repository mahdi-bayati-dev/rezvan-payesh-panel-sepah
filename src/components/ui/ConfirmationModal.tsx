import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { SpinnerButton } from '@/components/ui/SpinnerButton';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    icon?: ReactNode;
    isLoading?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تایید',
    cancelText = 'لغو',
    variant = 'info',
    icon,
    isLoading = false,
}: ConfirmationModalProps) => {
    // (کلاس‌های دکمه‌ها)
    const confirmButtonClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus-visible:ring-yellow-400 text-black',
        info: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white',
        success: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500 text-white',
    }[variant];

    // (آیکون‌های پیش‌فرض)
    const defaultIcon = {
        danger: <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />,
        warning: <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />,
        info: null,
        success: <Check className="h-6 w-6 text-green-600" aria-hidden="true" />,
    }[variant];

    const displayIcon = icon !== undefined ? icon : defaultIcon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                // جلوگیری از بسته شدن هنگام لودینگ
                onClose={isLoading ? () => { } : onClose}
            >
                {/* پس‌زمینه تار */}
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

                {/* محتوای مدال */}
                <div className="fixed inset-0 overflow-y-auto">

                    <div className="flex min-h-full items-end sm:items-center justify-center p-2 sm:p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            // انیمیشن متفاوت برای موبایل (از پایین) و دسکتاپ (زوم)
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >

                            <Dialog.Panel className="w-full max-w-sm sm:max-w-md transform overflow-hidden rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-5 sm:p-6 text-right shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
                                {/* هدر مدال (عنوان و آیکون) */}
                                <div className="flex items-start gap-3 sm:gap-4">
                                    {displayIcon && (
                                        <div className="flex-shrink-0 pt-0.5">{displayIcon}</div>
                                    )}
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-base sm:text-lg font-bold leading-6 text-foregroundL dark:text-foregroundD"
                                        >
                                            {title}
                                        </Dialog.Title>

                                        {/* ✅ تغییر p به div برای رفع خطای Hydration */}
                                        <div className="mt-2 text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                            {message}
                                        </div>
                                    </div>
                                </div>


                                <div className="mt-6 flex flex-col sm:flex-row sm:justify-start gap-3 sm:gap-4">

                                    <button
                                        type="button"
                                        className={`inline-flex w-full sm:w-auto justify-center rounded-md border border-transparent px-5 py-2.5 sm:py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-backgroundD-800 transition-colors ${confirmButtonClasses} disabled:opacity-70 disabled:cursor-wait`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <SpinnerButton size="sm" />
                                        ) : (
                                            <>
                                                <Check className="ml-1 h-4 w-4" />
                                                {confirmText}
                                            </>
                                        )}
                                    </button>

                                    {/* دکمه لغو */}
                                    <button
                                        type="button"
                                        className="inline-flex w-full sm:w-auto justify-center rounded-md border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD-800 px-5 py-2.5 sm:py-2 text-sm font-medium text-foregroundL dark:text-foregroundD hover:bg-secondaryL dark:hover:bg-secondaryD focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-backgroundD-800 transition-colors disabled:opacity-50"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        <X className="ml-1 h-4 w-4" />
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};