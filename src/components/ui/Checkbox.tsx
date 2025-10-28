import { Fragment } from 'react';
import { Switch, Transition } from '@headlessui/react';
import { Check } from 'lucide-react'; // آیکون تیک

// ابزار کمکی برای ترکیب کلاس‌های Tailwind (اختیاری ولی مفید)
import clsx from 'clsx';

interface CheckboxProps {
    id?: string; // ID برای اتصال به label
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string; // کلاس‌های اضافی برای div اصلی
}

const Checkbox = ({
    id,
    label,
    checked,
    onCheckedChange,
    disabled = false,
    className,
}: CheckboxProps) => {
    // Headless UI Switch وضعیت داخلی خودش رو مدیریت نمی‌کنه،
    // پس ما از checked و onCheckedChange که از props میان استفاده می‌کنیم.

    return (
        <Switch.Group as="div" className={clsx("flex items-center", className)}>
            <Switch
                id={id}
                checked={checked}
                onChange={onCheckedChange}
                disabled={disabled}
                className={clsx(
                    'relative inline-flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryL focus-visible:ring-opacity-75 dark:focus-visible:ring-primaryD',
                    checked ? 'border-primaryL bg-primaryL dark:border-primaryD dark:bg-primaryD' : 'border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-700',
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                )}
            >
                {/* آیکون تیک که فقط در حالت checked نمایش داده می‌شود */}
                <Transition
                    show={checked}
                    as={Fragment}
                    enter="transition-opacity duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Check className="h-3.5 w-3.5 text-white dark:text-black" strokeWidth={3} />
                </Transition>

            </Switch>
            <Switch.Label as="label" htmlFor={id} className={clsx("ml-2 mr-2 text-sm cursor-pointer select-none", disabled ? 'opacity-50 cursor-not-allowed' : '', 'text-foregroundL dark:text-foregroundD')}>
                {label}
            </Switch.Label>
        </Switch.Group>
    );
};
// کامنت: ایمپورت Fragment و Transition از headlessui/react را اضافه کنید
// import { Fragment } from 'react';
// import { Transition } from '@headlessui/react';


export default Checkbox;
