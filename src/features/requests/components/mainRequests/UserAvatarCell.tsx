// features/requests/components/mainRequests/UserAvatarCell.tsx

import { User } from "lucide-react";
// ✅ اطمینان از ایمپورت صحیح هلپر
import { getFullImageUrl } from "@/features/User/utils/imageHelper";

interface UserAvatarCellProps {
    name: string;
    phone: string;
    avatarUrl?: string | null;
}

const UserAvatarCell = ({ name, phone, avatarUrl }: UserAvatarCellProps) => {
    // ✅ پردازش مجدد آدرس تصویر برای اطمینان
    // حتی اگر والد آدرس را درست بفرستد، صدا زدن مجدد این تابع ضرری ندارد و ایمنی را بالا می‌برد
    const fullImageUrl = getFullImageUrl(avatarUrl);

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
                {fullImageUrl ? (
                    <img
                        src={fullImageUrl}
                        alt={name}
                        className="w-full h-full rounded-full object-cover border border-borderL dark:border-borderD"
                        onError={(e) => {
                            // مخفی کردن تصویر شکسته
                            e.currentTarget.style.display = 'none';
                            // تغییر استایل والد برای نمایش فال‌بک
                            e.currentTarget.parentElement?.classList.add('bg-secondaryL', 'dark:bg-secondaryD', 'flex', 'items-center', 'justify-center');
                            
                            // ✅ روش تمیزتر برای تزریق SVG فال‌بک (به جای innerHTML)
                            // البته چون اینجا دسترسی مستقیم به DOM داریم، روش فعلی سریعتر است، اما استانداردتر این است که state داشته باشیم.
                            // برای پرفورمنس جدول، همین روش DOM Manipulation قابل قبول است.
                            const fallbackIcon = document.createElement('div');
                            // آیکون User از Lucide
                            fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-muted-foregroundL dark:text-muted-foregroundD"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                            e.currentTarget.parentElement?.appendChild(fallbackIcon.firstChild!);
                        }}
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-secondaryL dark:bg-secondaryD flex items-center justify-center border border-borderL dark:border-borderD">
                        <User className="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" />
                    </div>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foregroundL dark:text-foregroundD truncate">
                    {name}
                </span>
                <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD font-mono truncate">
                    {phone}
                </span>
            </div>
        </div>
    );
};

export default UserAvatarCell;