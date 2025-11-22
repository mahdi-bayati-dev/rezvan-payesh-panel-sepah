import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx"; // ✅ استاندارد برای ترکیب کلاس‌ها

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string; // ✅ لیبل اختیاری شد تا در صورت عدم نیاز، فضا اشغال نکند
    error?: string; // برای نمایش خطای اعتبارسنجی
    containerClassName?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    name,
    error,
    containerClassName = '',
    className = '',
    ...props
}, ref) => {

    return (
        <div className={clsx("w-full", containerClassName)}>
            {/* ✅ رندر شرطی: اگر لیبل وجود داشت نمایش بده، وگرنه هیچ فضایی اشغال نکن */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD"
                >
                    {label}
                </label>
            )}

            <input
                id={name}
                name={name}
                ref={ref}
                className={clsx(
                    // --- استایل‌های پایه ---
                    "w-full py-2.5 px-3 rounded-lg text-sm transition-colors duration-200",
                    "bg-backgroundL-500 text-foregroundL border border-borderL",
                    "focus:outline-none focus:ring-2 focus:ring-primaryL focus:border-transparent",
                    "placeholder:text-muted-foregroundL",

                    // --- استایل‌های دارک مود ---
                    "dark:bg-backgroundD dark:text-foregroundD dark:border-borderD",
                    "dark:focus:ring-primaryD dark:placeholder:text-muted-foregroundD",

                    // --- استایل در زمان خطا ---
                    error && "border-destructiveL focus:ring-destructiveL dark:border-destructiveD dark:focus:ring-destructiveD",

                    // --- کلاس‌های اضافی پاس داده شده ---
                    className
                )}
                {...props}
            />

            {/* نمایش پیام خطا در صورت وجود */}
            {error && (
                <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;