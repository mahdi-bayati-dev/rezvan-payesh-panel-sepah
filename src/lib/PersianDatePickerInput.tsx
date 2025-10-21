import React from "react";
import { Calendar } from "lucide-react";
import DatePicker, {
    DateObject,
    type DatePickerProps,
} from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ۱. تایپ‌ها تصحیح شدند
type PersianDatePickerProps = Omit<
    DatePickerProps,
    "calendar" | "locale" | "value" | "onChange" | "render"
> & {
    value: DateObject | null;
    onChange: (date: DateObject | null) => void;
    label: string;
    containerClassName?: string;
    inputClassName?: string;
    error?: string;
};

// کامپONنت داخلی برای نمایش input
const CustomDatePickerInput = React.forwardRef<
    HTMLInputElement,
    {
        value?: string;
        openCalendar: () => void;
        placeholder?: string;
        className?: string;
        error?: string;
    }
>(({ value, openCalendar, placeholder, className, error }, ref) => {

    const baseInputStyle = `
    bg-backgroundL-500 dark:bg-backgroundD 
    border border-borderL dark:border-borderD 
    text-foregroundL dark:text-foregroundD 
    text-sm rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-primaryL 
    block w-full pr-10 p-2.5
    cursor-pointer
    dark:focus:ring-primaryD
  `;


    const errorStyle = error
        ? "border-destructiveL dark:border-destructiveD focus:ring-destructiveL dark:focus:ring-destructiveD"
        : "";

    const combinedClassName = `${baseInputStyle} ${errorStyle} ${className || ""}`
        .trim()
        .replace(/\s+/g, " ");

    return (
        // نکته: نمایش خطا را از div کلیک‌خور خارج کردیم تا بهتر باشد
        <div className="relative w-full">
            <div className="relative" onClick={openCalendar}>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-primaryD" />
                </div>

                <input
                    type="text"
                    readOnly
                    ref={ref}
                    value={value}
                    placeholder={placeholder}
                    className={combinedClassName} // استایل خطا اکنون اعمال می‌شود
                />
            </div>
            {/* پیام خطا در زیر input نمایش داده می‌شود */}
            {error && (
                <p className="mt-1 text-xs text-right text-[color:var(--color-destructiveL)] dark:text-[color:var(--color-destructiveD)]">
                    {error}
                </p>
            )}
        </div>
    );
});

CustomDatePickerInput.displayName = "CustomDatePickerInput";

// کامپوننت اصلی که والد (NewRequestForm) از آن استفاده می‌کند
const PersianDatePickerInput: React.FC<PersianDatePickerProps> = ({
    value,
    onChange,
    label,
    error,
    containerClassName,
    inputClassName,
    ...props
}) => {
    return (
        // یک div برای نگهداری لیبل و DatePicker
        <div className="w-full">

            <label className="block text-sm font-medium text-right mb-1 text-[color:var(--color-foregroundL)] dark:text-[color:var(--color-foregroundD)]">
                {label}
            </label>

            <DatePicker
                value={value}
                onChange={onChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-lift"
                className={containerClassName}
                render={(valueFromDatePicker, openCalendar) => (
                    <CustomDatePickerInput
                        value={valueFromDatePicker}
                        openCalendar={openCalendar}
                        className={inputClassName}
                        placeholder={props.placeholder}
                        error={error}
                    />
                )}
                {...props}
            />


        </div>
    );
};

export default PersianDatePickerInput;