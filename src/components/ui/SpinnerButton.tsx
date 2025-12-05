import React from "react";

// تعریف پراپ‌های کامپوننت
interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
    size?: "xs" | "sm" | "md" | "lg" | "xl"; // سایزهای استاندارد
    className?: string; // برای اضافه کردن کلاس‌های دلخواه (مثل رنگ خاص)
}

/**
 * کامپوننت اسپینر (Loading)
 * طراحی شده به سبک مدرن (Track + Indicator) برای استفاده در دکمه‌ها و کارت‌ها.
 *
 * @example
 * <Button disabled>
 * <Spinner size="sm" className="ml-2" />
 * در حال پردازش...
 * </Button>
 */
export const SpinnerButton = ({ size = "md", className = "", ...props }: SpinnerProps) => {
    // مپ کردن سایزها به کلاس‌های Tailwind
    // این روش باعث می‌شود کد تمیزتر باشد و سایزها استاندارد باقی بمانند
    const sizeClasses = {
        xs: "w-3 h-3", // ۱۲ پیکسل (خیلی کوچک)
        sm: "w-4 h-4", // ۱۶ پیکسل (استاندارد دکمه‌های کوچک)
        md: "w-5 h-5", // ۲۰ پیکسل (استاندارد دکمه‌های متوسط)
        lg: "w-8 h-8", // ۳۲ پیکسل (بزرگ)
        xl: "w-12 h-12", // ۴۸ پیکسل (خیلی بزرگ)
    };

    return (
        <svg
            className={`animate-spin ${sizeClasses[size]} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...props} // انتقال سایر پراپ‌های استاندارد SVG
        >
            {/* لایه ۱: مسیر دایره (Track) - کمرنگ */}
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>

            {/* لایه ۲: شاخص چرخان (Indicator) - پررنگ */}
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
};