import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn"; // فرض بر این است که cn دارید، اگر ندارید دستی کلاس بدهید

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
    size?: number; // برای گرفتن سایز جهت بهینه‌سازی (اگر بکند ساپورت کند)
}

export const Avatar = ({
    src,
    alt,
    className = "h-10 w-10",
    fallbackSrc = "/img/avatars/default.png" // مسیر مطلق بهتر است
}: AvatarProps) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // ریست کردن وضعیت وقتی src عوض می‌شود
        setImgSrc(src || undefined);
        setHasError(false);
    }, [src]);

    // کلاس‌های مشترک
    const containerClasses = cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondaryL dark:bg-secondaryD border border-borderL dark:border-borderD",
        className
    );

    if (hasError || !imgSrc) {
        return (
            <div className={containerClasses}>
                <User className="w-1/2 h-1/2 text-muted-foregroundL dark:text-muted-foregroundD" />
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <img
                src={imgSrc}
                alt={alt || "Avatar"}
                className="h-full w-full object-cover"
                loading="lazy" // ✅ استاندارد: لود تنبل برای پرفورمنس
                decoding="async" // ✅ استاندارد: جلوگیری از فریز شدن ترد اصلی
                onError={() => {
                    if (imgSrc !== fallbackSrc && fallbackSrc) {
                        setImgSrc(fallbackSrc);
                    } else {
                        setHasError(true);
                    }
                }}
            />
        </div>
    );
};