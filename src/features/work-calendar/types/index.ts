/**
 * تایپ جنریک برای پاسخ‌های Paginated از API شما
 * (بر اساس لاگ کنسول)
 */
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}


export const HolidayType = {
  OFFICIAL: "official",
  AGREEMENT: "agreement",
  UNKNOWN: "unknown",
} as const;

export type HolidayType = (typeof HolidayType)[keyof typeof HolidayType];

/**
 * تایپ ابزار فعال (برای سایدبار)
 */
export type ActiveTool = HolidayType | "remove";

/**
 * دیتایی که از GET /holidays دریافت می‌شود
 * (بر اساس لاگ کنسول و تحلیل is_official)
 */
export interface Holiday {
  id: number;
  date: string; // "1403-01-01" (فرمت جلالی از API)
  name: string; // "تعطیلی رسمی"
  is_official: boolean; // منبع حقیقت برای 'type'
  type?: HolidayType; // این فیلد را ما در فرانت‌اند (در هوک) اضافه می‌کنیم
}

/**
 * دیتایی که برای POST /holidays ارسال می‌شود (Data Transfer Object)
 */
export interface CreateHolidayDTO {
  date: string; // "YYYY-MM-DD" (میلادی، بر اساس مستندات اولیه)
  name: string; // "تعطیHی رسمی"
  is_official: boolean; // فیلد بولی (boolean)
}

/**
 * آبجکت نهایی ما در UI
 * Key: "YYYY-MM-DD" (کلید میلادی)
 * Value: Holiday (که حالا فیلد 'type' هم دارد)
 */
export type HolidayMap = Record<string, Holiday>;
