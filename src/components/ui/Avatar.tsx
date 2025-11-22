import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    fallbackSrc?: string; // مسیر عکس پیش‌فرض در پوشه public (حتما با / شروع شود)
}

/**
 * کامپوننت آواتار هوشمند
 * - مدیریت خطای لود تصویر
 * - مدیریت مسیرهای نسبی و مطلق
 * - نمایش آیکون در صورت نبود عکس
 */
export const Avatar = ({
    src,
    alt,
    className = "h-10 w-10 rounded-full",
    fallbackSrc = "img/avatars/2.png"
}: AvatarProps) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
    const [hasError, setHasError] = useState(false);

    // سینک کردن پراپ src با استیت داخلی
    useEffect(() => {
        setImgSrc(src || undefined);
        setHasError(false);
    }, [src]);

    if (hasError || !imgSrc) {
        return (
            <div className={`${className} flex items-center justify-center bg-secondaryL dark:bg-secondaryD border border-borderL dark:border-borderD overflow-hidden`}>
                {/* آیکون فال‌بک نهایی */}
                <User className="w-1/2 h-1/2 text-muted-foregroundL dark:text-muted-foregroundD" />
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt || "Avatar"}
            className={`${className} object-cover border border-borderL dark:border-borderD bg-secondaryL`}
            onError={() => {
                // اگر عکس اصلی فیل شد، تلاش برای لود فال‌بک
                if (imgSrc !== fallbackSrc) {
                    setImgSrc(fallbackSrc);
                } else {
                    // اگر فال‌بک هم فیل شد، نمایش آیکون
                    setHasError(true);
                }
            }}
        />
    );
};