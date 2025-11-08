import {
    type ActivityLog,
    type ApiAttendanceLog
} from '@/features/reports/types';

// ۱. [اصلاح] ایمپورت کتابخانه‌های سبک جایگزین jalali-moment
import { parseISO } from 'date-fns';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns/locale'; // برای فرمت جلالی

// مپ کردن event_type (بدون تغییر)
const mapEventType = (eventType: 'check_in' | 'check_out'): ActivityLog['activityType'] => {
    // ... (کد شما بدون تغییر)
    switch (eventType) {
        case 'check_in':
            return 'entry';
        case 'check_out':
            return 'exit';
        default:
            return 'entry';
    }
};

/**
 * یک لاگ خام از API را به فرمتی که UI نیاز دارد تبدیل می‌کند
 */
export const mapApiLogToActivityLog = (apiLog: ApiAttendanceLog): ActivityLog => {

    // ۳. [اصلاح] استفاده از parseISO برای خواندن رشته UTC
    // این یک آبجکت Date استاندارد جاوااسکریپت برمی‌گرداند
    // که زمان را به صورت محلی (local timezone) در خود دارد.
    const timestamp = parseISO(apiLog.timestamp);

    return {
        id: apiLog.id.toString(),
        employee: {
            id: apiLog.employee.id,
            name: `${apiLog.employee.first_name} ${apiLog.employee.last_name}`,
            employeeId: apiLog.employee.employee_code || `ID: ${apiLog.employee.id}`,
            avatarUrl: apiLog.employee.avatarUrl || undefined,
        },
        activityType: mapEventType(apiLog.event_type),
        trafficArea: apiLog.source_name,

        // ۵. [اصلاح] استفاده از format برای نمایش
        // 'format' از 'date-fns-jalali' به طور خودکار تاریخ را به جلالی تبدیل می‌کند
        date: format(timestamp, 'yyyy/MM/dd', { locale: faIR }), // -> "۱۴۰۴/۰۸/۱۷"

        // 'format' همچنین می‌تواند زمان محلی را به درستی نمایش دهد
        time: format(timestamp, 'HH:mm'), // -> "08:00"

        // فیلدهای جدید (بدون تغییر)
        is_allowed: apiLog.is_allowed,
        remarks: apiLog.remarks,
    };
};