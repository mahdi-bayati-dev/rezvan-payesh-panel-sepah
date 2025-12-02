/**
 * تابع کمکی برای تبدیل تاریخ میلادی به شمسی
 * این تابع از Intl مرورگر استفاده می‌کند و نیاز به کتابخانه اضافی ندارد.
 */

import { toPersianNumber } from "./numberHelper"; // ✅ ایمپورت تابع تبدیل اعداد

type DateFormat = "short" | "long" | "year-only" | "with-time";

export const formatDateToPersian = (
  dateString: string | null | undefined,
  format: DateFormat = "short"
): string => {
  if (!dateString) return "---";

  try {
    const date = new Date(dateString);

    // بررسی معتبر بودن تاریخ
    if (isNaN(date.getTime())) return "---";

    const options: Intl.DateTimeFormatOptions = {
      calendar: "persian",
      numberingSystem: "latn", // ❌ نکته فنی: اگر این را حذف کنیم یا به 'arab' تغییر دهیم،
      // در کروم و فایرفاکس اعداد به طور خودکار فارسی می‌شوند.
      // اما برای اطمینان و یکپارچگی، از تابع toPersianNumber استفاده می‌کنیم.
    };

    switch (format) {
      case "year-only":
        options.year = "numeric";
        break;
      case "long":
        options.year = "numeric";
        options.month = "long";
        options.day = "numeric";
        break;
      case "with-time":
        options.year = "numeric";
        options.month = "2-digit";
        options.day = "2-digit";
        options.hour = "2-digit";
        options.minute = "2-digit";
        break;
      case "short":
      default:
        options.year = "numeric";
        options.month = "2-digit";
        options.day = "2-digit";
        break;
    }

    const formattedDate = date.toLocaleDateString("fa-IR", options);

    // ✅ تبدیل اعداد خروجی به فارسی با ماژول جدید
    return toPersianNumber(formattedDate);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "---";
  }
};
