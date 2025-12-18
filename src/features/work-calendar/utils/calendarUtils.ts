import moment from "jalali-moment";

const JALALI_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface DayCellData {
  key: string;
  date: string | null;
  gregorianDate: string | null;
  dayOfMonth: number;
  weekDayShort: string | null;
}

interface MonthRowData {
  name: string;
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

export const generateJalaliYearGrid = (jalaliYear: number): MonthRowData[] => {
  const yearGrid: MonthRowData[] = [];
  moment.locale("fa");

  for (let jMonth = 1; jMonth <= 12; jMonth++) {
    const monthName = JALALI_MONTHS[jMonth - 1];
    const daysInMonth = moment.jDaysInMonth(jalaliYear, jMonth - 1);
    const monthDays: DayCellData[] = [];

    for (let jDay = 1; jDay <= daysInMonth; jDay++) {
      const dateStr = `${jalaliYear}/${jMonth}/${jDay}`;
      const m = moment(dateStr, "jYYYY/jM/jD");
      const weekDayIndex = m.jDay();

      monthDays.push({
        key: dateStr,
        date: m.format("jYYYY/jMM/jDD"),
        gregorianDate: m.format("YYYY-MM-DD"),
        dayOfMonth: jDay,
        weekDayShort: JALALI_WEEKDAYS_SHORT[weekDayIndex],
      });
    }

    const paddingCount = 31 - daysInMonth;
    for (let i = 0; i < paddingCount; i++) {
      const dayNum = daysInMonth + i + 1;
      monthDays.push({
        key: `pad-${jMonth}-${dayNum}`,
        date: null,
        gregorianDate: null,
        dayOfMonth: dayNum,
        weekDayShort: null,
      });
    }
    yearGrid.push({ name: monthName, days: monthDays });
  }
  return yearGrid;
};

/**
 * پیدا کردن تمام جمعه‌ها در یک بازه زمانی
 */
export const getFridaysInRange = (
  startDate: moment.Moment,
  daysCount: number
): string[] => {
  const fridays: string[] = [];
  const tempDate = startDate.clone();

  for (let i = 0; i < daysCount; i++) {
    if (tempDate.jDay() === 6) {
      fridays.push(tempDate.format("YYYY-MM-DD"));
    }
    tempDate.add(1, "day");
  }
  return fridays;
};

/**
 * پیدا کردن تمام جمعه‌های ماه جاری جلالی
 */
export const getFridaysOfCurrentJalaliMonth = (): string[] => {
  const startOfMonth = moment().startOf("jMonth");
  const daysInMonth = moment.jDaysInMonth(
    startOfMonth.jYear(),
    startOfMonth.jMonth()
  );
  return getFridaysInRange(startOfMonth, daysInMonth);
};

/**
 * پیدا کردن تمام جمعه‌های یک سال کامل جلالی
 * @param year سال جلالی مورد نظر
 */
export const getFridaysOfJalaliYear = (year: number): string[] => {
  // شروع از اول فروردین سال مورد نظر
  const startOfYear = moment(`${year}/01/01`, "jYYYY/jMM/jDD");
  // محاسبه تعداد روزهای سال (کبیسه یا عادی)
  const daysInYear = startOfYear.clone().endOf("jYear").jDayOfYear();
  return getFridaysInRange(startOfYear, daysInYear);
};
