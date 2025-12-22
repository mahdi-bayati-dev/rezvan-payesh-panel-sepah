import { Info } from "lucide-react";

export const AppVersionBadge = () => {
    return (
        <div
            className="
        flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-[10px] font-semibold
        bg-mutedL text-muted-foregroundL
        dark:bg-mutedD dark:text-muted-foregroundD
        border border-borderL dark:border-borderD
        hover:bg-secondaryL dark:hover:bg-secondaryD
        transition-colors
        cursor-default
      "
            title="نسخه فعلی اپلیکیشن"
        >
            <Info className="w-3.5 h-3.5" />
            <span>نسخه {__APP_VERSION__}</span>
        </div>
    );
};
