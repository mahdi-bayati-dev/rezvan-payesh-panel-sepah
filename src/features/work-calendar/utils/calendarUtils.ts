// برای این فایل، باید `jalali-moment` را نصب کنید
// npm install jalali-moment
import moment from "jalali-moment";

// +++ اضافه کردن آرایه‌ی حروف روزهای هفته +++
const JALALI_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// ساختار خروجی برای رندر گرید
interface DayCellData {
  key: string;
  date: string | null; // "jYYYY/jMM/jDD" (تاریخ جلالی)
  gregorianDate: string | null; // "YYYY-MM-DD" (برای ارسال به API)
  dayOfMonth: number; // 1-31
  weekDayShort: string | null; // +++ پراپرتی جدید برای "ش", "ی", "د" و ... +++
}

interface MonthRowData {
  name: string; // نام ماه (فروردین)
  days: DayCellData[];
}

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/**
 * تابعی برای تولید ساختار گرید سالانه بر اساس تقویم جلالی
 * این تابع دقیقاً 31 سلول برای هر ماه ایجاد می‌کند (مطابق UI فیگما)
 */
export const generateJalaliYearGrid = (jalaliYear: number): MonthRowData[] => {
  const yearGrid: MonthRowData[] = [];

  // اطمینان از اینکه ورودی به صورت محلی فارسی (fa) و جلالی (j) است
  moment.locale("fa");

  for (let jMonth = 1; jMonth <= 12; jMonth++) {
    const monthName = JALALI_MONTHS[jMonth - 1];
    const daysInMonth = moment.jDaysInMonth(jalaliYear, jMonth - 1);
    const monthDays: DayCellData[] = [];

    // ۱. اضافه کردن روزهای واقعی ماه
    for (let jDay = 1; jDay <= daysInMonth; jDay++) {
      const dateStr = `${jalaliYear}/${jMonth}/${jDay}`;
      const m = moment(dateStr, "jYYYY/jM/jD");

      // +++ محاسبه روز هفته +++
      const weekDayIndex = m.jDay(); // 0 = شنبه, 6 = جمعه
      const weekDayShort = JALALI_WEEKDAYS_SHORT[weekDayIndex];

      monthDays.push({
        key: dateStr,
        date: m.format("jYYYY/jMM/jDD"),
        gregorianDate: m.format("YYYY-MM-DD"), // تاریخ میلادی برای API
        dayOfMonth: jDay,
        weekDayShort: weekDayShort, // +++ پاس دادن حرف روز هفته +++
      });
    }

    // ۲. اضافه کردن سلول‌های خالی (padding) تا انتهای گرید 31 روزه
    // (بر اساس UI فیگما که هر ماه 31 ستون دارد)
    const paddingCount = 31 - daysInMonth;
    for (let i = 0; i < paddingCount; i++) {
      const dayNum = daysInMonth + i + 1;
      monthDays.push({
        key: `pad-${jMonth}-${dayNum}`,
        date: null, // شناسه سلول خالی
        gregorianDate: null, // شناسه سلول خالی
        dayOfMonth: dayNum,
        weekDayShort: null, // +++ سلول خالی حرف ندارد +++
      });
    }

    yearGrid.push({ name: monthName, days: monthDays });
  }

  return yearGrid;
};
