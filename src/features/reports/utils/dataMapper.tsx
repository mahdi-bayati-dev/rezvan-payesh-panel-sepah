import {
    type ActivityLog,
    type ApiAttendanceLog,
} from "@/features/reports/types";

import { parseISO } from "date-fns";
import { format } from "date-fns-jalali";
import { faIR } from "date-fns/locale";
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

    // لاگ‌های دیباگ حذف شدند

    const timestamp = parseISO(apiLog.timestamp);

    const employeeName = apiLog.employee
        ? `${apiLog.employee.first_name} ${apiLog.employee.last_name}`
        : "کاربر نامشخص";

    const employeeIdNum = apiLog.employee_id;
    // ID داخل آبجکت employee همان User ID است
    const employeeUserId = apiLog.employee ? apiLog.employee.id : 0;

    // --- [اصلاح کلیدی] ---
    // حالا `personnel_code` رو می‌خونیم (که در API شما وجود داره)
    // به جای `employee_code` (که در تایپ اشتباه بود)
    const employeeCode = apiLog.employee
        ? apiLog.employee.personnel_code || `ID: ${employeeIdNum}`
        : `ID: ${apiLog.employee_id}`;
    // --- [پایان اصلاح] ---

    const employeeAvatar = apiLog.employee
        ? (apiLog.employee as any).avatarUrl
        : undefined;

    const isManual = apiLog.source_type !== "auto";

    const isAllowed =
        apiLog.is_allowed === undefined
            ? true
            : apiLog.is_allowed;

    // آبجکت کارمند مپ شده
    const mappedEmployee = {
        id: employeeIdNum, // شناسه کارمندی
        userId: employeeUserId, // شناسه کاربری (برای رفتن به پروفایل)
        name: employeeName,
        employeeId: toPersianNumbers(employeeCode),
        avatarUrl: employeeAvatar,
    };

    // لاگ‌های دیباگ حذف شدند

    return {
        id: apiLog.id.toString(),
        employee: mappedEmployee, // استفاده از آبجکت مپ شده
        activityType: mapEventType(apiLog.event_type),
        trafficArea: apiLog.source_name,
        date: toPersianNumbers(format(timestamp, "yyyy/MM/dd", { locale: faIR })),
        time: toPersianNumbers(format(timestamp, "HH:mm")),
        lateness_minutes: apiLog.lateness_minutes || 0,
        early_departure_minutes: apiLog.early_departure_minutes || 0,
        is_allowed: isAllowed,
        remarks: apiLog.remarks,
        is_manual: isManual,
    };
};