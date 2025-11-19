// src/features/dashboard/api/dashboardApi.ts

import axiosInstance from "@/lib/AxiosConfig";
// [نکته مهم]: DateObject باید به عنوان مقدار (Value) ایمپورت شود نه Type
import { DateObject } from "react-multi-date-picker"; 

// ====================================================================
// ۱. تعریف اینترفیس‌ها (طبق مستندات دقیق بک‌اند)
// ====================================================================

export interface ChildOrgStat {
  org_id: number;
  org_name: string;
  count: number;
}

export interface LiveOrganizationStat {
  parent_org_id: number;
  parent_org_name: string;
  children_stats: ChildOrgStat[];
}

export interface SummaryStats {
  date: string;
  total_lateness: number;
  total_present: number;
  total_on_leave: number;
  total_early_departure: number;
  total_absent: number;
  total_employees_scoped: number;
}

export interface DashboardData {
  summary_stats: SummaryStats;
  live_organization_stats: LiveOrganizationStat[];
}

// ====================================================================
// ۲. توابع کمکی (اصلاح فرمت تاریخ برای لاراول)
// ====================================================================

/**
 * تبدیل اعداد فارسی به انگلیسی
 * ورودی: "۱۴۰۳-۰۸-۲۹"
 * خروجی: "1403-08-29"
 * دلیل: دیتابیس و لاراول با اعداد فارسی در کوئری‌ها مشکل دارند.
 */
const fixPersianNumbers = (str: string): string => {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], englishNumbers[i]);
  }
  return result;
};

// ====================================================================
// ۳. متد فراخوانی API
// ====================================================================

const API_ENDPOINT = "/admin-panel";

export async function fetchDashboardData(
    dateObj: DateObject | null,
    timeFilter: string
): Promise<DashboardData> {
  
  let dateParam: string | undefined = undefined;
  
  if (dateObj) {
    // [راه حل نهایی ارور ۵۰۰]:
    // 1. استفاده از جداکننده خط تیره (-) به جای اسلش (/)
    //    چون explode لاراول روی (-) تنظیم شده است.
    const rawPersianDate = dateObj.format("YYYY-MM-DD");
    
    // 2. تبدیل اعداد به انگلیسی
    // خروجی نهایی: "1403-08-29"
    dateParam = fixPersianNumbers(rawPersianDate);
  }

  try {
    // لاگ جهت اطمینان (باید مثلاً "1403-08-29" باشد)
    // console.log("Sending Date to API:", dateParam); 

    const response = await axiosInstance.get<DashboardData>(API_ENDPOINT, {
        params: {
            date: dateParam,
            filter: timeFilter,
        }
    });

    const data = response.data;
    
    // اعتبارسنجی پاسخ: جلوگیری از undefined بودن آرایه‌ها
    if (!data.summary_stats || !Array.isArray(data.live_organization_stats)) {
        throw new Error("فرمت پاسخ API با مستندات مطابقت ندارد.");
    }

    return data;
  } catch (error) {
    console.error("Dashboard API Error:", error);
    throw error;
  }
}