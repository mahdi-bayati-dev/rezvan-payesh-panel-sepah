import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react'; // ✅ آیکون نهایی فال‌بک متنی/آیکونی

interface DetailAvatarProps {
    /** نام کامل شخص برای alt text */
    name: string;
    /** URL تصویر آواتار (اختیاری) */
    avatarUrl?: string;
    /** متن placeholder آواتار (معمولاً حروف اختصاری، مثلاً "MB") */
    placeholderText?: string; 
}

/**
 * کامپوننت ماژولار برای نمایش آواتار بزرگ و نام
 * (با منطق امن مبتنی بر State برای جلوگیری از حلقه‌ی بی‌نهایت)
 */
export const DetailAvatar: React.FC<DetailAvatarProps> = ({
    name,
    avatarUrl,
    placeholderText = 'U',
}: DetailAvatarProps) => {

    // ✅ State: آیا لود تصویر با خطا مواجه شده است؟ (شروع با false)
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    // ریست کردن وضعیت خطا وقتی URL آواتار تغییر می‌کند (مثلاً کاربر عوض می‌شود)
    useEffect(() => {
        setImageLoadFailed(false);
    }, [avatarUrl]);

    // اگر آدرس خالی بود یا قبلاً خطا داده، باید placeholder نمایش داده شود
    const showPlaceholder = !avatarUrl || imageLoadFailed;
    console.log(avatarUrl);
    

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-borderL dark:border-borderD object-cover shadow-md">
                
                {showPlaceholder ? (
                    // ✅ حالت نهایی: نمایش حروف اختصاری یا آیکون
                    <div className="flex items-center justify-center w-full h-full text-4xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                        {placeholderText.slice(0, 2) || <User className="w-1/2 h-1/2 text-gray-500" />}
                    </div>
                ) : (
                    // ✅ حالت لود تصویر: اگر خطا داد، State را آپدیت کن
                    <img
                        src={avatarUrl!} // (!) اطمینان می‌دهیم که avatarUrl در اینجا تعریف شده است
                        alt={name}
                        // اگر لود تصویر خطا داد، State خطا را True کن
                        onError={() => setImageLoadFailed(true)} 
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                )}
            </div>
            
            <div className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                {name}
            </div>
            
            {/* پیام کمکی برای دیباگ */}
            {imageLoadFailed && (
                 <p className="text-xs text-red-500">تصویر بارگذاری نشد.</p>
            )}
        </div>
    );
};