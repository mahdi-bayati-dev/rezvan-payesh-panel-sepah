import { useEffect, useState, useRef } from "react";
// ✅ اصلاح ایمپورت: حذف ToastProps که اکسپورت نشده است
import { toast, } from "react-toastify";
import {
    Download,
    FileText,
    CheckCircle2,

    AlertCircle,
    X,
    RefreshCcw
} from "lucide-react";
import Echo from "laravel-echo";

// فرض بر این است که این‌ها در پروژه شما موجود هستند
import axiosInstance from "@/lib/AxiosConfig";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";

// ====================================================================
// 🛠 ابزارهای کمکی (Utility)
// ====================================================================

/**
 * تبدیل بایت به فرمت خوانا (KB, MB)
 * برای نمایش حجم فایل به کاربر جهت بهبود UX
 */
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ====================================================================
// 🎨 کامپوننت محتوای نوتیفیکیشن (UI پیشرفته)
// ====================================================================

interface DownloadToastContentProps {
    url: string;
    name: string;
    closeToast?: () => void;
    // ✅ اصلاح تایپ: استفاده از any برای جلوگیری از خطای "not exported"
    // کتابخانه react-toastify این پراپ را پاس می‌دهد اما تایپ آن را اکسپورت نکرده است
    toastProps?: any;
}

type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error';

const DownloadToastContent = ({ url, name, closeToast }: DownloadToastContentProps) => {
    // مدیریت وضعیت کلی پروسه
    const [status, setStatus] = useState<DownloadStatus>('idle');
    // درصد پیشرفت دانلود
    const [progress, setProgress] = useState(0);
    // حجم کل فایل (اگر در هدرها موجود باشد)
    const [totalSize, setTotalSize] = useState<number | null>(null);
    // متن خطا
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * هندلر اصلی دانلود
     * شامل لاجیک دریافت Blob و محاسبه درصد پیشرفت
     */
    const handleDownload = async () => {
        if (status === 'downloading') return;

        setStatus('downloading');
        setProgress(0);
        setErrorMessage(null);

        try {
            const response = await axiosInstance.get(url, {
                responseType: "blob",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
                // ✅ UX حیاتی: محاسبه درصد پیشرفت برای نمایش به کاربر
                onDownloadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    if (total) {
                        setTotalSize(total);
                        const percent = Math.round((progressEvent.loaded * 100) / total);
                        setProgress(percent);
                    }
                },
            });

            // ۱. پردازش فایل دریافت شده
            const contentType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);

            // ۲. ایجاد لینک دانلود مجازی
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", name);
            document.body.appendChild(link);
            link.click();

            // ۳. پاکسازی حافظه
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // ۴. تغییر وضعیت به موفقیت
            setStatus('success');

            // بستن خودکار بعد از ۳ ثانیه (UX: حس اتمام کار)
            setTimeout(() => {
                if (closeToast) closeToast();
            }, 4000);

        } catch (error: any) {
            console.error("Download Error:", error);
            setStatus('error');

            // لاجیک استخراج پیام خطا (مشابه کد قبلی ولی تمیزتر)
            let msg = "خطا در دانلود فایل.";
            if (error.response) {
                const s = error.response.status;
                if (s === 401) msg = "نیاز به ورود مجدد.";
                else if (s === 403) msg = "دسترسی غیرمجاز.";
                else if (s === 404) msg = "فایل یافت نشد.";

                // تلاش برای خواندن جیسون ارور از داخل Blob
                if (error.response.data instanceof Blob) {
                    try {
                        const text = await error.response.data.text();
                        const json = JSON.parse(text);
                        if (json.message) msg = json.message;
                    } catch { /* Ignore */ }
                }
            }
            setErrorMessage(msg);
        }
    };

    // رندر بخش‌های مختلف بر اساس وضعیت (برای تمیزی JSX)
    const renderIcon = () => {
        switch (status) {
            case 'downloading':
                return <div className="animate-bounce text-blue-600"><Download className="w-6 h-6" /></div>;
            case 'success':
                return <CheckCircle2 className="w-6 h-6 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            default:
                return <FileText className="w-6 h-6 text-gray-500 dark:text-gray-300" />;
        }
    };

    return (
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden font-sans dir-rtl transition-all duration-300">
            {/* هدر کارت: آیکون و متن اصلی */}
            <div className="p-4 flex items-start gap-3">
                <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors duration-300
                    ${status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                        status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                            'bg-gray-50 dark:bg-gray-700'}`}>
                    {renderIcon()}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {status === 'success' ? 'دانلود موفق' :
                            status === 'error' ? 'دانلود ناموفق' :
                                status === 'downloading' ? 'در حال دریافت...' : 'گزارش آماده است'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate dir-ltr text-right" title={name}>
                        {name}
                    </p>
                    {totalSize && status === 'downloading' && (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                            حجم تقریبی: {formatBytes(totalSize)}
                        </span>
                    )}
                </div>

                {/* دکمه بستن (همیشه در دسترس) */}
                <button
                    onClick={closeToast}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* بدنه کارت: پروگرس بار یا دکمه‌ها */}
            <div className="px-4 pb-4 pt-0">

                {/* حالت دانلود: نمایش پروگرس بار */}
                {status === 'downloading' && (
                    <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between text-[10px] text-blue-600 dark:text-blue-400 font-medium px-0.5">
                            <span>{progress}%</span>
                            <span>در حال پردازش...</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* حالت خطا: نمایش پیام و دکمه تلاش مجدد */}
                {status === 'error' && (
                    <div className="mt-2 space-y-3">
                        <div className="text-[11px] text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                            {errorMessage}
                        </div>
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            تلاش مجدد
                        </button>
                    </div>
                )}

                {/* حالت اولیه: دکمه دانلود */}
                {status === 'idle' && (
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm shadow-blue-200 dark:shadow-none transition-all duration-200"
                        >
                            <Download className="w-4 h-4" />
                            دریافت فایل
                        </button>
                    </div>
                )}

                {/* حالت موفقیت: دکمه بازکردن (نمایشی) یا پیام */}
                {status === 'success' && (
                    <div className="mt-2">
                        <div className="w-full py-2 text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg flex items-center justify-center gap-2 border border-green-100 dark:border-green-900/30">
                            فایل در دستگاه ذخیره شد
                        </div>
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
    const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);
    const checkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ۱. مکانیزم اتصال امن به Echo (Retry Logic)
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
        }, 2000); // افزایش فاصله زمانی برای کاهش فشار

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
            const name = e.report_name || `Report-${new Date().toISOString().split('T')[0]}.xlsx`;

            if (!url) return;

            // نمایش تست دانلود با تنظیمات سفارشی برای UI جدید
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
                    // ✅ تغییر موقعیت به پایین-راست
                    position: "bottom-right",
                    autoClose: false, // بستن دستی توسط کاربر یا بعد از دانلود موفق
                    closeOnClick: false,
                    draggable: false, // درگ کردن کارتهای تعاملی گاهی باگ ایجاد میکند
                    closeButton: false, // ما دکمه بستن کاستوم داریم
                    // حذف استایل‌های پیش‌فرض تست برای جایگزینی کامل UI خودمان
                    className: "!p-0 !bg-transparent !shadow-none !border-0 !min-w-[320px] !mb-4",
                    style: { boxShadow: "none", background: "transparent" },
                }
            );
        };

        // لیسنرها
        channel.listen(".export.ready", handleExportReady);
        channel.listen("export.ready", handleExportReady);

        return () => {
            channel.stopListening(".export.ready");
            channel.stopListening("export.ready");
        };
    }, [userId, echoInstance]);

    return null;
};