import {
    type ActivityLog,
    type ApiAttendanceLog,
} from "../types";
import { toPersianNumbers } from "./toPersianNumbers";

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

    // 1. حذف Z برای جلوگیری از تغییر ساعت توسط مرورگر (Local Time Strategy)
    const rawTimestamp = apiLog.timestamp.replace('Z', '').replace('+00:00', '');
    
    // 2. ساخت آبجکت تاریخ
    const timestamp = new Date(rawTimestamp);

    // 3. تبدیل به تاریخ شمسی
    const jalaliDate = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        calendar: "persian" 
    }).format(timestamp); 

    // 4. استخراج ساعت
    const timeString = new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, 
    }).format(timestamp);


    const employeeName = apiLog.employee
        ? `${apiLog.employee.first_name} ${apiLog.employee.last_name}`
        : "کاربر نامشخص";

    const employeeIdNum = apiLog.employee_id;
    const employeeUserId = apiLog.employee ? apiLog.employee.user_id : 0;

    const employeeCode = apiLog.employee
        ? apiLog.employee.personnel_code || `ID: ${employeeIdNum}`
        : `ID: ${apiLog.employee_id}`;

    // استخراج آواتار
    let employeeAvatar = apiLog.employee?.avatarUrl;
    if (!employeeAvatar && apiLog.employee?.images && apiLog.employee.images.length > 0) {
        employeeAvatar = apiLog.employee.images[0].url;
    }

    const isManual = apiLog.source_type !== "auto";
    const isAllowed = apiLog.is_allowed === undefined ? true : apiLog.is_allowed;

    const mappedEmployee = {
        id: employeeIdNum,
        userId: employeeUserId,
        name: employeeName,
        // ✅ تبدیل کد پرسنلی به فارسی در همین مرحله
        employeeId: toPersianNumbers(employeeCode),
        avatarUrl: employeeAvatar,
    };

    return {
        id: apiLog.id.toString(),
        employee: mappedEmployee,
        activityType: mapEventType(apiLog.event_type),
        trafficArea: apiLog.source_name,
        // ✅ تبدیل تاریخ و ساعت به فارسی
        date: toPersianNumbers(jalaliDate),
        time: toPersianNumbers(timeString),
        lateness_minutes: apiLog.lateness_minutes || 0,
        early_departure_minutes: apiLog.early_departure_minutes || 0,
        is_allowed: isAllowed,
        remarks: apiLog.remarks,
        is_manual: isManual,
    };
};