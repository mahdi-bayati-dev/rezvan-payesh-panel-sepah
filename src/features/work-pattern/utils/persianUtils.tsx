/**
 * تابع تبدیل اعداد انگلیسی به فارسی
 * این تابع به صورت بهینه تمام ارقام موجود در یک رشته یا عدد را به معادل فارسی تبدیل می‌کند.
 * @param value - مقدار ورودی (عدد یا رشته)
 * @returns رشته با اعداد فارسی
 */
export const toPersianDigits = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

/**
 * فرمت کردن زمان به صورت فارسی (مثال: ۰۸:۳۰)
 */
export const formatTimeToPersian = (time: string | null): string => {
  if (!time) return '';
  return toPersianDigits(time);
};