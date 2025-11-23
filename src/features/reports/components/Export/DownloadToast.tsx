import { useEffect, useState } from "react"; // [جدید]: useState برای مدیریت دانلود
import { toast } from "react-toastify";
import { Download, FileText, Loader2 } from "lucide-react"; // آیکون‌ها
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import axiosInstance from "@/lib/AxiosConfig"; // [جدید]: استفاده از axios instance برای دانلود

// ====================================================================
// 🎨 کامپوننت UI بهبود یافته با ظاهر مدرن‌تر
// ====================================================================

interface DownloadToastContentProps {
    url: string;
    name: string;
    // ✅ حذف توکن از Props: دیگر نباید به کامپوننت پاس داده شود
}

const DownloadToastContent = ({ url, name }: DownloadToastContentProps) => {
    // [جدید]: استیت برای مدیریت وضعیت دانلود
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // ✅ حذف: توکن دیگر لازم نیست

    // [جدید]: تابع اصلی دانلود با استفاده از Fetch/Axios
    const handleDownload = async () => {
        // ✅ حذف چک کردن توکن، چون مرورگر آن را در کوکی می‌فرستد
        // if (!token) { ...
        //     return;
        // }

        setIsDownloading(true);
        setDownloadError(null);

        try {
            // ۱. استفاده از axiosInstance که به دلیل withCredentials: true کوکی HttpOnly را ارسال می‌کند
            const response = await axiosInstance.get(url, {
                // مهم: responseType را باینری قرار می‌دهیم
                responseType: 'blob',
            });

            // ۲. ساخت یک Blob URL
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const blobUrl = window.URL.createObjectURL(blob);

            // ۳. اجرای دانلود (ایجاد تگ <a> مخفی و کلیک بر روی آن)
            const link = document.createElement('a');
            link.href = blobUrl;
            // [بهینه‌سازی]: اگر نام فایل در هدر Content-Disposition آمده باشد، اینجا بهتر است
            link.setAttribute('download', name); // نام فایل
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl); // پاکسازی

            toast.success(`✅ دانلود فایل ${name} آغاز شد.`, { autoClose: 3000 });

        } catch (error: any) {
            // [نکته مهم]: مدیریت خطاهای احراز هویت 401/403 که می‌تواند ناشی از کوکی منقضی باشد
            let message = "خطا در دانلود. (لینک منقضی یا نامعتبر)";

            if (error.response && error.response.data instanceof Blob) {
                const errorText = await error.response.data.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    message = errorJson.message || errorText;
                } catch (e) {
                    console.log(e);
                    message = errorText.substring(0, 100) + '...';
                }
            } else if (error.response?.status === 403 || error.response?.status === 401) {
                message = "لینک دانلود منقضی شده یا دسترسی ندارید (کوکی احراز هویت مشکل دارد).";
            }

            console.error("Download Error:", error);
            setDownloadError(message);
            toast.error(`❌ ${message}`);

        } finally {
            setIsDownloading(false);
            // پس از دانلود، توست را می‌بندیم
            // [اصلاح]: برای جلوگیری از بستن توست در زمان خطا، بهتر است فقط در حالت موفقیت‌آمیز ببندیم
            // یا آن را به صورت دستی توسط کاربر ببندیم.
            // به خاطر تجربه کاربری، آن را خودکار نمی‌بندیم.
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

    // ✅ اصلاح نهایی: حذف کامل accessToken از Redux
    // const authToken = useAppSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        const echo = getEcho();
        if (!echo || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echo.private(channelName);

        // ✅ لاگ را ساده می‌کنیم
        console.log(`[GlobalHandler] Listening on: ${channelName}.`);

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
                // ✅ پاس دادن فقط url و name به کامپوننت Toast
                <DownloadToastContent url={url} name={name} />,
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
    }, [userId]); // ✅ به‌روزرسانی وابستگی‌ها

    return null;
};