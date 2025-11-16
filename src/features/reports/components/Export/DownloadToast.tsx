import { useEffect } from "react";
// import { toast } from "react-toastify"; // (حذف شد - استفاده نمی‌شود)
import { getEcho, leaveChannel } from "@/lib/echoService";

// [اصلاح ۱] بازگرداندن ایمپورت‌های Redux
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

// (کامپوننت DownloadToast حذف شد چون مودال جایش را گرفت)

export const GlobalNotificationHandler = () => {
    // [اصلاح ۲] بازگرداندن منطق دریافت userId
    const user = useAppSelector(selectUser);
    const userId = user?.id;

    useEffect(() => {
        const echo = getEcho();

        // [اصلاح ۳] وابستگی به userId بازگردانده شد
        if (!echo || !userId) {
            if (!echo) {
                console.error("[GlobalHandler] Echo not initialized.");
            }
            if (!userId) {
                console.warn(
                    "[GlobalHandler] User ID not available. Waiting for login."
                );
            }
            return;
        }

        // --- [اصلاح ۴ - بازگشت به داکیومنت] ---
        // این فایل هم باید از نام کانال صحیح ('App.User.*') استفاده کند
        const userChannelName = `App.User.${userId}`;
        // --- [پایان اصلاح] ---

        console.log(
            `[GlobalHandler] در حال عضویت در کانال خصوصی: ${userChannelName} (برای نوتیفیکیشن‌های عمومی)`
        );
        const privateChannel = echo.private(userChannelName);

        privateChannel.error((error: any) => {
            // اگر بک‌اند مشکل را حل کرده باشد، این خطا هم نباید رخ دهد
            console.error(
                `[GlobalHandler] خطای عضویت در کانال خصوصی ${userChannelName}:`,
                error
            );
        });

        // رویداد export.ready از اینجا حذف شده چون مودال آن را مدیریت می‌کند
        // ... (می‌توانید به رویدادهای دیگر گوش دهید) ...

        return () => {
            console.log(`[GlobalHandler] خروج از کانال: ${userChannelName}`);
            leaveChannel(userChannelName);
        };
    }, [userId]); // [اصلاح ۵] وابستگی به userId بازگردانده شد

    return null;
};