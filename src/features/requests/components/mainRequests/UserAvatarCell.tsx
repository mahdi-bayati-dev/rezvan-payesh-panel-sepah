// features/requests/components/mainRequests/UserAvatarCell.tsx

import { User } from "lucide-react";
import { getFullImageUrl } from "@/features/User/utils/imageHelper";

interface UserAvatarCellProps {
    name: string;
    phone: string;
    avatarUrl?: string | null;
}

const UserAvatarCell = ({ name, phone, avatarUrl }: UserAvatarCellProps) => {
    const fullImageUrl = getFullImageUrl(avatarUrl);

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0 transition-transform hover:scale-105">
                {fullImageUrl ? (
                    <img
                        src={fullImageUrl}
                        alt={name}
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-secondaryL', 'dark:bg-secondaryD', 'flex', 'items-center', 'justify-center');

                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-muted-foregroundL dark:text-muted-foregroundD"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                            e.currentTarget.parentElement?.appendChild(fallbackIcon.firstChild!);
                        }}
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-secondaryL/50 dark:bg-secondaryD flex items-center justify-center border border-borderL dark:border-borderD">
                        <User className="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" />
                    </div>
                )}
            </div>
            <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-sm font-bold text-foregroundL dark:text-foregroundD truncate">
                    {name}
                </span>
                {/* ✅ فونت مونو و رنگ ملایم‌تر برای شماره تلفن (که حالا فارسی است) */}
                <span className="text-xs text-muted-foregroundL/80 dark:text-muted-foregroundD/80 font-medium truncate dir-ltr text-right">
                    {phone}
                </span>
            </div>
        </div>
    );
};

export default UserAvatarCell;