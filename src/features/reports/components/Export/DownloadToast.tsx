import { useEffect } from "react";
import { toast } from "react-toastify";
import { Download, FileText } from "lucide-react"; // آیکون‌ها
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";

// ====================================================================
// 🎨 کامپوننت UI بهبود یافته با ظاهر مدرن‌تر
// ====================================================================
const DownloadToastContent = ({ url, name }: { url: string; name: string }) => (
    <div className="flex items-start gap-4 p-3 max-w-xs bg-white rounded-xl  ">
        {/* آیکون فایل */}
        <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />

        {/* متن */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-backgroundD">
                گزارش شما آماده است
            </h4>
            <p className="text-xs text-gray-600 dark:text-backgroundD truncate">
                {name}
            </p>

            {/* دکمه دانلود */}
            <a
                href={url}
                download={name}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 px-4 py-2
                           text-sm font-medium rounded-lg border border-blue-300 
                           text-blue-700  bg-blue-50 
                           hover:bg-blue-100 
                           transition-colors duration-200"
            >
                <Download className="w-4 h-4" />
                <span>دانلود فایل</span>
            </a>
        </div>


    </div>
);

/**
 * هندلر سراسری که به ایونت‌های وب‌سوکت گوش می‌دهد
 * (این بخش بدون تغییر باقی می‌ماند)
 */
export const GlobalNotificationHandler = () => {
    const userId = useAppSelector((state) => state.auth.user?.id);

    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echo.private(channelName);

        console.log("[GlobalHandler] Listening on:", channelName);

        const listener = (e: any) => {
            console.log("[GlobalHandler] RAW EVENT RECEIVED:", e);

            const url = e.download_url;
            const name = e.report_name || "report.xlsx";

            if (!url) {
                console.error("download_url missing!");
                return;
            }

            // --- نمایش Toast سفارشی (با UI جدید) ---
            toast.success(
                <DownloadToastContent url={url} name={name} />,
                {
                    autoClose: 20000,
                    closeOnClick: false,
                    draggable: true,
                    pauseOnHover: true,
                    theme: "light",
                }
            );
        };

        channel.listen(".export.ready", listener);

        return () => {
            channel.stopListening(".export.ready", listener);
        };
    }, [userId]);

    return null;
};