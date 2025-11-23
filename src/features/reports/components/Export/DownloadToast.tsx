import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Download, FileText, Loader2 } from "lucide-react";
import Echo from "laravel-echo";
import axios from "axios";

// --- اصلاح مسیرهای ایمپورت: ارجاع به داخل پوشه src ---
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
// نکته: اگر AxiosConfig لود نشد، مشکلی نیست چون در اینجا از axios خام استفاده می‌کنیم

// ====================================================================
// 🎨 کامپوننت محتوای نوتیفیکیشن (UI جدید)
// ====================================================================

interface DownloadToastContentProps {
    url: string;
    name: string;
    token?: string;
}

const DownloadToastContent = ({ url, name, token }: DownloadToastContentProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadError(null);

        try {
            // ✅ راه حل خطای 405 و 401:
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // درخواست JSON به جای ریدایرکت
                    'Accept': 'application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });

            // ساخت فایل برای دانلود
            const contentType = response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // بستن تست بعد از دانلود موفق
            toast.dismiss(DownloadToastContent.name);
            toast.success(`✅ فایل ${name} دانلود شد.`, { position: "bottom-right" });

        } catch (error: any) {
            console.error("Download Error:", error);

            let msg = "خطا در دانلود فایل.";

            if (error.response) {
                if (error.response.status === 401) msg = "لطفاً مجدداً وارد شوید (401).";
                else if (error.response.status === 403) msg = "لینک دانلود منقضی شده یا دسترسی ندارید (403).";
                else if (error.response.status === 405) msg = "خطای متد (405).";
                else if (error.response.status === 419) msg = "نشست کاربری منقضی شده (419).";

                if (error.response.data instanceof Blob) {
                    try {
                        const text = await error.response.data.text();
                        const json = JSON.parse(text);
                        if (json.message) msg = json.message;
                    } catch (e) { 
                    console.log(e);
                    
                     }
                }
            }

            setDownloadError(msg);
            toast.error(msg, { position: "bottom-right" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 min-w-[280px] rounded-xl bg-white dark:bg-gray-900">
            {/* آیکون */}
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* محتوا */}
            <div className="flex flex-col flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1">
                    گزارش آماده شد
                </h4>

                <p
                    className="text-xs text-gray-500 dark:text-gray-400 truncate dir-ltr text-right mb-3"
                    title={name}
                >
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
                           disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow"
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

                {/* خطا */}
                {downloadError && (
                    <span className="text-[10px] text-red-500 mt-2 block font-medium bg-red-50 dark:bg-red-900/10 p-1 rounded">
                        {downloadError}
                    </span>
                )}
            </div>
        </div>
    );
};

// ====================================================================
// 🎧 هندلر سراسری سوکت
// ====================================================================

export const GlobalNotificationHandler = () => {
    const userId = useAppSelector((state) => state.auth.user?.id);
    const token = useAppSelector((state) => state.auth.accessToken);
    const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

    // ۱. اطمینان از اتصال سوکت (Polling)
    useEffect(() => {
        if (echoInstance) return;

        const checkEcho = () => {
            const echo = getEcho();
            if (echo) {
                setEchoInstance(echo);
                return true;
            }
            return false;
        };

        if (!checkEcho()) {
            const interval = setInterval(() => {
                if (checkEcho()) clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [echoInstance]);

    // ۲. گوش دادن به ایونت
    useEffect(() => {
        if (!echoInstance || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echoInstance.private(channelName);

        const handleEvent = (e: any) => {
            console.log("📥 [GlobalHandler] Event Received:", e);

            const url = e.download_url;
            const name = e.report_name || `Report-${Date.now()}.xlsx`;

            if (!url) {
                console.error("❌ Download URL is missing!");
                return;
            }

            // نمایش نوتیفیکیشن
            toast.success(
                <DownloadToastContent
                    url={url}
                    name={name}
                    token={token || undefined}
                />,
                {
                    // تنظیمات زمان‌بندی و موقعیت
                    autoClose: 15000, // ۱۵ ثانیه
                    position: "bottom-right", // پایین راست (باعث می‌شود از راست باز شود)
                    
                    // سایر تنظیمات
                    closeOnClick: false,
                    draggable: true,
                    closeButton: true,
                    pauseOnHover: true,
                    toastId: `export-${Date.now()}`,
                    
                    // حذف استایل‌های پیش‌فرض برای کاستومایز کامل
                    className: "!p-0 !bg-transparent !shadow-none !border-0 !min-w-[300px]",
                    // bodyClassName: "!p-0 !m-0",
                    style: { boxShadow: 'none' }
                }
            );
        };

        channel.listen(".export.ready", handleEvent);
        channel.listen("export.ready", handleEvent);

        return () => {
            channel.stopListening(".export.ready", handleEvent);
            channel.stopListening("export.ready", handleEvent);
        };
    }, [userId, echoInstance, token]);

    return null;
};