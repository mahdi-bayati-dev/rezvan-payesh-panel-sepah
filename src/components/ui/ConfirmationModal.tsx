import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react'; // آیکون‌ها برای ظاهر بهتر

interface ConfirmationModalProps {
    /** وضعیت باز یا بسته بودن مدال (توسط والد کنترل می‌شود) */
    isOpen: boolean;
    /** تابعی که هنگام درخواست بسته شدن مدال فراخوانی می‌شود (مثلاً کلیک روی دکمه لغو یا خارج از مدال) */
    onClose: () => void;
    /** تابعی که هنگام کلیک روی دکمه تایید فراخوانی می‌شود */
    onConfirm: () => void;
    /** عنوان مدال */
    title: string;
    /** متن اصلی یا سوال مدال */
    message: string | ReactNode;
    /** متن دکمه تایید (پیش‌فرض: تایید) */
    confirmText?: string;
    /** متن دکمه لغو (پیش‌فرض: لغو) */
    cancelText?: string;
    /** نوع ظاهری مدال (برای استایل‌دهی دکمه تایید) */
    variant?: 'danger' | 'warning' | 'info' | 'success'; // (پیش‌فرض: info)
    /** آیکون دلخواه برای نمایش در کنار عنوان */
    icon?: ReactNode;
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
}: ConfirmationModalProps) => {
    // تعیین استایل دکمه تایید بر اساس variant
    const confirmButtonClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus-visible:ring-yellow-400 text-black',
        info: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white',
        success: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500 text-white',
    }[variant];

    // تعیین آیکون پیش‌فرض بر اساس variant (اگر آیکون سفارشی داده نشده باشد)
    const defaultIcon = {
        danger: <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />,
        warning: <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />,
        info: null, // برای info آیکون پیش‌فرض نمی‌گذاریم
        success: <Check className="h-6 w-6 text-green-600" aria-hidden="true" />,
    }[variant];

    const displayIcon = icon !== undefined ? icon : defaultIcon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
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

                {/* Modal container */}
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-6 text-right shadow-xl transition-all">
                                <div className="flex items-start gap-4">
                                    {/* آیکون */}
                                    {displayIcon && (
                                        <div className="flex-shrink-0">
                                            {displayIcon}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold leading-6 text-foregroundL dark:text-foregroundD"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                </div>


                                {/* دکمه‌ها */}
                                <div className="mt-6 flex justify-start gap-4">
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-backgroundD-800 transition-colors ${confirmButtonClasses}`}
                                        onClick={onConfirm}
                                    >
                                        <Check className="ml-1 h-4 w-4" /> {/* آیکون تایید */}
                                        {confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-borderL dark:border-borderD bg-backgroundL-DEFAULT dark:bg-backgroundD-800 px-4 py-2 text-sm font-medium text-foregroundL dark:text-foregroundD hover:bg-secondaryL dark:hover:bg-secondaryD focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-backgroundD-800 transition-colors"
                                        onClick={onClose}
                                    >
                                        <X className="ml-1 h-4 w-4" /> {/* آیکون لغو */}
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
