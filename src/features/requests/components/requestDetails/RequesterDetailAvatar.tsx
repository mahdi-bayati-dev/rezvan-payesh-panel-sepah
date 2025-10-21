
interface RequesterDetailAvatarProps {
    name: string;
    avatarUrl?: string;
}

/**
 * کامپوننت ماژولار برای نمایش آواتار بزرگ و نام
 * (مخصوص استفاده در کارت جزئیات)
 */
export const RequesterDetailAvatar = ({
    name,
    avatarUrl,
}: RequesterDetailAvatarProps) => {
    console.log(avatarUrl);

    return (
        // ۱. چیدمان عمودی و وسط‌چین
        <div className="flex flex-col items-center gap-4">
            <img
                src='/img/avatars/2.png'
                alt={name}
                // ۲. استایل عکس: بزرگ، گرد، با بوردر
                className="w-24 h-24 rounded-full border-4 border-borderL dark:border-borderD"
            />
            {/* ۳. نام در زیر عکس با فونت بزرگ‌تر */}
            <div className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                {name}
            </div>
        </div>
    );
};