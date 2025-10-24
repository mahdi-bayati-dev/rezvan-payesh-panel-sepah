interface DetailAvatarProps {
    /** نام کامل شخص برای alt text */
    name: string;
    /** URL تصویر آواتار (اختیاری) */
    avatarUrl?: string;
    /** یک placeholder برای زمانی که URL وجود ندارد */
    placeholderText?: string; // مثلا "MB"
}

/**
 * کامپوننت ماژولار برای نمایش آواتار بزرگ و نام
 * (مخصوص استفاده در کارت‌های جزئیات یا هدر پروفایل)
 */
export const DetailAvatar = ({
    name,
    avatarUrl,
    placeholderText = '??', // یک فال‌بک پیش‌فرض
}: DetailAvatarProps) => {

    // ساخت URL فال‌بک بر اساس placeholder
    const fallbackUrl = `https://placehold.co/96x96/E2E8F0/64748B?text=${encodeURIComponent(
        placeholderText
    )}`;

    // هندلر خطا برای زمانی که avatarUrl داده شده ولی لود نمی‌شود
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = fallbackUrl;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <img
                // اگر avatarUrl وجود دارد از آن استفاده کن، در غیر این صورت از فال‌بک
                src={avatarUrl || fallbackUrl}
                alt={name}
                onError={handleImageError} // مدیریت خطای لود شدن تصویر
                className="w-24 h-24 rounded-full border-4 border-borderL dark:border-borderD object-cover" // object-cover برای جلوگیری از دفرمه شدن
            />
            <div className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                {name}
            </div>
        </div>
    );
};