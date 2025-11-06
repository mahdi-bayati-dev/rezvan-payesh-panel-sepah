import {
    type ActivityLog,
    type ApiAttendanceLog
} from '@/features/reports/types';

// ۱. [اصلاح] کتابخانه واقعی تاریخ را ایمپورت کنید (مثال: jalali-moment)
// مطمئن شوید که این کتابخانه در پروژه شما نصب است (npm install jalali-moment)
import jalaliMoment from 'jalali-moment';

// مپ کردن event_type به activityType (بدون تغییر)
const mapEventType = (eventType: 'check_in' | 'check_out'): ActivityLog['activityType'] => {
    switch (eventType) {
        case 'check_in':
            return 'entry';
        case 'check_out':
            return 'exit';
        default:
            // TODO: در مورد event_type های دیگر (مثل delay/haste) با بک‌اند صحبت کنید
            return 'entry';
    }
};

/**
 * یک لاگ خام از API را به فرمتی که UI نیاز دارد تبدیل می‌کند
 */
export const mapApiLogToActivityLog = (apiLog: ApiAttendanceLog): ActivityLog => {

    // ۲. [اصلاح] کد "شبیه‌ساز موقت" (mockTimestamp) به طور کامل حذف شد.

    // ۳. [اصلاح] آبجکت تاریخ واقعی را با استفاده از کتابخانه می‌سازیم.
    // کتابخانه jalali-moment به خوبی فرمت ISO 8601 (شامل 'T' و 'Z') را درک می‌کند.
    const timestamp = jalaliMoment(apiLog.timestamp);

    // ۴. [اصلاح] برای اطمینان از تبدیل به منطقه زمانی ایران (اگر سرور UTC می‌دهد)
    // اگر سرور زمان را بر اساس تهران می‌دهد، این خط نیاز نیست.
    // اما اگر سرور Z (UTC) می‌دهد، این خط آن را به تهران تبدیل می‌کند.
    // .locale('fa') // تنظیم محلی‌سازی برای فرمت فارسی
    // .tz('Asia/Tehran'); // (اختیاری: اگر نیاز به تبدیل Timezone دارید)


    return {
        id: apiLog.id.toString(),
        employee: {
            id: apiLog.employee.id,
            name: `${apiLog.employee.first_name} ${apiLog.employee.last_name}`,
            // ❗️ هشدار: این دو فیلد در API (بر اساس داکیومنت) وجود ندارند
            // TODO: از بک‌اند بخواهید employee_code و avatarUrl را اضافه کند
            employeeId: apiLog.employee.employee_code || `ID: ${apiLog.employee.id}`,
            avatarUrl: apiLog.employee.avatarUrl || undefined,
        },
        activityType: mapEventType(apiLog.event_type),

        // ❗️ هشدار: فیلد 'trafficArea' در API نیست. ما از 'source_name' استفاده می‌کنیم
        trafficArea: apiLog.source_name,

        // ۵. [اصلاح] از آبجکت واقعی تاریخ برای فرمت‌دهی استفاده می‌کنیم
        date: timestamp.locale('fa').format('jYYYY/jMM/jDD'), // فرمت تاریخ جلالی
        time: timestamp.locale('en').format('HH:mm'),      // فرمت ساعت (ترجیحا لاتین برای فیلد time)

        // فیلدهای جدید برای منطق UI
        is_allowed: apiLog.is_allowed,
        remarks: apiLog.remarks,
    };
};