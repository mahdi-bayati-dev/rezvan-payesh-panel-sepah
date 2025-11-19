import {
    type ActivityLog,
    type ApiAttendanceLog,
} from "@/features/reports/types";

// اصلاح: حذف date-fns چون برای تبدیل به شمسی از Intl استفاده می‌کنیم
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";

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

export const mapApiLogToActivityLog = (
    apiLog: ApiAttendanceLog
): ActivityLog => {

    // 1. استراتژی Local Time: حذف Z برای نادیده گرفتن تایم‌زون
    const rawTimestamp = apiLog.timestamp.replace('Z', '').replace('+00:00', '');
    
    // 2. ساخت آبجکت تاریخ
    const timestamp = new Date(rawTimestamp);

    // 3. تبدیل به تاریخ شمسی با استفاده از API استاندارد Intl
    // این متد به صورت خودکار تقویم را به شمسی (Persian) تبدیل می‌کند
    const jalaliDate = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        calendar: "persian" // تضمین استفاده از تقویم شمسی
    }).format(timestamp); 
    // خروجی مثال: "۱۴۰۳/۱۱/۰۵"

    // 4. استخراج ساعت به فرمت ۲۴ ساعته
    const timeString = new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // فرمت ۲۴ ساعته
        // calendar: "persian" // برای ساعت فرقی نمی‌کند اما محض اطمینان
    }).format(timestamp);


    const employeeName = apiLog.employee
        ? `${apiLog.employee.first_name} ${apiLog.employee.last_name}`
        : "کاربر نامشخص";

    const employeeIdNum = apiLog.employee_id;
    const employeeUserId = apiLog.employee ? apiLog.employee.user_id : 0;

    const employeeCode = apiLog.employee
        ? apiLog.employee.personnel_code || `ID: ${employeeIdNum}`
        : `ID: ${apiLog.employee_id}`;

    const employeeAvatar = apiLog.employee
        ? (apiLog.employee as any).avatarUrl
        : undefined;

    const isManual = apiLog.source_type !== "auto";
    const isAllowed = apiLog.is_allowed === undefined ? true : apiLog.is_allowed;

    const mappedEmployee = {
        id: employeeIdNum,
        userId: employeeUserId,
        name: employeeName,
        employeeId: toPersianNumbers(employeeCode),
        avatarUrl: employeeAvatar,
    };

    return {
        id: apiLog.id.toString(),
        employee: mappedEmployee,
        activityType: mapEventType(apiLog.event_type),
        trafficArea: apiLog.source_name,
        
        // استفاده از تاریخ شمسی تولید شده
        // تابع toPersianNumbers را هم صدا می‌زنیم تا اگر مرورگر اعداد انگلیسی داد، فارسی شوند
        date: toPersianNumbers(jalaliDate),
        time: toPersianNumbers(timeString),
        
        lateness_minutes: apiLog.lateness_minutes || 0,
        early_departure_minutes: apiLog.early_departure_minutes || 0,
        is_allowed: isAllowed,
        remarks: apiLog.remarks,
        is_manual: isManual,
    };
};