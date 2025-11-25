import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Download, FileText, Loader2, XCircle } from "lucide-react";
import Echo from "laravel-echo";

// ✅ ایمپورت هوشمند: خودش می‌فهمد کوکی بفرستد یا هدر توکن
import axiosInstance from "@/lib/AxiosConfig";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";

// ====================================================================
// 🎨 کامپوننت محتوای نوتیفیکیشن (UI دانلود)
// ====================================================================

interface DownloadToastContentProps {
    url: string;
    name: string;
    closeToast?: () => void;
    // ✅ اصلاح: استفاده از any برای جلوگیری از خطای تایپ ناسازگار react-toastify
    toastProps?: any;
}

const DownloadToastContent = ({ url, name, closeToast }: DownloadToastContentProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        setDownloadError(null);

        try {
            // ✅ نکته کلیدی: ما از axiosInstance استفاده می‌کنیم.
            const response = await axiosInstance.get(url, {
                responseType: "blob", // برای دریافت فایل حیاتی است
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });

            // ۱. تشخیص نوع فایل
            const contentType = response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            // ۲. ساخت Blob و لینک موقت
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", name);
            document.body.appendChild(link);

            // ۳. دانلود و پاکسازی
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // ۴. موفقیت
            toast.success(`✅ فایل ${name} با موفقیت دریافت شد.`, { position: "bottom-left" });

            // بستن تست دانلود بعد از موفقیت
            if (closeToast) closeToast();

        } catch (error: any) {
            console.error("Download Error:", error);
            let msg = "خطا در دانلود فایل.";

            if (error.response) {
                const status = error.response.status;
                if (status === 401) msg = "لطفاً مجدداً وارد شوید (401).";
                else if (status === 403) msg = "دسترسی دانلود ندارید یا لینک منقضی شده.";
                else if (status === 404) msg = "فایل روی سرور پیدا نشد.";
                else if (status === 419) msg = "نشست کاربری منقضی شده است.";

                // تلاش برای خواندن متن ارور از داخل Blob
                if (error.response.data instanceof Blob) {
                    try {
                        const text = await error.response.data.text();
                        const json = JSON.parse(text);
                        if (json.message) msg = json.message;
                    } catch (e) { /* خطا در پارس جیسون نادیده گرفته شود */ }
                }
            }
            setDownloadError(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex items-start gap-3 p-1 min-w-[280px] font-sans dir-rtl bg-backgroundL-500 p-2 rounded-2xl">
            {/* آیکون */}
            <div className="p-2.5 bg-blue-100 dark:bg-borderD rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* محتوا */}
            <div className="flex flex-col flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-infoD-background leading-tight mb-1">
                    گزارش آماده دریافت
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400 truncate dir-ltr text-right mb-3" title={name}>
                    {name}
                </p>

                {/* دکمه دانلود */}
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2
                    text-xs font-medium rounded-lg transition-all duration-200
                    bg-blue-600 text-white hover:bg-blue-700
                    dark:bg-blue-700 dark:hover:bg-blue-600
                    disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>در حال دریافت...</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            <span>دانلود فایل</span>
                        </>
                    )}
                </button>

                {/* نمایش خطا */}
                {downloadError && (
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-red-600 bg-red-50 dark:bg-red-900/20 p-1.5 rounded border border-red-100 dark:border-red-900/30">
                        <XCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{downloadError}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ====================================================================
// 🎧 هندلر سراسری سوکت (Global Notification Handler)
// ====================================================================

export const GlobalNotificationHandler = () => {
    const userId = useAppSelector((state) => state.auth.user?.id);

    // استفاده از <any> برای رفع خطای تایپ اسکریپت
    const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

    // رفع خطای NodeJS.Timeout با استفاده از ReturnType
    const checkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ۱. اطمینان از اتصال سوکت (Polling)
    useEffect(() => {
        if (echoInstance) return;

        const tryGetEcho = () => {
            const echo = getEcho();
            if (echo) {
                setEchoInstance(echo);
                return true;
            }
            return false;
        };

        if (tryGetEcho()) return;

        checkIntervalRef.current = setInterval(() => {
            if (tryGetEcho()) {
                if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            }
        }, 1000);

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, [echoInstance]);

    // ۲. گوش دادن به ایونت‌ها
    useEffect(() => {
        if (!echoInstance || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echoInstance.private(channelName);

        const handleExportReady = (e: any) => {
            console.log("📥 [GlobalHandler] Export Ready:", e);

            const url = e.download_url;
            const name = e.report_name || `Report-${Date.now()}.xlsx`;

            if (!url) {
                console.error("❌ Download URL is missing.");
                return;
            }

            // نمایش تست دانلود
            toast(
                ({ closeToast, toastProps }) => (
                    <DownloadToastContent
                        url={url}
                        name={name}
                        closeToast={closeToast}
                        toastProps={toastProps}
                    />
                ),
                {
                    position: "bottom-right",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: true,
                    closeButton: true,
                    toastId: e.request_id ? `export-${e.request_id}` : `export-${Date.now()}`,
                    className: "!p-0 !bg-transparent !shadow-none !border-0 !min-w-[300px]",
                    style: { boxShadow: "none", background: "transparent" },
                }
            );
        };

        channel.listen(".export.ready", handleExportReady);
        channel.listen("export.ready", handleExportReady);

        return () => {
            channel.stopListening(".export.ready");
            channel.stopListening("export.ready");
        };
    }, [userId, echoInstance]);

    return null;
};