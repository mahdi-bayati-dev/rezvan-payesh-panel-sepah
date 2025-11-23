import { useEffect, useState } from "react"; // [جدید]: useState برای مدیریت دانلود
import { toast } from "react-toastify";
import { Download, FileText, Loader2 } from "lucide-react"; // آیکون‌ها
import { getEcho } from "@/lib/echoService";
import { useAppSelector, type RootState } from "@/hook/reduxHooks";
import axiosInstance from "@/lib/AxiosConfig"; // [جدید]: استفاده از axios instance برای دانلود

// ====================================================================
// 🎨 کامپوننت UI بهبود یافته با ظاهر مدرن‌تر
// ====================================================================

interface DownloadToastContentProps {
    url: string;
    name: string;
    token?: string; // توکن Bearer
}

const DownloadToastContent = ({ url, name, token }: DownloadToastContentProps) => {
    // [جدید]: استیت برای مدیریت وضعیت دانلود
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // [جدید]: تابع اصلی دانلود با استفاده از Fetch/Axios
    const handleDownload = async () => {
        if (!token) {
            setDownloadError("خطا: توکن احراز هویت یافت نشد.");
            toast.error("خطا: برای دانلود توکن احراز هویت لازم است.");
            return;
        }

        setIsDownloading(true);
        setDownloadError(null);

        try {
            // ۱. استفاده از axiosInstance که به صورت پیش‌فرض توکن را در هدر می‌گذارد
            // 'download_url' یک Signed URL است، اما بک‌اند نیاز به تأیید توکن هم دارد
            const response = await axiosInstance.get(url, {
                // مهم: responseType را باینری قرار می‌دهیم
                responseType: 'blob',
                // [نکته مهم]: ما توکن را در هدر می‌فرستیم (چون axiosInstance آن را می‌فرستد)
            });

            // ۲. ساخت یک Blob URL
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const blobUrl = window.URL.createObjectURL(blob);

            // ۳. اجرای دانلود (ایجاد تگ <a> مخفی و کلیک بر روی آن)
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', name); // نام فایل
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl); // پاکسازی

            toast.success(`✅ دانلود فایل ${name} آغاز شد.`, { autoClose: 3000 });

        } catch (error: any) {
            // [نکته مهم]: اگر خطا به صورت JSON/متن از سرور برگردد
            let message = "خطا در دانلود. (لینک منقضی یا نامعتبر)";

            if (error.response && error.response.data instanceof Blob) {
                // اگر پاسخ خطا یک Blob است (که اغلب در خطاهای API لاراول رخ می‌دهد)
                const errorText = await error.response.data.text();
                try {
                    // تلاش برای پارس کردن به JSON برای خواندن پیام
                    const errorJson = JSON.parse(errorText);
                    message = errorJson.message || errorText;
                } catch (e) {
                    console.log(e);
                    message = errorText.substring(0, 100) + '...';
                }
            } else if (error.response?.status === 403 || error.response?.status === 401) {
                message = "لینک دانلود منقضی شده یا دسترسی ندارید.";
            }

            console.error("Download Error:", error);
            setDownloadError(message);
            toast.error(`❌ ${message}`);

        } finally {
            setIsDownloading(false);
            // پس از دانلود، توست را می‌بندیم
            setTimeout(() => toast.dismiss(DownloadToastContent.name), 3000);
        }
    };


    return (
        <div className="flex items-start gap-4 p-3 max-w-xs bg-white rounded-xl">
            {/* آیکون فایل */}
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400 flex-shrink-0" />

            {/* متن */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-backgroundD">
                    گزارش شما آماده است
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-600 truncate">
                    {name}
                </p>

                {/* دکمه دانلود (اکنون یک دکمه است نه تگ <a>) */}
                <button
                    onClick={handleDownload}
                    disabled={isDownloading || !!downloadError}
                    className="mt-2 flex items-center justify-center gap-2 px-4 py-2
                           text-sm font-medium rounded-lg border 
                           text-blue-700 bg-blue-50
                           hover:bg-blue-100 disabled:opacity-60 transition-colors duration-200"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>در حال دانلود...</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            <span>دانلود فایل</span>
                        </>
                    )}
                </button>

                {/* پیام خطا */}
                {downloadError && (
                    <p className="text-xs text-destructiveL dark:text-destructiveD mt-1 break-words">
                        {downloadError}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * هندلر سراسری که به ایونت‌های وب‌سوکت گوش می‌دهد
 */
export const GlobalNotificationHandler = () => {
    const userId = useAppSelector((state) => state.auth.user?.id);

    // [اصلاح ۳]: استفاده از مسیر صحیح و تایپ‌شده برای accessToken
    const authToken = useAppSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echo.private(channelName);

        console.log(`[GlobalHandler] Listening on: ${channelName}. Current Token Check: ${authToken ? '✅ Found' : '❌ Not Found'}`);

        const listener = (e: any) => {
            console.log("[GlobalHandler] RAW EVENT RECEIVED:", e);

            const url = e.download_url;
            const name = e.report_name || "report.xlsx";

            if (!url) {
                console.error("download_url missing!");
                return;
            }

            // --- نمایش Toast سفارشی ---
            toast.success(
                // [اصلاح ۴]: پاس دادن توکن Bearer به کامپوننت Toast
                <DownloadToastContent url={url} name={name} token={authToken || undefined} />,
                {
                    autoClose: false, // چون خودمان بعد از دانلود می‌بندیم
                    closeOnClick: false,
                    draggable: true,
                    pauseOnHover: true,
                    theme: "light",
                    toastId: DownloadToastContent.name, // برای بستن توست به صورت دستی
                }
            );
        };

        channel.listen(".export.ready", listener);

        return () => {
            channel.stopListening(".export.ready", listener);
        };
    }, [userId, authToken]);

    return null;
};