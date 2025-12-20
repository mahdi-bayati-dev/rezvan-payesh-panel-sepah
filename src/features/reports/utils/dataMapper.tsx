import {
    type ActivityLog,
    type ApiAttendanceLog,
} from "../types";
import { toPersianNumbers } from "./toPersianNumbers";

/**
 * مپ کردن نوع رویداد بک‌ایند به تایپ‌های رابط کاربری
 */
const mapEventType = (
    eventType: "check_in" | "check_out"
): ActivityLog["activityType"] => {
    switch (eventType) {
        case "check_in":
            return "entry";
        case "check_out":
            return "exit";
        default:
            return "entry";
    }
};

/**
 * تبدیل دیتای خام API به مدل استاندارد UI
 * تمرکز بر دقت زمان و تاریخ شمسی
 */
export const mapApiLogToActivityLog = (
    apiLog: ApiAttendanceLog
): ActivityLog => {
    // 🔍 DEBUG LOG: برای بررسی دیتای ورودی از سمت سرور
    // console.debug(`[DataMapper] Processing Log ID: ${apiLog.id}`, apiLog.timestamp);

    try {
        // 1. استراتژی زمان محلی (Local Time Strategy)
        // حذف Z و آفست‌ها برای جلوگیری از تبدیل خودکار مرورگر به ساعت محلی متفاوت (اگر سرور Naive دیتا می‌دهد)
        const normalizedTimestamp = apiLog.timestamp
            .replace('Z', '')
            .replace(/\+\d{2}:\d{2}$/, '') // حذف آفست مثل +03:30
            .replace('T', ' '); // تبدیل فرمت ISO به استاندارد خوانا برای Date

        const timestamp = new Date(normalizedTimestamp);

        // بررسی معتبر بودن تاریخ
        if (isNaN(timestamp.getTime())) {
            throw new Error(`Invalid Date for Log ${apiLog.id}`);
        }

        // 2. تبدیل به تاریخ شمسی با استفاده از Intl (استاندارد و بدون پکیج اضافه)
        const jalaliDate = new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            calendar: "persian"
        }).format(timestamp);

        // 3. استخراج ساعت و دقیقه با فرمت ۲۴ ساعته
        const timeString = new Intl.DateTimeFormat("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit", // اضافه کردن ثانیه برای دقت ادمین در بررسی‌ها
            hour12: false,
        }).format(timestamp);

        // 4. مدیریت اطلاعات کارمند و آواتار (با پشتیبانی از سوکت و API)
        const employeeName = apiLog.employee
            ? `${apiLog.employee.first_name} ${apiLog.employee.last_name}`
            : "کاربر نامشخص";

        const employeeUserId = apiLog.employee ? apiLog.employee.user_id : 0;
        const employeeCode = apiLog.employee?.personnel_code || `ID: ${apiLog.employee_id}`;

        let employeeAvatar = apiLog.employee?.avatarUrl || apiLog.employee?.avatar_url;
        if (!employeeAvatar && apiLog.employee?.images?.length) {
            employeeAvatar = apiLog.employee.images[0].url;
        }

        const isManual = apiLog.source_type !== "auto";
        const isAllowed = apiLog.is_allowed ?? true; // پیش‌فرض تایید شده اگر فیلد نباشد

        return {
            id: apiLog.id.toString(),
            employee: {
                id: apiLog.employee_id,
                userId: employeeUserId,
                name: employeeName,
                employeeId: toPersianNumbers(employeeCode),
                avatarUrl: employeeAvatar,
            },
            activityType: mapEventType(apiLog.event_type),
            trafficArea: apiLog.source_name || "نامشخص",
            date: toPersianNumbers(jalaliDate),
            time: toPersianNumbers(timeString),
            lateness_minutes: apiLog.lateness_minutes || 0,
            early_departure_minutes: apiLog.early_departure_minutes || 0,
            is_allowed: isAllowed,
            remarks: apiLog.remarks,
            is_manual: isManual,
        };
    } catch (error) {
        console.error(`❌ [DataMapper Error] Log ID ${apiLog.id}:`, error);
        // بازگرداندن یک آبجکت Fallback برای جلوگیری از کراش کل جدول
        return {
            id: apiLog.id.toString(),
            employee: { id: 0, userId: 0, name: "خطا در داده", employeeId: "0" },
            activityType: "entry",
            trafficArea: "Error",
            date: "۰۰/۰۰/۰۰",
            time: "۰۰:۰۰",
            lateness_minutes: 0,
            early_departure_minutes: 0,
            is_allowed: false,
            remarks: "خطا در پردازش زمان",
            is_manual: false,
        };
    }
};