/**
 * آدرس پایه برای دریافت فایل‌های آپلود شده.
 * مثال: http://payesh.eitebar.ir/storage
 * * ✅ بهترین روش: استفاده مستقیم از متغیر محیطی اختصاصی برای Storage Base URL
 */

// ✅ خواندن مستقیم از متغیر محیطی جدید
const STORAGE_BASE_URL_RAW = import.meta.env.VITE_STORAGE_BASE_URL || "http://payesh.eitebar.ir/storage"; 

// اطمینان از حذف / اضافی در انتهای آدرس پایه
export const STORAGE_BASE_URL = STORAGE_BASE_URL_RAW.endsWith('/')
    ? STORAGE_BASE_URL_RAW.slice(0, -1) 
    : STORAGE_BASE_URL_RAW;


/**
 * تابع کمکی برای ساخت آدرس کامل تصویر
 * @param path مسیر ذخیره شده در دیتابیس (مثلاً uploads/employees/photo.jpg)
 * @returns آدرس کامل قابل نمایش یا undefined
 */
export const getFullImageUrl = (path?: string | null): string | undefined => {
    // ۱. اگر path خالی بود، undefined برگردان تا DetailAvatar فال‌بک را نمایش دهد
    if (!path) return undefined;

    // ۲. اگر مسیر خودش کامل بود (شاید CDN باشد)، همان را برگردان
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // ۳. تمیزکاری مسیر
    // حذف اسلش اضافی اول مسیر اگر وجود داشته باشد
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // ۴. ساخت URL کامل
    // مثال: http://payesh.eitebar.ir/storage/uploads/employees/photo.jpg
    return `${STORAGE_BASE_URL}/${cleanPath}`;
};