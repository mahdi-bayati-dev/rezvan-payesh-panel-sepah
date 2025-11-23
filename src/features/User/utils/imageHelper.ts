/**
 * آدرس پایه برای دریافت فایل‌های آپلود شده.
 * مثال: http://localhost:8000/storage
 * * ✅ توجه: اگر پروژه شما در محیط Production اجرا می‌شود، باید این مقدار
 * با دامنه‌ی واقعی بکند جایگزین شود (مثلاً https://api.yourdomain.com/storage)
 */
// ما از یک متغیر سراسری یا هاردکد برای جلوگیری از خطای "process is not defined" در مرورگر استفاده می‌کنیم.
// لطفاً این آدرس را با آدرس واقعی بکند خود (لاراول) جایگزین کنید.
const API_BASE_URL = "http://localhost:8000"; // آدرس پایه API شما
const DEFAULT_STORAGE_PATH = "/storage"; // پیشوند لازم برای دسترسی به فایل‌های لاراول

export const STORAGE_BASE_URL = API_BASE_URL + DEFAULT_STORAGE_PATH; 


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
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // ۴. ساخت URL کامل
    // *نکته مهم: برای لاراول، اگر storage:link زده باشید، مسیر نهایی شما شبیه این خواهد بود:*
    // *http://localhost:8000/storage/uploads/employees/photo.jpg*
    return `${STORAGE_BASE_URL}/${cleanPath}`;
};