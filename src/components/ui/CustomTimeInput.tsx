import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from '@headlessui/react';
import clsx from 'clsx';

interface CustomTimeInputProps {
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    dir?: string;
    className?: string;
    placeholder?: string;
    error?: boolean;
}

// --- توابع کمکی ---

/**
 * تبدیل اعداد انگلیسی به فارسی فقط برای نمایش
 */
const toPersianDigits = (str: string) => {
    return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

/**
 * پاکسازی و تبدیل ورودی به اعداد انگلیسی برای لاجیک برنامه
 */
const cleanInput = (val: string, maxLength: number, maxVal: number): string => {
    if (!val) return '';

    // ۱. تبدیل اعداد فارسی (۱۲۳) و عربی (١٢٣) به انگلیسی
    const converted = val.replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 1776))
        .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 1632));

    // ۲. حذف هر چیزی غیر از عدد
    const numericVal = converted.replace(/[^0-9]/g, '').slice(0, maxLength);

    if (numericVal === '') return '';

    // ۳. کنترل ماکسیمم (مثلاً ساعت نباید بیشتر از 23 باشد)
    if (numericVal.length === maxLength) {
        const num = parseInt(numericVal, 10);
        if (num > maxVal) return String(maxVal);
    }

    return numericVal;
};

const formatTimePart = (val: string): string => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return '';
    return String(num).padStart(2, '0');
};

export const CustomTimeInput: React.FC<CustomTimeInputProps> = ({
    value,
    onChange,
    disabled = false,
    dir = 'ltr',
    className = '',
    placeholder,
    error = false,
}) => {
    // استیت داخلی همیشه اعداد انگلیسی را نگه می‌دارد
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    const hourRef = useRef<HTMLInputElement>(null);
    const minuteRef = useRef<HTMLInputElement>(null);

    // همگام‌سازی با پراپ value
    useEffect(() => {
        if (value && /^\d{2}:\d{2}$/.test(value)) {
            const [h, m] = value.split(':');
            setHour(h);
            setMinute(m);
        } else {
            setHour('');
            setMinute('');
        }
    }, [value]);

    const triggerChange = (h: string, m: string) => {
        if (h.length === 2 && m.length === 2) {
            onChange(`${h}:${m}`);
        } else {
            onChange(null);
        }
    };

    // --- هندلرها ---

    const handleHourChange = (e: ChangeEvent<HTMLInputElement>) => {
        // cleanInput مقدار را به انگلیسی برمی‌گرداند، حتی اگر کاربر فارسی تایپ کرده باشد
        const val = cleanInput(e.target.value, 2, 23);
        setHour(val);

        if (val.length === 2 && minuteRef.current) {
            triggerChange(val, minute);
            minuteRef.current.focus();
            minuteRef.current.select();
        } else {
            triggerChange(val, minute);
        }
    };

    const handleHourBlur = () => {
        // مقدار DOM ممکن است فارسی باشد، پس اول تمیزش می‌کنیم
        const rawValue = hourRef.current?.value || '';
        const englishValue = cleanInput(rawValue, 2, 23);

        if (englishValue === '') {
            setHour('');
            triggerChange('', minute);
            return;
        }
        if (englishValue.length === 1) {
            const formatted = formatTimePart(englishValue);
            setHour(formatted);
            triggerChange(formatted, minute);
        }
    };

    const handleMinuteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = cleanInput(e.target.value, 2, 59);
        setMinute(val);
        triggerChange(hour, val);
    };

    const handleMinuteBlur = () => {
        const rawValue = minuteRef.current?.value || '';
        const englishValue = cleanInput(rawValue, 2, 59);

        if (englishValue === '') {
            setMinute('');
            triggerChange(hour, '');
            return;
        }
        if (englishValue.length === 1) {
            const formatted = formatTimePart(englishValue);
            setMinute(formatted);
            triggerChange(hour, formatted);
        }
    };

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && minute === '' && hourRef.current) {
            hourRef.current.focus();
            hourRef.current.select();
        }
    };

    let placeholderHour = "HH";
    let placeholderMinute = "mm";
    if (placeholder && /^\d{2}:\d{2}$/.test(placeholder)) {
        [placeholderHour, placeholderMinute] = placeholder.split(':');
    }

    return (
        <div
            className={clsx(
                // استایل‌ها
                "flex w-full items-center justify-center py-2.5 px-3 rounded-lg text-sm transition-colors duration-200",
                "bg-backgroundL-500 text-foregroundL border",
                "dark:bg-backgroundD dark:text-foregroundD",
                error
                    ? "border-destructiveL dark:border-destructiveD"
                    : "border-borderL dark:border-borderD",
                !disabled && !error && "focus-within:ring-2 focus-within:ring-primaryL focus-within:border-transparent dark:focus-within:ring-primaryD",
                !disabled && error && "focus-within:ring-2 focus-within:ring-destructiveL dark:focus-within:ring-destructiveD",
                disabled && "opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-700",
                className
            )}
            dir={dir} // معمولاً برای ساعت LTR بهتر است، اما ارقام فارسی می‌شوند
        >
            <Input
                ref={hourRef}
                type="text"
                inputMode="numeric"
                // ✅ تبدیل به فارسی فقط برای نمایش
                value={toPersianDigits(hour)}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                placeholder={placeholderHour}
                disabled={disabled}
                className="w-9 bg-transparent text-center outline-none p-0 border-none focus:ring-0 placeholder:text-muted-foregroundL dark:placeholder:text-muted-foregroundD text-foregroundL dark:text-foregroundD font-medium"
                maxLength={2}
            />

            <span className={clsx(
                "mx-0.5 pb-0.5 font-bold",
                "text-muted-foregroundL dark:text-muted-foregroundD",
                disabled && 'opacity-50'
            )}>
                :
            </span>

            <Input
                ref={minuteRef}
                type="text"
                inputMode="numeric"
                // ✅ تبدیل به فارسی فقط برای نمایش
                value={toPersianDigits(minute)}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                onKeyDown={handleMinuteKeyDown}
                placeholder={placeholderMinute}
                disabled={disabled}
                className="w-9 bg-transparent text-center outline-none p-0 border-none focus:ring-0 placeholder:text-muted-foregroundL dark:placeholder:text-muted-foregroundD text-foregroundL dark:text-foregroundD font-medium"
                maxLength={2}
            />

            <style>{`
                input[inputmode="numeric"]::-webkit-outer-spin-button,
                input[inputmode="numeric"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[inputmode="numeric"] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};