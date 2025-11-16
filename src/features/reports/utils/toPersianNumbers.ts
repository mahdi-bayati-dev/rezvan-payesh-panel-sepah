/**
 * تابع کمکی برای تبدیل اعداد انگلیسی (لاتین) به فارسی در یک رشته
 * @param str رشته ورودی (شامل اعداد لاتین)
 * @returns رشته با اعداد فارسی
 */
export const toPersianNumbers = (
  str: string | number | null | undefined
): string => {
  if (str === null || str === undefined) return "---";
  let strString = String(str);

  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (let i = 0; i < 10; i++) {
    // استفاده از ریجکس گلوبال (g) برای جایگزینی تمام تکرارها
    strString = strString.replace(new RegExp(englishNumbers[i], "g"), persianNumbers[i]);
  }
  return strString;
};