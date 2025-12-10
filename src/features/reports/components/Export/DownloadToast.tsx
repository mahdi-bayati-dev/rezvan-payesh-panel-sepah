import { useEffect, useState, useRef } from "react";
import { toast, } from "react-toastify";
import {
    Download,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    RefreshCcw
} from "lucide-react";

import axiosInstance from "@/lib/AxiosConfig";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface DownloadToastContentProps {
    url: string;
    name: string;
    closeToast?: () => void;
    toastProps?: any;
}

type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error';

const DownloadToastContent = ({ url, name, closeToast }: DownloadToastContentProps) => {
    const [status, setStatus] = useState<DownloadStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [totalSize, setTotalSize] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                onDownloadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    if (total) {
                        setTotalSize(total);
                        const percent = Math.round((progressEvent.loaded * 100) / total);
                        setProgress(percent);
                    }
                },
            });

            const contentType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", name);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            setStatus('success');

            setTimeout(() => {
                if (closeToast) closeToast();
            }, 4000);

        } catch (error: any) {
            console.error("Download Error:", error);
            setStatus('error');

            let msg = "خطا در دانلود فایل.";
            if (error.response) {
                const s = error.response.status;
                if (s === 401) msg = "نیاز به ورود مجدد.";
                else if (s === 403) msg = "دسترسی غیرمجاز.";
                else if (s === 404) msg = "فایل یافت نشد.";

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

    const renderIcon = () => {
        switch (status) {
            case 'downloading':
                // text-blue-600 -> text-infoL-foreground
                return <div className="animate-bounce text-infoL-foreground dark:text-infoD-foreground"><Download className="w-6 h-6" /></div>;
            case 'success':
                // text-green-500 -> text-successL-foreground
                return <CheckCircle2 className="w-6 h-6 text-successL-foreground dark:text-successD-foreground" />;
            case 'error':
                // text-red-500 -> text-destructiveL-foreground
                return <AlertCircle className="w-6 h-6 text-destructiveL-foreground dark:text-destructiveD-foreground" />;
            default:
                // text-gray-500 -> text-muted-foregroundL
                return <FileText className="w-6 h-6 text-muted-foregroundL dark:text-muted-foregroundD" />;
        }
    };

    return (
        <div className="w-full max-w-sm bg-backgroundL-500 dark:bg-backgroundD rounded-xl shadow-lg border border-borderL dark:border-borderD overflow-hidden font-sans dir-rtl transition-all duration-300">
            {/* هدر کارت */}
            <div className="p-4 flex items-start gap-3">
                <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors duration-300
                    ${status === 'success' ? 'bg-successL-background dark:bg-successD-background' :
                        status === 'error' ? 'bg-destructiveL-background dark:bg-destructiveD-background' :
                            'bg-secondaryL dark:bg-secondaryD'}`}>
                    {renderIcon()}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-sm font-bold text-foregroundL dark:text-foregroundD leading-tight">
                        {status === 'success' ? 'دانلود موفق' :
                            status === 'error' ? 'دانلود ناموفق' :
                                status === 'downloading' ? 'در حال دریافت...' : 'گزارش آماده است'}
                    </h4>
                    <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1 truncate dir-ltr text-right" title={name}>
                        {name}
                    </p>
                    {totalSize && status === 'downloading' && (
                        <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD mt-0.5 block">
                            حجم تقریبی: {formatBytes(totalSize)}
                        </span>
                    )}
                </div>

                {/* دکمه بستن */}
                <button
                    onClick={closeToast}
                    className="text-muted-foregroundL hover:text-foregroundL dark:text-muted-foregroundD dark:hover:text-foregroundD transition-colors p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* بدنه کارت */}
            <div className="px-4 pb-4 pt-0">

                {/* حالت دانلود */}
                {status === 'downloading' && (
                    <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between text-[10px] text-infoL-foreground dark:text-infoD-foreground font-medium px-0.5">
                            <span>{progress}%</span>
                            <span>در حال پردازش...</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondaryL dark:bg-secondaryD rounded-full overflow-hidden">
                            <div
                                className="h-full bg-infoL-foreground dark:bg-infoD-foreground transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* حالت خطا */}
                {status === 'error' && (
                    <div className="mt-2 space-y-3">
                        <div className="text-[11px] text-destructiveL-foreground dark:text-destructiveD-foreground bg-destructiveL-background dark:bg-destructiveD-background p-2 rounded-lg border border-destructiveL-foreground/10">
                            {errorMessage}
                        </div>
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-white bg-destructiveL hover:bg-destructiveL/90 rounded-lg transition-colors"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            تلاش مجدد
                        </button>
                    </div>
                )}

                {/* حالت اولیه */}
                {status === 'idle' && (
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-white bg-infoL-foreground hover:bg-infoL-foreground/90 active:scale-[0.98] rounded-lg shadow-sm transition-all duration-200"
                        >
                            <Download className="w-4 h-4" />
                            دریافت فایل
                        </button>
                    </div>
                )}

                {/* حالت موفقیت */}
                {status === 'success' && (
                    <div className="mt-2">
                        <div className="w-full py-2 text-xs font-medium text-successL-foreground bg-successL-background dark:text-successD-foreground dark:bg-successD-background rounded-lg flex items-center justify-center gap-2 border border-successL-foreground/10">
                            فایل در دستگاه ذخیره شد
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const GlobalNotificationHandler = () => {
    const userId = useAppSelector((state) => state.auth.user?.id);

    // ✅ رفع خطا: تغییر تایپ به any | null برای جلوگیری از خطای بیلد
    // (چون ممکن است تایپ Echo به درستی از کتابخانه ایمپورت نشود)
    const [echoInstance, setEchoInstance] = useState<any | null>(null);
    const checkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        }, 2000);

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, [echoInstance]);

    useEffect(() => {
        if (!echoInstance || !userId) return;

        const channelName = `App.User.${userId}`;
        const channel = echoInstance.private(channelName);

        const handleExportReady = (e: any) => {
            console.log("📥 [GlobalHandler] Export Ready:", e);

            const url = e.download_url;
            const name = e.report_name || `Report-${new Date().toISOString().split('T')[0]}.xlsx`;

            if (!url) return;

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
                    draggable: false,
                    closeButton: false,
                    className: "!p-0 !bg-transparent !shadow-none !border-0 !min-w-[320px] !mb-4",
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