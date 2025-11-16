import {
    type ActivityLog,
    type ApiAttendanceLog,
} from "@/features/reports/types";

import { parseISO } from "date-fns";
import { format } from "date-fns-jalali";
import { faIR } from "date-fns/locale";
// [جدید] ایمپورت تابع کمکی
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

/**
 * [به‌روزرسانی]
 * این مپر مقاوم‌سازی شده و اعداد را فارسی می‌کند.
 */
export const mapApiLogToActivityLog = (
    apiLog: ApiAttendanceLog
): ActivityLog => {
    const timestamp = parseISO(apiLog.timestamp);

    // --- [اصلاح ۱] منطق مقاوم‌سازی شده برای آبجکت employee ---
    // اگر آبجکت employee وجود داشت، از آن استفاده کن، وگرنه از مقادیر پایه استفاده کن
    const employeeName = apiLog.employee
        ? `${apiLog.employee.first_name} ${apiLog.employee.last_name}`
        : "کاربر نامشخص"; // فال‌بک

    const employeeIdNum = apiLog.employee ? apiLog.employee.id : apiLog.employee_id;

    // [مهم] اگر employee وجود ندارد، ما user_id را نداریم (0 می‌گذاریم)
    const employeeUserId = apiLog.employee ? apiLog.employee.user_id : 0;

    const employeeCode = apiLog.employee
        ? apiLog.employee.employee_code || `ID: ${employeeIdNum}`
        : `ID: ${apiLog.employee_id}`; // فال‌بک

    const employeeAvatar = apiLog.employee
        ? (apiLog.employee as any).avatarUrl
        : undefined;
    // --- [پایان اصلاح ۱] ---


    const isManual = apiLog.source_type !== "auto";

    // [اصلاح ۲] فیلد 'is_allowed' اختیاری شده
    const isAllowed =
        apiLog.is_allowed === undefined
            ? true // اگر کلا وجود نداشت (مثل JSON شما)، آن را مجاز فرض کن
            : apiLog.is_allowed;

    return {
        id: apiLog.id.toString(),
        employee: {
            id: employeeIdNum, // employee_id
            userId: employeeUserId, // <-- [اصلاح] فیلد جدید اینجا مپ شد (اگر نباشد 0 است)
            name: employeeName,
            // [اصلاح] کد پرسنلی فارسی می‌شود
            employeeId: toPersianNumbers(employeeCode),
            avatarUrl: employeeAvatar,
        },
        activityType: mapEventType(apiLog.event_type),
        trafficArea: apiLog.source_name,

        // [اصلاح] تاریخ و ساعت فارسی می‌شوند
        date: toPersianNumbers(format(timestamp, "yyyy/MM/dd", { locale: faIR })),
        time: toPersianNumbers(format(timestamp, "HH:mm")),

        // [اصلاح] lateness_minutes و early_departure_minutes می‌توانند null باشند
        lateness_minutes: apiLog.lateness_minutes || 0,
        early_departure_minutes: apiLog.early_departure_minutes || 0,

        is_allowed: isAllowed, // <-- [اصلاح] استفاده از متغیر امن
        remarks: apiLog.remarks,
        is_manual: isManual,
    };
};