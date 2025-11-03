// برای این فایل، باید `jalali-moment` را نصب کنید
// npm install jalali-moment
import moment from "jalali-moment";

// ساختار خروجی برای رندر گرید
interface DayCellData {
  key: string;
  date: string | null; // "jYYYY/jMM/jDD" (تاریخ جلالی)
  gregorianDate: string | null; // "YYYY-MM-DD" (برای ارسال به API)
  dayOfMonth: number; // 1-31
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

      monthDays.push({
        key: dateStr,
        date: m.format("jYYYY/jMM/jDD"),
        gregorianDate: m.format("YYYY-MM-DD"), // تاریخ میلادی برای API
        dayOfMonth: jDay,
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
      });
    }

    yearGrid.push({ name: monthName, days: monthDays });
  }

  return yearGrid;
};

