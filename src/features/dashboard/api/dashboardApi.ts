// api/dashboardApi.ts

import axiosInstance from "@/lib/AxiosConfig"; // <-- استفاده از Axios Instance
import type { DateObject } from "react-multi-date-picker";

// ====================================================================
// ۱. تعریف انواع داده‌ها (TypeScript Interfaces)
// ====================================================================

/** ساختار آمار تفکیکی یک سازمان فرزند */
export interface ChildOrgStat {
  org_id: number;
  org_name: string; // نام سازمان فرزند (مثلاً معاونت مالی)
  count: number;    // تعداد کارمندان حاضر در این سازمان و زیرمجموعه‌هایش
}

/** ساختار آمار تفکیکی سازمان مادر */
export interface LiveOrganizationStat {
  parent_org_id: number;
  parent_org_name: string; // نام سازمان مادر (مثلاً شرکت مادر اول)
  children_stats: ChildOrgStat[];
}

/** ساختار آمار کلی داشبورد */
export interface SummaryStats {
  date: string;                   // تاریخ امروز (2025-11-14)
  total_lateness: number;         // تعداد تاخیرها
  total_present: number;          // تعداد حاضرین
  total_on_leave: number;         // تعداد مرخصی‌ها
  total_early_departure: number;  // تعداد خروج زودهنگام
  total_absent: number;           // تعداد غایبین (محاسبه شده)
  total_employees_scoped: number; // تعداد کل کارمندان تحت پوشش ادمین
}

/** ساختار کامل پاسخ API */
export interface DashboardData {
  summary_stats: SummaryStats;
  live_organization_stats: LiveOrganizationStat[];
}

// ====================================================================
// ۲. تابع فراخوانی API با استفاده از Axios
// ====================================================================

const API_ENDPOINT = "/admin-panel"; // مسیر کامل endpoint

/**
 * دریافت آمار داشبورد لحظه‌ای ادمین
 * * [نکته مهندسی]: این تابع به صورت خام برای استفاده در React Query نوشته شده است.
 * @param dateObj - تاریخ انتخابی (اگر فیلتر روزانه فعال باشد)
 * @param timeFilter - فیلتر زمانی (daily, weekly, monthly)
 * @returns Promise<DashboardData>
 */
export async function fetchDashboardData(
    dateObj: DateObject | null,
    timeFilter: string
): Promise<DashboardData> {
  
  // [آماده‌سازی پارامتر تاریخ]: در صورت نیاز API به فیلتر تاریخ
  // در حال حاضر API فقط آمار "امروز" را می‌دهد، اما این ساختار برای آینده آماده است.
  const dateParam = dateObj ? dateObj.format("YYYY-MM-DD") : undefined;

  // [استفاده از Axios]: AxiosInstance شما به طور خودکار توکن را اضافه می‌کند.
  try {
    const response = await axiosInstance.get<DashboardData>(API_ENDPOINT, {
        params: {
            date: dateParam,
            filter: timeFilter, // اگر در آینده فیلترهای هفتگی/ماهانه پیاده‌سازی شد
        }
    });

    const data = response.data;
    
    // [اعتبارسنجی پایه]: اطمینان از وجود ساختارهای کلیدی
    if (!data.summary_stats || !data.live_organization_stats) {
        throw new Error("ساختار پاسخ API نامعتبر است.");
    }

    return data;
  } catch (error) {
    // خطا به React Query پرتاب می‌شود تا مدیریت شود
    console.error("Dashboard API Error:", error);
    throw error;
  }
}