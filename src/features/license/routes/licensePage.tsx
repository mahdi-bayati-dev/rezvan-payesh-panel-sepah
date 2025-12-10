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
import { useAppDispatch, useAppSelector } from "@/hook/reduxHooks";
import {
    fetchLicenseStatus,
    activateLicense,
    selectLicenseData,
    selectIsLicenseLoading,
    selectIsActivating,
    clearLicenseError
} from "@/store/slices/licenseSlice";

import { cn } from "@/lib/utils/cn";

const LicensePage = () => {
    const dispatch = useAppDispatch();

    const licenseData = useAppSelector(selectLicenseData);
    const isLoading = useAppSelector(selectIsLicenseLoading);
    const isActivating = useAppSelector(selectIsActivating);

    const [tokenInput, setTokenInput] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!licenseData) {
            dispatch(fetchLicenseStatus());
        }
    }, [dispatch, licenseData]);

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

        dispatch(clearLicenseError());

        try {
            await dispatch(activateLicense({ license_token: tokenInput })).unwrap();
            toast.success("لایسنس با موفقیت فعال شد.");
            setTokenInput("");
        } catch (errorMessage: any) {
            toast.error(errorMessage || "فعال‌سازی انجام نشد.");
        }
    };

    if (isLoading && !licenseData) {
        return (
            <div className="flex h-full items-center justify-center animate-pulse">
                <Loader2 className="animate-spin text-primaryL dark:text-primaryD h-10 w-10" />
                <span className="mr-3 font-medium text-muted-foregroundL dark:text-muted-foregroundD">در حال بررسی اصالت نرم‌افزار...</span>
            </div>
        );
    }

    if (!licenseData && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foregroundL dark:text-muted-foregroundD">
                <ServerCrash className="h-16 w-16 mb-4 opacity-50 text-destructiveL dark:text-destructiveD" />
                <p className="font-bold">اطلاعات لایسنس در دسترس نیست.</p>
                <p className="text-sm mt-2 mb-4">لطفاً اتصال به سرور را بررسی کنید.</p>
                <button
                    onClick={() => dispatch(fetchLicenseStatus())}
                    className="px-4 py-2 bg-primaryL text-primary-foregroundL rounded-lg shadow hover:bg-primaryL/90 dark:bg-primaryD dark:text-primary-foregroundD transition-colors"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    const isTrial = licenseData?.status === 'trial';
    const isLicensed = licenseData?.status === 'licensed';

    const displayDate = licenseData?.expires_at
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
                {/* بخش نمایش وضعیت */}
                <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className={cn(
                        "absolute top-0 right-0 w-2 h-full transition-colors duration-500",
                        isLicensed ? "bg-successL-foreground dark:bg-successD-foreground" : "bg-warningL-foreground dark:bg-warningD-foreground"
                    )} />

                    <div className="flex items-center gap-3 mb-6">
                        {isLicensed ? (
                            <ShieldCheck className="w-8 h-8 text-successL-foreground dark:text-successD-foreground" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-warningL-foreground dark:text-warningD-foreground" />
                        )}
                        <h2 className="text-xl font-semibold text-foregroundL dark:text-foregroundD">وضعیت سیستم</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL dark:text-muted-foregroundD">وضعیت فعلی:</span>
                            <span className={cn(
                                "font-bold px-2 py-0.5 rounded text-sm transition-colors",
                                isLicensed 
                                    ? "bg-successL-background text-successL-foreground dark:bg-successD-background dark:text-successD-foreground" 
                                    : "bg-warningL-background text-warningL-foreground dark:bg-warningD-background dark:text-warningD-foreground"
                            )}>
                                {isLicensed ? "نسخه فعال (Licensed)" : "نسخه آزمایشی (Trial)"}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL dark:text-muted-foregroundD">محدودیت کاربر:</span>
                            <span className="font-bold text-foregroundL dark:text-foregroundD">{licenseData?.user_limit} کاربر</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-borderL/50 dark:border-borderD/50">
                            <span className="text-muted-foregroundL dark:text-muted-foregroundD">تاریخ انقضا:</span>
                            <span className="font-medium text-foregroundL dark:text-foregroundD" dir="ltr">
                                {displayDate}
                            </span>
                        </div>

                        <div className="mt-6 bg-secondaryL/50 dark:bg-secondaryD/50 p-4 rounded-lg border border-dashed border-borderL dark:border-borderD">
                            <label className="text-xs text-muted-foregroundL dark:text-muted-foregroundD block mb-2">
                                شناسه نصب (Installation ID)
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-backgroundL-500 dark:bg-backgroundD p-2 rounded text-xs border border-borderL dark:border-borderD select-all truncate text-foregroundL dark:text-foregroundD">
                                    {licenseData?.installation_id}
                                </code>
                                <button
                                    onClick={handleCopyId}
                                    className="p-2 hover:bg-primaryL hover:text-white dark:hover:bg-primaryD dark:hover:text-black rounded-md transition-colors text-muted-foregroundL dark:text-muted-foregroundD"
                                    title="کپی شناسه"
                                >
                                    {copied ? <CheckCircle size={18} className="text-successL-foreground dark:text-successD-foreground" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* بخش فعال‌سازی */}
                <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                        <span className="w-2 h-2 rounded-full bg-primaryL dark:bg-primaryD block"></span>
                        فعال‌سازی / تمدید
                    </h2>

                    <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mb-4 leading-relaxed">
                        برای ارتقا به نسخه تجاری یا تمدید، توکن دریافتی را وارد کنید.
                    </p>

                    <div className="flex-1 flex flex-col gap-3">
                        <textarea
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="توکن لایسنس (eyJ...)"
                            className="w-full flex-1 min-h-[150px] p-3 rounded-lg bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD focus:border-transparent resize-none text-xs transition-shadow text-foregroundL dark:text-foregroundD"
                            dir="ltr"
                            disabled={isActivating}
                        />

                        <button
                            onClick={handleActivate}
                            disabled={isActivating || !tokenInput}
                            className="w-full py-3 bg-primaryL hover:bg-primaryL/90 text-primary-foregroundL dark:bg-primaryD dark:hover:bg-primaryD/90 dark:text-primary-foregroundD font-bold rounded-lg shadow-lg shadow-primaryL/20 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isActivating ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" /> در حال فعال‌سازی...
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

export default LicensePage;