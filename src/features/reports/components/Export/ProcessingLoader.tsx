import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react";
// [اصلاح ۱] ایمپورت 'leaveChannel'
import { getEcho, leaveChannel } from "@/lib/echoService";

// [اصلاح ۲] بازگرداندن ایمپورت‌های Redux
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

interface ExportStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// (کامپوننت ProcessingLoader بدون تغییر)
const ProcessingLoader = () => (
    <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
    >
        {/* ... (کد SVG لودر بدون تغییر) ... */}
        <path
            d="M100 60C100 82.0914 82.0914 100 60 100C37.9086 100 20 82.0914 20 60C20 37.9086 37.9086 20 60 20"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 10"
            className="animate-spin text-primaryL dark:text-primaryD opacity-30"
            style={{ animationDuration: "3s" }}
        />
        <path
            d="M60 20C82.0914 20 100 37.9086 100 60"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-spin text-primaryL dark:text-primaryD"
            style={{ animationDuration: "1.5s" }}
        />
    </svg>
);

type Status = "processing" | "ready" | "error";

export const ExportStatusModal = ({
    isOpen,
    onClose,
}: ExportStatusModalProps) => {
    const [status, setStatus] = useState<Status>("processing");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [reportName, setReportName] = useState<string>("گزارش شما");

    // [اصلاح ۳] بازگرداندن منطق دریافت userId از Redux
    const user = useAppSelector(selectUser);
    const userId = user?.id;

    useEffect(() => {
        // [اصلاح ۴] وابستگی به userId بازگردانده شد
        // اگر مودال باز نیست یا userId وجود ندارد، کاری نکن
        if (!isOpen || !userId) {
            setStatus("processing");
            setDownloadUrl(null);
            return;
        }

        const echo = getEcho();
        if (!echo) {
            console.error("[StatusModal] Echo not initialized.");
            setStatus("error");
            return;
        }

        // --- [اصلاح ۵ - بازگشت به داکیومنت] ---
        // حالا که بک‌اند خطای 403 را برطرف می‌کند،
        // ما به کانال صحیح طبق داکیومنت (App.User.{id}) گوش می‌دهیم
        // (namespace "App" از فایل echoService.ts می‌آید)
        const channelName = `App.User.${userId}`;
        // --- [پایان اصلاح] ---

        const eventName = "export.ready"; // طبق داکیومنت

        // لاگ کنسول حالا باید 'App.User.1' (یا هر ID دیگری) را نشان دهد
        console.log(`[StatusModal] Listening on ${channelName} for ${eventName}`);
        const privateChannel = echo.private(channelName);

        privateChannel
            .error((error: any) => {
                // حالا منتظر می‌مانیم ببینیم آیا این خطا توسط بک‌اند برطرف شده یا نه
                console.error(
                    `[StatusModal] Failed to subscribe to ${channelName}`,
                    error
                );
                setStatus("error");
            })
            .listen(
                eventName,
                (data: { report_name: string; download_url: string }) => {
                    // اگر این لاگ را ببینید، یعنی بک‌اند پیام را ارسال کرده است
                    console.log("[StatusModal] Event received!", data);
                    if (data.download_url && data.report_name) {
                        setDownloadUrl(data.download_url);
                        setReportName(data.report_name);
                        setStatus("ready");
                    } else {
                        console.error("[StatusModal] Invalid event payload", data);
                        setStatus("error");
                    }
                }
            );

        // Cleanup
        return () => {
            console.log(`[StatusModal] Stopping listening on ${channelName}`);
            privateChannel.stopListening(eventName);
            // [اصلاح ۶] چون این کانال مختص این مودال است، از آن خارج می‌شویم
            leaveChannel(channelName);
        };
    }, [isOpen, userId]); // [اصلاح ۷] وابستگی به userId بازگردانده شد

    // (بخش JSX رندر مودال بدون تغییر)
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogContent className="max-w-md" onClose={onClose}>
                <DialogHeader>
                    {/* ... (کد هدر مودال بدون تغییر) ... */}
                    <DialogTitle>وضعیت خروجی اکسل</DialogTitle>
                    <DialogDescription>
                        {status === "processing" &&
                            "گزارش شما در حال آماده‌سازی است. لطفا صبور باشید..."}
                        {status === "ready" && "گزارش شما با موفقیت آماده شد."}
                        {status === "error" && "خطایی در ساخت گزارش رخ داد."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center">
                    {/* ... (کد نمایش وضعیت‌ها بدون تغییر) ... */}
                    {status === "processing" && (
                        <>
                            <ProcessingLoader />
                            <p className="mt-4 text-lg font-medium text-foregroundL dark:text-foregroundD">
                                در حال پردازش...
                            </p>
                            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                این عملیات ممکن است چند دقیقه طول بکشد.
                            </p>
                        </>
                    )}
                    {status === "ready" && (
                        <>
                            <CheckCircle className="w-20 h-20 text-successL dark:text-successD mx-auto" />
                            <p className="mt-4 text-lg font-medium text-foregroundL dark:text-foregroundD">
                                {reportName}
                            </p>
                            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                آماده دانلود است.
                            </p>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <AlertCircle className="w-20 h-20 text-destructiveL dark:text-destructiveD mx-auto" />
                            <p className="mt-4 text-lg font-medium text-foregroundL dark:text-foregroundD">
                                عملیات ناموفق بود
                            </p>
                            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                لطفا دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
                            </p>
                        </>
                    )}
                </div>

                <DialogFooter>
                    {/* ... (کد فوتر و دکمه‌ها بدون تغییر) ... */}
                    {status === "ready" ? (
                        <a
                            href={downloadUrl!}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD rounded-lg font-medium"
                            onClick={onClose}
                        >
                            <Download className="w-5 h-5 ml-2" />
                            دانلود فایل
                        </a>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={status === "processing"}
                        >
                            {status === "processing" ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    صبر کنید...
                                </>
                            ) : (
                                "بستن"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};