import { Menu, Transition } from '@headlessui/react';
import { Fragment, useRef, useState, useLayoutEffect, type ReactNode } from 'react';

// --- ۱. کامپوننت والد (Wrapper) ---
const Dropdown = ({ children }: { children: ReactNode }) => {
    return (
        <Menu as="div" className="relative  inline-block text-left">
            {children}
        </Menu>
    );
};

// --- ۲. کامپوننت تریگر (دکمه بازکننده منو) ---
const DropdownTrigger = ({ children }: { children: ReactNode }) => {
    return <Menu.Button as={Fragment}>{children}</Menu.Button>;
};

// --- ۳. کامپوننت محتوا (باکس شناور هوشمند) ---
const DropdownContent = ({ children }: { children: ReactNode }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

    // از useLayoutEffect برای محاسبات دقیق قبل از نمایش در DOM استفاده می‌کنیم
    useLayoutEffect(() => {
        if (menuRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const { innerHeight } = window;

            // اگر پایین منو از صفحه بیرون زد ولی فضای کافی در بالا هست
            if (menuRect.bottom > innerHeight && menuRect.top > menuRect.height) {
                setPosition('top');
            } else {
                setPosition('bottom');
            }
        }
    }, []);



    const positionClasses = {
        bottom: 'origin-top-left left-0 ',
        top: 'origin-bottom-left left-0 bottom-full mb-2',
    };

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <Menu.Items
                ref={menuRef}
                className={`absolute z-10 w-44 border-0 dark:border-borderD rounded-md shadow-lg bg-white dark:bg-primary-foregroundD ring-1 ring-borderL ring-opacity-5 dark:ring-white/10 focus:outline-none  ${positionClasses[position]}`}
            >
                <div className="py-1">{children}</div>
            </Menu.Items>
        </Transition>
    );
};

// --- ۴. کامپوننت آیتم‌های منو ) ---
interface DropdownItemProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
    icon?: ReactNode;
}

const DropdownItem = ({ children, onClick, className = '', icon }: DropdownItemProps) => {
    return (
        <Menu.Item>
            {({ active }) => (
                <button
                    onClick={onClick}
                    className={`${active ? 'bg-gray-100 dark:bg-zinc-700' : ''
                        } group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 cursor-pointer dark:text-gray-300 text-right transition-colors duration-150 ${className}`}
                >
                    {icon && <span className="text-gray-500 dark:text-gray-400 group-hover:text-current">{icon}</span>}
                    <span>{children}</span>
                </button>
            )}
        </Menu.Item>
    );
};

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem };

