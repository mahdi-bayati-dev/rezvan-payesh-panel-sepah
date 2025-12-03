import { type FC } from "react";
import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  fullscreen?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "circle" | "dots";
  text?: string;
  className?: string;
  wrapperClassName?: string;
}

// تنظیمات سایز برای کانتینر نقطه‌ها
const dotsContainerSizes = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

// سایز خود نقطه‌ها
const dotsSizeClasses = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
  xl: "w-5 h-5",
};

const circleSizeClasses = {
  xs: "w-4 h-4 border-2",
  sm: "w-6 h-6 border-[2.5px]",
  md: "w-10 h-10 border-[3px]",
  lg: "w-14 h-14 border-[4px]",
  xl: "w-20 h-20 border-[5px]",
};

export const Spinner: FC<SpinnerProps> = ({
  fullscreen = false,
  size = "md",
  variant = "dots",
  text = "",
  className,
  wrapperClassName,
}) => {

  const renderDots = () => (
    <div
      className={cn(
        "relative flex items-center justify-center animate-spin-slow",
        dotsContainerSizes[size],
        className
      )}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        // ✅ لایه والد: فقط مسئول چرخش و مکان‌دهی (ثابت)
        <span
          key={i}
          className="absolute flex items-center justify-center w-full h-full"
          style={{
            // اینجا فقط می‌چرخانیم. translate رو به فرزند نمی‌دهیم تا راحت‌تر کنترل شود
            // اما برای اینکه دقیقاً دور تا دور باشند، از تکنیک چرخش والد استفاده می‌کنیم
            transform: `rotate(${i * 60}deg)`,
          }}
        >
          {/* ✅ لایه فرزند: مسئول شکل، رنگ و انیمیشن Scale */}
          <span
            className={cn(
              "rounded-full absolute", // absolute باعث می‌شود بتوانیم فاصله از مرکز را تنظیم کنیم
              "bg-[var(--color-primaryL)] dark:bg-[var(--color-primaryD)]",
              "dark:shadow-[0_0_10px_var(--color-primaryD)]",
              dotsSizeClasses[size]
            )}
            style={{
              // این translate باعث می‌شود نقطه از مرکز فاصله بگیرد (شعاع دایره)
              // چون انیمیشن ما فقط Scale دارد، این Translate ثابت می‌ماند
              // اما اگر انیمیشن Transform داشته باشد باز خراب می‌شود.
              // راه حل نهایی: انیمیشن را روی این اعمال می‌کنیم اما Translate را با Margin شبیه‌سازی می‌کنیم یا در انیمیشن دقت می‌کنیم.

              // ✅ راه حل قطعی: استفاده از top/margin برای فاصله گرفتن، تا انیمیشن scale تداخل نکند
              top: 0, // می‌چسبد به بالای کانتینر والد که چرخیده است
              animation: `dot-fade 1.8s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        </span>
      ))}
    </div>
  );

  const renderCircle = () => (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "rounded-full opacity-20 border-solid",
          "border-[var(--color-primaryL)] dark:border-[var(--color-primaryD)]",
          circleSizeClasses[size]
        )}
      />
      <div
        className={cn(
          "absolute animate-spin rounded-full border-solid border-t-transparent border-l-transparent",
          "border-[var(--color-primaryL)] dark:border-[var(--color-primaryD)]",
          "drop-shadow-md dark:drop-shadow-[0_0_5px_var(--color-primaryD)]",
          circleSizeClasses[size],
          className
        )}
      />
    </div>
  );

  const spinnerElement = variant === "dots" ? renderDots() : renderCircle();

  const renderText = () => (
    text && (
      <p className="mt-4 animate-pulse text-sm font-medium tracking-wide text-[var(--color-muted-foregroundL)] dark:text-[var(--color-muted-foregroundD)]">
        {text}
      </p>
    )
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 dark:bg-[#0f111a]/60 backdrop-blur-md transition-all duration-500">
        {spinnerElement}
        {renderText()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full transition-all",
        "min-h-[160px] p-6",
        wrapperClassName
      )}
    >
      {spinnerElement}
      {renderText()}
    </div>
  );
};

// ✅ این کامپوننت جدید را اینجا اضافه و اکسپورت می‌کنیم
export const RouteSpinner = () => (
  <Spinner
    variant="dots"
    size="lg"
    wrapperClassName="min-h-[60vh]" // ارتفاع مناسب برای وسط‌چین شدن در صفحات
  />
);