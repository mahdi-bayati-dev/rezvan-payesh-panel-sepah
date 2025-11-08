import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react'; // آیکون برای chevron


export type SelectOption = {
    id: string | number;
    name: string;
    error?: string; // برای نمایش خطای اعتب]%d
};

interface SelectBoxProps {

    label: string;

    placeholder: string;
    /**
     * آرایه‌ای از گزینه‌ها با فرمت SelectOption
     */
    options: SelectOption[];
    /**
     * گزینه‌ی انتخاب شده فعلی (controlled component)
     */
    value: SelectOption | null;

    onChange: (value: SelectOption) => void;
    /**
     * اختیاری: برای غیرفعال کردن سلکت باکس
     */
    disabled?: boolean;
    error?: string;

    // --- ✅ اصلاحیه ۱: افزودن پراپ className ---
    /**
     * برای اعمال کلاس‌های Tailwind سفارشی به عنصر ریشه
     */
    className?: string;

}

const SelectBox = ({
    label,
    placeholder,
    options,
    value,
    error,
    onChange,
    disabled = false,
    className = '', // <-- ✅ اصلاحیه ۲: دریافت className
}: SelectBoxProps) => {
    return (

        // --- ✅ اصلاحیه ۳: اعمال className به عنصر ریشه ---
        // کلاس w-full به صورت پیش‌فرض وجود داشت،
        // ما className دریافتی را به آن اضافه می‌کنیم
        <Listbox
            as="div"
            className={`w-full ${className}`} // <-- اعمال شد
            value={value || undefined}
            onChange={onChange}
            disabled={disabled}
        >


            <Listbox.Label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">
                {label}
            </Listbox.Label>

            {/* ۳. بقیه ساختار داخل یک div قرار می‌گیرد */}
            <div className="relative">
                <Listbox.Button
                    className="relative w-full cursor-default rounded-lg py-2.5 pr-3 pl-10 text-right
                        border border-borderL 
                        bg-backgroundL-500 
                        focus:outline-none focus:ring-2 focus:ring-primaryL
                        dark:border-borderD
                        dark:bg-backgroundD
                        dark:focus:ring-primaryD"
                >
                    <span
                        className={`block truncate ${value ? 'text-foregroundL dark:text-foregroundD' : 'text-muted-foregroundL dark:text-muted-foregroundD'}`}
                    >
                        {value ? value.name : placeholder}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <ChevronDown
                            className="h-5 w-5 text-muted-foregroundL dark:text-muted-foregroundD"
                            aria-hidden="true"
                        />
                    </span>
                </Listbox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md 
                                     py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 
                                     focus:outline-none sm:text-sm
                                     bg-backgroundL-500
                                     dark:bg-backgroundD"
                    >
                        {options.map((option) => (
                            <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 px-4 ${active
                                        ? 'bg-secondaryL text-secondary-foregroundL dark:bg-secondaryD dark:text-secondary-foregroundD'
                                        : 'text-foregroundL dark:text-foregroundD bg-backgroundL-500 dark:bg-backgroundD'
                                    }`
                                }
                                value={option}
                            >
                                {({ selected }) => (
                                    <span
                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                    >
                                        {option.name}
                                    </span>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
            {error && (
                <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                    {error}
                </p>
            )}
        </Listbox>

    );
};

export default SelectBox;