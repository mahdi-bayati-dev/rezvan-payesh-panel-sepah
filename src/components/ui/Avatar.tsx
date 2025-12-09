import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
}

export const Avatar = ({
    src,
    alt,
    className = "h-10 w-10",
    fallbackSrc = "/img/avatars/default.png"
}: AvatarProps) => {
    // سه وضعیت: 'loading', 'loaded', 'error'
    const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src || undefined);

    useEffect(() => {
        setCurrentSrc(src || undefined);
        setImgState('loading');
    }, [src]);

    const handleError = () => {
        // اگر قبلاً روی فال‌بک بودیم و باز هم ارور داد، برو به حالت ارور نهایی (نمایش آیکون)
        if (currentSrc === fallbackSrc) {
            setImgState('error');
        } else if (fallbackSrc) {
            // اگر روی تصویر اصلی بودیم و ارور داد، سوییچ کن به فال‌بک
            setCurrentSrc(fallbackSrc);
            // نکته: هنوز state روی loading یا loaded نمی‌رود تا وقتی که فال‌بک لود شود
        } else {
            // اگر فال‌بک نداشتیم، مستقیم ارور
            setImgState('error');
        }
    };

    const containerClasses = cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondaryL dark:bg-secondaryD border border-borderL dark:border-borderD",
        className
    );

    // اگر ارور نهایی رخ داده یا کلاً سورس نداریم، آیکون نشان بده
    if (imgState === 'error' || !currentSrc) {
        return (
            <div className={containerClasses}>
                <User className="w-1/2 h-1/2 text-muted-foregroundL dark:text-muted-foregroundD" />
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <img
                src={currentSrc}
                alt={alt || "Avatar"}
                className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    // اگر هنوز لود نشده (حتی فال‌بک)، opacity را کم کن تا پرش نداشته باشد
                    // imgState === 'loading' ? 'opacity-0' : 'opacity-100' // (اختیاری برای افکت فید)
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgState('loaded')}
                onError={handleError}
            />
        </div>
    );
};