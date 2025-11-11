// import { Fragment } from 'react';
// ✅ تغییر ۱: Transition دیگر لازم نیست
import { Switch } from '@headlessui/react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface CheckboxProps {
    id?: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

const Checkbox = ({
    id,
    label,
    checked,
    onCheckedChange,
    disabled = false,
    className,
}: CheckboxProps) => {
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
                {/* ✅✅✅ تغییر کلیدی (راه‌حل نهایی) ✅✅✅
                  حذف کامل <Transition> و استفاده از رندر شرطی ساده.
                  این کار خطای مربوط به پراپ 'show' را به طور کامل از بین می‌برد.
                */}
                {checked && (
                    <Check className="h-3.5 w-3.5 text-white dark:text-black" strokeWidth={3} />
                )}

            </Switch>
            <Switch.Label as="label" htmlFor={id} className={clsx("ml-2 mr-2 text-sm cursor-pointer select-none", disabled ? 'opacity-50 cursor-not-allowed' : '', 'text-foregroundL dark:text-foregroundD')}>
                {label}
            </Switch.Label>
        </Switch.Group>
    );
};

export default Checkbox;