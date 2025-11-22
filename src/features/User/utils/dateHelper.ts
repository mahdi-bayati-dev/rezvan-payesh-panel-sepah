/**
 * تابع کمکی برای تبدیل تاریخ میلادی به شمسی
 * این تابع از Intl مرورگر استفاده می‌کند و نیاز به کتابخانه اضافی ندارد.
 */

type DateFormat = 'short' | 'long' | 'year-only' | 'with-time';

export const formatDateToPersian = (
    dateString: string | null | undefined,
    format: DateFormat = 'short'
): string => {
    if (!dateString) return '---';

    try {
        const date = new Date(dateString);
        
        // بررسی معتبر بودن تاریخ
        if (isNaN(date.getTime())) return '---';

        const options: Intl.DateTimeFormatOptions = {
            calendar: 'persian',
            numberingSystem: 'latn', // استفاده از اعداد لاتین (123) برای خوانایی بیشتر در پنل‌های ادمین
        };

        switch (format) {
            case 'year-only':
                options.year = 'numeric';
                break;
            case 'long':
                options.year = 'numeric';
                options.month = 'long';
                options.day = 'numeric';
                break;
            case 'with-time':
                options.year = 'numeric';
                options.month = '2-digit';
                options.day = '2-digit';
                options.hour = '2-digit';
                options.minute = '2-digit';
                break;
            case 'short':
            default:
                options.year = 'numeric';
                options.month = '2-digit';
                options.day = '2-digit';
                break;
        }

        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return '---';
    }
};