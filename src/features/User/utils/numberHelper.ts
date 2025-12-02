/**
 * تابع کمکی ماژولار برای تبدیل اعداد انگلیسی (0-9) به فارسی (۰-۹).
 * این تابع فقط اعداد درون یک رشته را تبدیل می‌کند و به کاراکترهای دیگر دست نمی‌زند.
 *
 * @param input ورودی می‌تواند رشته یا عدد باشد.
 * @returns رشته‌ای که اعداد درون آن به فارسی تبدیل شده‌اند.
 */
export const toPersianNumber = (
  input: string | number | null | undefined
): string => {
  if (input === null || input === undefined) {
    return "---";
  }

  // تبدیل ورودی به رشته
  const str = String(input);

  // نگاشت اعداد لاتین به فارسی
  const persianMap: { [key: string]: string } = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  // استفاده از تابع replace با یک عبارت منظم (Regex) برای جایگزینی همه اعداد
  return str.replace(/[0-9]/g, (match) => persianMap[match]);
};
