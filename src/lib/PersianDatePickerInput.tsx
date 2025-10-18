// src/components/ui/PersianDatePickerInput.tsx

import React from "react";
// کامنت: آیکون Calendar را به اینجا منتقل کردیم
import { Calendar } from "lucide-react";
import DatePicker, { DateObject, type DatePickerProps } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


type PersianDatePickerProps = Omit<
    DatePickerProps,
    "calendar" | "locale" | "value" | "onChange" | "render"
> & {
    value: DateObject | null;
    onChange: (date: DateObject | null) => void;
    containerClassName?: string;
    inputClassName?: string;
};


const CustomDatePickerInput = React.forwardRef<
    HTMLInputElement,
    {
        value?: string;
        openCalendar: () => void; // کامنت: این تابع تقویم را باز می‌کند
        placeholder?: string;
        className?: string;
    }
>(({ value, openCalendar, placeholder, className }, ref) => {

    // کامنت: این استایل‌های ثابت اینپوت شماست
    const baseInputStyle = `
    bg-backgroundL-500 dark:bg-backgroundD 
    border border-borderL dark:border-borderD 
    text-foregroundL dark:text-foregroundD 
    text-sm rounded-lg 
    focus:ring-primaryL focus:border-primaryL 
    block w-full pr-10 p-2.5
    cursor-pointer 
  `;

    const combinedClassName = `${baseInputStyle} ${className || ""}`
        .trim()
        .replace(/\s+/g, " ");

    return (
        <div className="relative w-full" onClick={openCalendar}>

            {/* کامنت: آیکون در داخل همین کامپوننت مدیریت می‌شود */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-primaryD" />
            </div>

            <input
                type="text"
                readOnly // کامنت: کاربر نباید بتواند دستی تایپ کند
                ref={ref}
                value={value}
                placeholder={placeholder}
                className={combinedClassName}
            />
        </div>
    );
});

CustomDatePickerInput.displayName = "CustomDatePickerInput";


const PersianDatePickerInput: React.FC<PersianDatePickerProps> = ({
    value,
    onChange,
    containerClassName,
    inputClassName,
    ...props
}) => {
    return (
        <DatePicker
            value={value}
            onChange={onChange}
            // کامنت: تنظیمات فارسی
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-lift"

            // کامنت: اعمال کلاس به div اصلی کتابخانه (rmdp-container)
            className={containerClassName}

            // کامنت: رندر کردن کامپوننت سفارشی خودمان
            render={(
                valueFromDatePicker,
                openCalendar
            ) => (
                <CustomDatePickerInput
                    value={valueFromDatePicker}
                    openCalendar={openCalendar}
                    className={inputClassName}
                    placeholder={props.placeholder}
                />
            )}

            {...props}
        />
    );
};

export default PersianDatePickerInput;