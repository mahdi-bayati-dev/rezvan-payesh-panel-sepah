import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import DatePicker, {
    DateObject,
    type DatePickerProps,
} from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type PersianDatePickerProps = Omit<
    DatePickerProps,
    "calendar" | "locale" | "value" | "onChange" | "render"
> & {
    value: DateObject | string | null | undefined;
    onChange: (date: DateObject | null) => void;
    label: string;
    containerClassName?: string;
    inputClassName?: string;
    error?: string;
};

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
    text-sm rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-primaryL 
    block w-full pr-10 p-2.5
    cursor-pointer
    transition-all duration-200
  `;

    const errorStyle = error
        ? "border-destructiveL dark:border-destructiveD focus:ring-destructiveL dark:focus:ring-destructiveD"
        : "";

    return (
        <div className="relative w-full">
            <div className="relative" onClick={openCalendar}>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="w-5 h-5 text-muted-foregroundL dark:text-primaryD" />
                </div>

                <input
                    type="text"
                    readOnly
                    ref={ref}
                    value={value}
                    placeholder={placeholder}
                    className={`${baseInputStyle} ${errorStyle} ${className || ""}`}
                />
            </div>
            {error && (
                <p className="mt-1 text-[10px] text-right text-destructiveL dark:text-destructiveD px-1">
                    {error}
                </p>
            )}
        </div>
    );
});

CustomDatePickerInput.displayName = "CustomDatePickerInput";

const PersianDatePickerInput: React.FC<PersianDatePickerProps> = ({
    value,
    onChange,
    label,
    error,
    containerClassName,
    inputClassName,
    ...props
}) => {

    const dateValue = useMemo(() => {
        if (!value) return null;
        if (value instanceof DateObject) return value;
        return new DateObject(value);
    }, [value]);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold text-right mb-1.5 text-muted-foregroundL dark:text-muted-foregroundD px-1">
                    {label}
                </label>
            )}

            <DatePicker
                value={dateValue}
                onChange={onChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                // ✅ این خط بسیار مهم است: کانتینر داخلی کتابخانه را تمام‌عرض می‌کند
                containerStyle={{
                    width: "100%",
                    display: "block"
                }}
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