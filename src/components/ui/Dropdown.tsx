// src/components/ui/Dropdown.tsx
import { Menu, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

// --- ۱. کامپوننت والد (Wrapper) ---
// این کامپوننت منطق اصلی را نگه می‌دارد
const Dropdown = ({ children }: { children: React.ReactNode }) => {
    return (
        <Menu as="div" className="relative inline-block text-left">
            {children}
        </Menu>
    );
};

// --- ۲. کامپوننت تریگر (دکمه‌ای که منو را باز می‌کند) ---
const DropdownTrigger = ({ children }: { children: React.ReactNode }) => {
    return (
        // از as={Fragment} استفاده می‌کنیم تا دکمه سفارشی خودمان رندر شود
        <Menu.Button as={Fragment}>{children}</Menu.Button>
    );
};

// --- ۳. کامپوننت محتوا (باکس شناور منو) ---
const DropdownContent = ({ children }: { children: React.ReactNode }) => {
    return (
        // Transition برای انیمیشن باز و بسته شدن
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            {/* Menu.Items خود باکسی است که ظاهر می‌شود */}
            <Menu.Items className="absolute z-10 left-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {/* یک div داخلی برای padding */}
                <div className="py-1">{children}</div>
            </Menu.Items>
        </Transition>
    );
};

// --- ۴. کامپوننت آیتم‌های منو (دکمه‌های داخلی) ---
interface DropdownItemProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string; // برای کلاس‌های سفارشی مثل رنگ قرمز
}

const DropdownItem = ({
    children,
    onClick,
    className = '',
}: DropdownItemProps) => {
    return (
        <Menu.Item>
            {/* 'active' به ما می‌گوید که آیا کاربر با ماوس یا کیبورد روی این آیتم hover کرده است
        ما از این برای تغییر 'bg-gray-100' استفاده می‌کنیم
      */}
            {({ active }) => (
                <button
                    onClick={onClick}
                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm text-right ${className}`}
                >
                    {children}
                </button>
            )}
        </Menu.Item>
    );
};

// --- ۵. اکسپورت کردن همه بخش‌ها ---
export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem };