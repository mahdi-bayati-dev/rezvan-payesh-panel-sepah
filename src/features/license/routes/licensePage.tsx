import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; 
import {
    Copy,
    CheckCircle,
    AlertTriangle,
    ShieldCheck,
    Loader2,
    ServerCrash,
    ArrowRight,
    LayoutDashboard,
    CheckCircle2
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
import { Button } from "@/components/ui/Button"; // ✅ استفاده از کامپوننت دکمه استاندارد
import { Modal } from "@/components/ui/Modal";   // ✅ استفاده از مدال استاندارد

const LicensePage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate(); // ✅ هوک نویگیشن

    const licenseData = useAppSelector(selectLicenseData);
    const isLoading = useAppSelector(selectIsLicenseLoading);
    const isActivating = useAppSelector(selectIsActivating);

    const [tokenInput, setTokenInput] = useState("");
    const [copied, setCopied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ استیت مدال موفقیت

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
            
            // ✅ لاجیک جدید: نمایش مدال به جای فقط توست
            setTokenInput("");
            setShowSuccessModal(true); 
            
            // پخش صدای موفقیت (اختیاری - یو ایکس جذاب‌تر)
            // const audio = new Audio('/sounds/success.mp3');
            // audio.play().catch(() => {});

        } catch (errorMessage: any) {
            toast.error(errorMessage || "فعال‌سازی انجام نشد.");
        }
    };

    // --- هندلر دکمه‌های مدال و بازگشت ---
    const handleGoHome = () => {
        setShowSuccessModal(false);
        navigate('/');
    };

    if (isLoading && !licenseData) {
        return (
            <div className="flex flex-col h-full items-center justify-center animate-pulse gap-3">
                <Loader2 className="animate-spin text-primaryL dark:text-primaryD h-12 w-12" />
                <span className="font-medium text-lg text-muted-foregroundL dark:text-muted-foregroundD">
                    در حال بررسی اصالت نرم‌افزار...
                </span>
            </div>
        );
    }

    if (!licenseData && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foregroundL dark:text-muted-foregroundD animate-in zoom-in-95 duration-500">
                <div className="bg-destructiveL/10 dark:bg-destructiveD/10 p-6 rounded-full mb-6">
                    <ServerCrash className="h-16 w-16 text-destructiveL dark:text-destructiveD" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-foregroundL dark:text-foregroundD">خطا در دریافت اطلاعات</h2>
                <p className="text-sm mb-6 opacity-80">اطلاعات لایسنس در دسترس نیست. لطفاً اتصال به سرور را بررسی کنید.</p>
                <Button onClick={() => dispatch(fetchLicenseStatus())} variant="outline">
                    تلاش مجدد
                </Button>
            </div>
        );
    }

    const isTrial = licenseData?.status === 'trial';
    const isLicensed = licenseData?.status === 'licensed';

    const displayDate = licenseData?.expires_at
        ? new Date(licenseData.expires_at).toLocaleDateString('fa-IR')
        : (isTrial ? "محدودیت ۳۰ روزه" : "نامحدود");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="w-full max-w-5xl space-y-6">
                
                {/* ✅ هدر صفحه شامل دکمه بازگشت */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD mb-2 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primaryL dark:text-primaryD" />
                            مدیریت لایسنس نرم‌افزار
                        </h1>
                        <p className="text-muted-foregroundL dark:text-muted-foregroundD text-sm md:text-base">
                            وضعیت فعلی سیستم و فعال‌سازی نسخه تجاری
                        </p>
                    </div>
                    
                    {/* دکمه بازگشت */}
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/')} 
                        className="gap-2 self-start md:self-center"
                    >
                        <ArrowRight className="w-4 h-4" />
                        بازگشت به خانه
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                    
                    {/* --- کارت وضعیت (UI بهبود یافته) --- */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        {/* نوار رنگی وضعیت */}
                        <div className={cn(
                            "absolute top-0 right-0 w-2 h-full transition-colors duration-500",
                            isLicensed ? "bg-successL-foreground dark:bg-successD-foreground" : "bg-warningL-foreground dark:bg-warningD-foreground"
                        )} />

                        <div className="flex items-center justify-between mb-8 pl-2">
                            <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">وضعیت سیستم</h2>
                            <div className={cn(
                                "p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20",
                                isLicensed ? "bg-green-500 text-green-600 dark:text-green-400" : "bg-yellow-500 text-yellow-600 dark:text-yellow-400"
                            )}>
                                {isLicensed ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center py-2 border-b border-dashed border-borderL dark:border-borderD">
                                <span className="text-muted-foregroundL dark:text-muted-foregroundD font-medium">نوع لایسنس</span>
                                <span className={cn(
                                    "font-bold px-3 py-1 rounded-lg text-sm transition-colors shadow-sm",
                                    isLicensed 
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                )}>
                                    {isLicensed ? "نسخه فعال (Licensed)" : "نسخه آزمایشی (Trial)"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-dashed border-borderL dark:border-borderD">
                                <span className="text-muted-foregroundL dark:text-muted-foregroundD font-medium">سقف کاربر</span>
                                <span className="font-bold text-foregroundL dark:text-foregroundD flex items-center gap-1">
                                    {licenseData?.user_limit} 
                                    <span className="text-xs font-normal text-muted-foregroundL">نفر</span>
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-dashed border-borderL dark:border-borderD">
                                <span className="text-muted-foregroundL dark:text-muted-foregroundD font-medium">تاریخ انقضا</span>
                                <span className="font-bold text-foregroundL dark:text-foregroundD font-mono" dir="ltr">
                                    {displayDate}
                                </span>
                            </div>

                            <div className="mt-8 bg-secondaryL/30 dark:bg-secondaryD/30 p-4 rounded-xl border border-borderL dark:border-borderD">
                                <label className="text-xs font-semibold text-muted-foregroundL dark:text-muted-foregroundD block mb-3">
                                    شناسه نصب (Installation ID)
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-backgroundL dark:bg-black/20 p-3 rounded-lg text-sm border border-borderL dark:border-borderD select-all truncate text-foregroundL dark:text-foregroundD font-mono tracking-wide">
                                        {licenseData?.installation_id}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={handleCopyId}
                                        className="shrink-0 h-11 w-11"
                                        title="کپی شناسه"
                                    >
                                        {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- کارت فعال‌سازی (UI بهبود یافته) --- */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primaryL/10 dark:bg-primaryD/10 flex items-center justify-center text-primaryL dark:text-primaryD">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                فعال‌سازی / تمدید
                            </h2>
                        </div>

                        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mb-6 leading-relaxed bg-secondaryL/20 dark:bg-secondaryD/20 p-4 rounded-lg border-r-4 border-primaryL dark:border-primaryD">
                            جهت ارتقا به نسخه تجاری یا تمدید اشتراک، کد لایسنس دریافتی از واحد فروش را در کادر زیر وارد نمایید.
                        </p>

                        <div className="flex-1 flex flex-col gap-4">
                            <textarea
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                placeholder="توکن لایسنس (eyJ...)"
                                className="w-full flex-1 min-h-[180px] p-4 rounded-xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD focus:border-transparent resize-none text-sm transition-all shadow-sm focus:shadow-md font-mono text-foregroundL dark:text-foregroundD placeholder:text-muted-foregroundL/50"
                                dir="ltr"
                                disabled={isActivating}
                            />

                            <Button
                                onClick={handleActivate}
                                disabled={isActivating || !tokenInput}
                                size="lg"
                                className="w-full font-bold text-base shadow-lg shadow-primaryL/20 dark:shadow-none transition-all active:scale-[0.98]"
                            >
                                {isActivating ? (
                                    <>
                                        <Loader2 className="animate-spin ml-2 h-5 w-5" /> در حال پردازش...
                                    </>
                                ) : (
                                    "ثبت و فعال‌سازی لایسنس"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ مدال موفقیت */}
            <Modal 
                isOpen={showSuccessModal} 
                onClose={() => {}} // بستن دستی غیرفعال است تا کاربر حتما دکمه را ببیند
                size="md"
            >
                <div className="flex flex-col items-center p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-foregroundL dark:text-foregroundD">
                        فعال‌سازی موفقیت‌آمیز بود!
                    </h3>
                    
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mb-8 leading-relaxed max-w-xs mx-auto">
                        لایسنس نرم‌افزار با موفقیت ثبت شد. هم‌اکنون می‌توانید از تمام امکانات سامانه بدون محدودیت استفاده کنید.
                    </p>
                    
                    <Button 
                        onClick={handleGoHome} 
                        size="lg" 
                        className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                    >
                        <LayoutDashboard className="ml-2 w-5 h-5"/>
                        ورود به داشبورد
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default LicensePage;