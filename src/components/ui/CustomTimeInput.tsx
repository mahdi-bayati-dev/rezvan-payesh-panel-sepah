import React, { useState, useEffect, useRef } from 'react';
// ایمپورت تایپ به صورت جداگانه برای verbatimModuleSyntax
import type { ChangeEvent } from 'react';
import { Input } from '@headlessui/react';

interface CustomTimeInputProps {
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    dir?: string;
    className?: string;
    placeholder?: string;
}

/**
 * کامنت: این تابع اعداد فارسی و عربی را به انگلیسی تبدیل می‌کند
 * و ورودی را تمیز و اعتبارسنجی می‌کند.
 */
const cleanInput = (val: string, maxLength: number, maxVal: number): string => {
    if (!val) return '';

    // ۱. تبدیل اعداد فارسی (۱۲۳) و عربی (١٢٣) به انگلیسی
    const converted = val.replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 1776))
        .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 1632));

    // ۲. حذف هر چیزی غیر از عدد و محدود کردن طول
    const numericVal = converted.replace(/[^0-9]/g, '').slice(0, maxLength);
    if (numericVal === '') return '';

    // ۳. اعتبارسنجی مقدار ماکسیمم
    // (فقط زمانی که کاربر در حال تایپ رقم دوم است)
    if (numericVal.length === maxLength) {
        const num = parseInt(numericVal, 10);
        if (num > maxVal) return String(maxVal); // مثلا اگر "30" تایپ شد، "23" برگردان
    }

    return numericVal;
};

/**
 * کامنت: این تابع یک عدد را می‌گیرد و آن را پد (pad) می‌کند (e.g., 7 -> "07")
 */
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
}) => {
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    const hourRef = useRef<HTMLInputElement>(null);
    const minuteRef = useRef<HTMLInputElement>(null);

    // افکت برای پر کردن اینپوت‌ها از مقدار value (props)
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

    /**
     * کامنت: تابع مرکزی برای آپدیت فرم react-hook-form
     */
    const triggerChange = (h: string, m: string) => {
        // فقط زمانی که هر دو بخش کامل هستند، مقدار "HH:mm" را بفرست
        if (h.length === 2 && m.length === 2) {
            onChange(`${h}:${m}`);
        } else {
            // در غیر این صورت (مثلا در حال تایپ)، مقدار null بفرست
            onChange(null);
        }
    };

    // --- هندلرهای ساعت ---

    const handleHourChange = (e: ChangeEvent<HTMLInputElement>) => {
        // ۱. ورودی را تمیز کن (مثلاً "17" یا "23" یا "1")
        const val = cleanInput(e.target.value, 2, 23);
        // ۲. استیت داخلی را آپدیت کن
        setHour(val);

        // ۳. اگر مقدار کامل شد (۲ رقم)، به اینپوت دقیقه بپر
        if (val.length === 2 && minuteRef.current) {
            // ✅✅✅ راه حل باگ:
            // قبل از پرش (که باعث blur می‌شود)، خودمان triggerChange را صدا می‌زنیم
            triggerChange(val, minute);
            minuteRef.current.focus();
            minuteRef.current.select();
        } else {
            // اگر کامل نیست (مثلاً "1")، مقدار null بفرست
            triggerChange(val, minute);
        }
    };

    const handleHourBlur = () => {
        // ✅✅✅ راه حل باگ:
        // هرگز به استیت (hour) اعتماد نکن، چون ممکن است قدیمی باشد.
        // مقدار نهایی را مستقیماً از DOM بخوان.
        const currentDomValue = hourRef.current?.value || '';

        // اگر کاربر چیزی تایپ نکرده بود یا پاک کرده بود
        if (currentDomValue === '') {
            setHour('');
            triggerChange('', minute);
            return;
        }

        // اگر مقدار ۲ رقمی بود (مثل "17")، handleHourChange کارش را کرده.
        // ما فقط زمانی نیاز به پد (pad) کردن داریم که مقدار ۱ رقمی باشد (مثل "7").
        if (currentDomValue.length === 1) {
            const formatted = formatTimePart(currentDomValue); // "7" -> "07"
            setHour(formatted);
            triggerChange(formatted, minute);
        }
        // اگر ۲ رقمی بود، هیچ کاری نکن.
    };

    // --- هندلرهای دقیقه ---

    const handleMinuteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = cleanInput(e.target.value, 2, 59);
        setMinute(val); // ✅ اصلاح باگ کپی/پیست (setMinute به جای setHour)
        triggerChange(hour, val); // آپدیت مقدار در حال تایپ
    };

    const handleMinuteBlur = () => {
        // از همان منطق ساعت استفاده می‌کنیم (خواندن از DOM)
        const currentDomValue = minuteRef.current?.value || '';

        if (currentDomValue === '') {
            setMinute('');
            triggerChange(hour, '');
            return;
        }

        // پد کردن مقادیر تک رقمی (مثل "5" -> "05")
        if (currentDomValue.length === 1) {
            const formatted = formatTimePart(currentDomValue);
            setMinute(formatted);
            triggerChange(hour, formatted);
        }
    };

    // هندلر برای پاک کردن با Backspace
    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && minute === '' && hourRef.current) {
            hourRef.current.focus();
            hourRef.current.select();
        }
    };

    // --- بخش رندر (بدون تغییر) ---

    let placeholderHour = "HH";
    let placeholderMinute = "mm";
    if (placeholder && /^\d{2}:\d{2}$/.test(placeholder)) {
        [placeholderHour, placeholderMinute] = placeholder.split(':');
    }
    const baseClasses = 'flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2';
    const combinedClasses = [
        baseClasses,
        disabled ? 'cursor-not-allowed opacity-50' : '',
        className || ''
    ].filter(Boolean).join(' ');
    const spanClasses = [
        'mx-1 text-muted-foreground',
        disabled ? 'opacity-50' : ''
    ].filter(Boolean).join(' ');


    return (
        <div
            className={combinedClasses}
            dir={dir}
        >
            <Input
                ref={hourRef}
                type="text"
                inputMode="numeric"
                value={hour}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                placeholder={placeholderHour}
                disabled={disabled}
                className="w-9 bg-transparent text-center outline-none [appearance:textfield] placeholder:text-muted-foreground"
                maxLength={2}
            />
            <span className={spanClasses}>
                :
            </span>
            <Input
                ref={minuteRef}
                type="text"
                inputMode="numeric"
                value={minute}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                onKeyDown={handleMinuteKeyDown}
                placeholder={placeholderMinute}
                disabled={disabled}
                className="w-9 bg-transparent text-center outline-none [appearance:textfield] placeholder:text-muted-foreground"
                maxLength={2}
            />
            <style>{`
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
 -webkit-appearance: none;
 margin: 0;
}
`}
            </style>
        </div>
    );
};