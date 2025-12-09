import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    ListboxLabel
} from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export type SelectOption = {
    id: string | number;
    name: string;
    error?: string;
};

interface SelectBoxProps {
    label: string;
    placeholder: string;
    options: SelectOption[];
    value: SelectOption | null;
    onChange: (value: SelectOption) => void;
    disabled?: boolean;
    error?: string;
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
    className = '',
}: SelectBoxProps) => {
    return (
        <Listbox
            as="div"
            className={clsx("w-full", className)}
            // ✅ فیکس نهایی و استاندارد:
            // ما با `as` تایپ را اجبار می‌کنیم تا TS خطا ندهد، اما مقدار واقعی در ران‌تایم همان `null` می‌ماند.
            // این کار باعث می‌شود React همچنان کامپوننت را Controlled ببیند.
            value={value as unknown as SelectOption}
            onChange={onChange}
            disabled={disabled}
            by="id"
        >
            <ListboxLabel className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">
                {label}
            </ListboxLabel>

            <ListboxButton
                className={clsx(
                    "relative w-full cursor-default rounded-lg py-2.5 pr-3 pl-10 text-right border transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD",
                    "bg-backgroundL-500 dark:bg-backgroundD",
                    error
                        ? "border-destructiveL dark:border-destructiveD"
                        : "border-borderL dark:border-borderD"
                )}
            >
                <span className={clsx("block truncate", value ? 'text-foregroundL dark:text-foregroundD' : 'text-muted-foregroundL dark:text-muted-foregroundD')}>
                    {value ? value.name : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ChevronDown
                        className="h-5 w-5 text-muted-foregroundL dark:text-muted-foregroundD"
                        aria-hidden="true"
                    />
                </span>
            </ListboxButton>

            <ListboxOptions
                anchor="bottom"
                transition
                className={clsx(
                    "z-50 w-[var(--button-width)] rounded-md border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD p-1 shadow-lg focus:outline-none",
                    "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                )}
            >
                {options.map((option) => (
                    <ListboxOption
                        key={option.id}
                        value={option}
                        className={({ focus, selected }) =>
                            clsx(
                                "group flex cursor-default items-center gap-2 rounded-md py-2 px-3 select-none",
                                focus ? 'bg-secondaryL dark:bg-secondaryD' : 'text-foregroundL dark:text-foregroundD',
                                selected && 'font-medium'
                            )
                        }
                    >
                        {({ selected }) => (
                            <>
                                <span className="block truncate flex-1">{option.name}</span>
                                {selected && <Check className="w-4 h-4 text-primaryL dark:text-primaryD opacity-70" />}
                            </>
                        )}
                    </ListboxOption>
                ))}
            </ListboxOptions>

            {error && (
                <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                    {error}
                </p>
            )}
        </Listbox>
    );
};

export default SelectBox;