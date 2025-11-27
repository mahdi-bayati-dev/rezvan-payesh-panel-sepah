/**
 * تبدیل اعداد انگلیسی به فارسی
 * @param num عدد ورودی (رشته یا عدد)
 * @returns رشته با اعداد فارسی
 */
export const toPersianDigits = (num: number | string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};