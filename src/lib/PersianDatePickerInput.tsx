import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import DatePicker, {
    DateObject,
    type DatePickerProps,
} from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ۱. اصلاح تایپ‌ها برای پشتیبانی از انواع ورودی‌های فرم
type PersianDatePickerProps = Omit<
    DatePickerProps,
    "calendar" | "locale" | "value" | "onChange" | "render"
> & {
    // ✅ اصلاح مهم: ورودی می‌تواند رشته (از دیتابیس)، آبجکت (از پیکر)، یا خالی باشد
    value: DateObject | string | null | undefined;
    onChange: (date: DateObject | null) => void;
    label: string;
    containerClassName?: string;
    inputClassName?: string;
    error?: string;
};

// کامپوننت داخلی برای نمایش input (بدون تغییر در منطق، فقط استایل)
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
                    className={combinedClassName}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                    {error}
                </p>
            )}
        </div>
    );
});

CustomDatePickerInput.displayName = "CustomDatePickerInput";

// کامپوننت اصلی
const PersianDatePickerInput: React.FC<PersianDatePickerProps> = ({
    value,
    onChange,
    label,
    error,
    containerClassName,
    inputClassName,
    ...props
}) => {

    // ✅ منطق تبدیل: اگر مقدار رشته است، به DateObject تبدیل شود تا پیکر بتواند نمایش دهد
    const dateValue = useMemo(() => {
        if (!value) return null;
        if (value instanceof DateObject) return value;
        // اگر رشته است (مثلا "2024-01-01") آن را تبدیل کن
        return new DateObject(value);
    }, [value]);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">
                {label}
            </label>

            <DatePicker
                value={dateValue} // مقدار تبدیل شده را پاس می‌دهیم
                onChange={onChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                className={containerClassName}
                fixMainPosition={true}
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