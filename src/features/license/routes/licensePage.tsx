import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
    Copy, 
    CheckCircle, 
    AlertTriangle, 
    ShieldCheck, 
    Loader2,
    ServerCrash
} from "lucide-react";
import { licenseApi } from "../api/licenseService";
import type { LicenseState } from "../types";
import { cn } from "@/lib/utils/cn";

// [FIX] تغییر تعریف کامپوننت: حذف کلمه export از اینجا
const LicensePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isActivating, setIsActivating] = useState(false);
    const [licenseData, setLicenseData] = useState<LicenseState | null>(null);
    const [tokenInput, setTokenInput] = useState("");
    const [copied, setCopied] = useState(false);

    const fetchLicenseStatus = async () => {
        setIsLoading(true);
        try {
            const data = await licenseApi.getStatus();
            setLicenseData(data);
        } catch (error: any) {
            console.error("License fetch failed:", error?.message || "Unknown error");
            
            if (error?.response?.status !== 403) {
                 toast.error("در دریافت اطلاعات لایسنس مشکلی پیش آمد.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenseStatus();
    }, []);

    const handleCopyId = () => {
        if (licenseData?.installation_id) {
            navigator.clipboard.writeText(licenseData.installation_id);
            setCopied(true);
            toast.success("شناسه نصب کپی شد.");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleActivate = async () => {
        if (!tokenInput.trim()) {
            toast.warn("لطفاً توکن لایسنس را وارد کنید.");
            return;
        }

        setIsActivating(true);
        try {
            const response = await licenseApi.activate({ license_token: tokenInput });
            toast.success(response.message);
            setLicenseData(response.license);
            setTokenInput("");
        } catch (error: any) {
            let msg = "فعال‌سازی انجام نشد.";
            if (error.response?.data?.message && typeof error.response.data.message === 'string') {
                msg = error.response.data.message;
            }
            toast.error(msg);
        } finally {
            setIsActivating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-primaryL h-10 w-10" />
                <span className="mr-3">در حال بررسی وضعیت لایسنس...</span>
            </div>
        );
    }

    if (!licenseData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foregroundL">
                <ServerCrash className="h-16 w-16 mb-4 opacity-50" />
                <p>اطلاعات لایسنس در دسترس نیست.</p>
                <button onClick={fetchLicenseStatus} className="mt-4 text-primaryL underline">
                    تلاش مجدد
                </button>
            </div>
        );
    }

    const isTrial = licenseData.status === 'trial';
    const isLicensed = licenseData.status === 'licensed';

    const displayDate = licenseData.expires_at 
        ? new Date(licenseData.expires_at).toLocaleDateString('fa-IR') 
        : (isTrial ? "محدودیت ۳۰ روزه" : "نامحدود");

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD mb-2">
                    مدیریت لایسنس نرم‌افزار
                </h1>
                <p className="text-muted-foregroundL dark:text-muted-foregroundD">
                    وضعیت فعلی سیستم و فعال‌سازی نسخه تجاری
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className={cn(
                        "absolute top-0 right-0 w-2 h-full",
                        isLicensed ? "bg-green-500" : "bg-yellow-500"
                    )} />

                    <div className="flex items-center gap-3 mb-6">
                        {isLicensed ? (
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        )}
                        <h2 className="text-xl font-semibold">وضعیت سیستم</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL">وضعیت فعلی:</span>
                            <span className={cn(
                                "font-bold px-2 py-0.5 rounded text-sm",
                                isLicensed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                                {isLicensed ? "نسخه فعال (Licensed)" : "نسخه آزمایشی (Trial)"}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL">محدودیت کاربر:</span>
                            <span className="font-mono font-bold">{licenseData.user_limit} کاربر</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL">تاریخ انقضا:</span>
                            <span className="font-medium" dir="ltr">
                                {displayDate}
                            </span>
                        </div>

                        <div className="mt-6 bg-secondaryL/50 dark:bg-secondaryD/50 p-4 rounded-lg border border-dashed border-borderL dark:border-borderD">
                            <label className="text-xs text-muted-foregroundL block mb-2">
                                شناسه نصب (Installation ID)
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-backgroundL dark:bg-backgroundD p-2 rounded text-xs font-mono border border-borderL select-all truncate">
                                    {licenseData.installation_id}
                                </code>
                                <button 
                                    onClick={handleCopyId}
                                    className="p-2 hover:bg-primaryL hover:text-white rounded-md transition-colors text-muted-foregroundL"
                                    title="کپی شناسه"
                                >
                                    {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl p-6 shadow-sm flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primaryL block"></span>
                        فعال‌سازی / تمدید
                    </h2>
                    
                    <p className="text-sm text-muted-foregroundL mb-4 leading-relaxed">
                        توکن دریافتی از پشتیبانی را وارد کنید.
                    </p>

                    <div className="flex-1 flex flex-col gap-3">
                        <textarea
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="توکن لایسنس (eyJ...)"
                            className="w-full flex-1 min-h-[150px] p-3 rounded-lg bg-backgroundL dark:bg-backgroundD border border-borderL dark:border-borderD focus:ring-2 focus:ring-primaryL focus:border-transparent resize-none font-mono text-xs"
                            dir="ltr"
                        />
                        
                        <button
                            onClick={handleActivate}
                            disabled={isActivating || !tokenInput}
                            className="w-full py-3 bg-primaryL hover:bg-primaryL-600 text-white font-bold rounded-lg shadow-lg shadow-primaryL/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isActivating ? (
                                <>
                                    <Loader2 className="animate-spin" /> بررسی...
                                </>
                            ) : (
                                "ثبت و فعال‌سازی"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// [FIX] اضافه کردن export default در انتها برای سازگاری با React.lazy
export default LicensePage;