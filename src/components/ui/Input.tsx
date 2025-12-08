import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // آیکون‌ها را ایمپورت می‌کنیم
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    containerClassName?: string;
    // اگر بخواهیم آیکون دیگری به جز چشم در سمت چپ یا راست باشد (برای توسعه آینده)
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    name,
    error,
    type = "text", // تایپ پیش‌فرض
    containerClassName = '',
    className = '',
    dir, // دایرکشن را می‌گیریم تا جایگاه آیکون را تنظیم کنیم
    ...props
}, ref) => {
    // استیت برای مدیریت نمایش یا مخفی کردن رمز عبور
    const [showPassword, setShowPassword] = useState(false);

    // بررسی می‌کنیم که آیا این اینپوت از نوع پسورد است یا خیر
    const isPasswordType = type === 'password';

    // اگر نوع پسورد بود و کاربر دکمه نمایش را زده بود، تایپ را تکست کن، وگرنه همان تایپ ورودی
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    // تابع برای تغییر وضعیت نمایش رمز
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={clsx("w-full", containerClassName)}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    id={name}
                    name={name}
                    ref={ref}
                    type={inputType}
                    dir={dir} // دایرکشن را پاس می‌دهیم
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

                        // --- تنظیم پدینگ برای جلوگیری از افتادن متن زیر آیکون چشم ---
                        // اگر پسورد بود و LTR (مثل فرم شما)، از راست فاصله بده
                        isPasswordType && (dir === 'ltr' ? 'pr-10' : 'pl-10'),

                        className
                    )}
                    {...props}
                />

                {/* --- دکمه نمایش/مخفی کردن رمز عبور --- */}
                {isPasswordType && (
                    <button
                        type="button" // حتما type button باشد تا فرم سابمیت نشود
                        onClick={togglePasswordVisibility}
                        className={clsx(
                            "absolute top-1/2 -translate-y-1/2 text-muted-foregroundL hover:text-foregroundL transition-colors focus:outline-none",
                            // اگر LTR است (مثل فیلد پسورد شما)، آیکون باید سمت راست باشد
                            dir === 'ltr' ? 'right-3' : 'left-3'
                        )}
                        tabIndex={-1} // برای اینکه با Tab روی این دکمه فوکوس نشود (UX بهتر)
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5 dark:text-white" />
                        ) : (
                            <Eye className="w-5 h-5 dark:text-white" />
                        )}
                    </button>
                )}
            </div>

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