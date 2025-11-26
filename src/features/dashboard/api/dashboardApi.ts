// src/features/dashboard/api/dashboardApi.ts

import axiosInstance from "@/lib/AxiosConfig";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ====================================================================
// ۱. تعریف اینترفیس‌ها (Admin Dashboard)
// ====================================================================

export interface ChildOrgStat {
  org_id: number;
  org_name: string;
  count: number;
}

export interface LiveOrganizationStat {
  parent_org_id: number;
  parent_org_name: string;
  children_stats: ChildOrgStat[] | null;
}

export interface AdminSummaryStats {
  date: string;
  total_lateness: number;
  total_present: number;
  total_on_leave: number;
  total_early_departure: number;
  total_absent: number;
  total_employees_scoped: number;
}

export interface AdminDashboardData {
  summary_stats: AdminSummaryStats;
  live_organization_stats: LiveOrganizationStat[];
}

// ====================================================================
// ۲. تعریف اینترفیس‌ها (User Dashboard)
// ====================================================================

export interface UserDashboardData {
  absences_count: number;
  leaves_approved_count: number;
  early_exits_count: number;
}

// ====================================================================
// ۳. تایپ ترکیبی (Discriminated Union)
// ====================================================================

export type DashboardResponse = AdminDashboardData | UserDashboardData;

// ====================================================================
// ۴. Type Guards
// ====================================================================

export function isAdminDashboard(
  data: DashboardResponse
): data is AdminDashboardData {
  return (data as AdminDashboardData).summary_stats !== undefined;
}

export function isUserDashboard(
  data: DashboardResponse
): data is UserDashboardData {
  return (data as UserDashboardData).absences_count !== undefined;
}

// ====================================================================
// ۵. توابع کمکی (Utility Functions)
// ====================================================================

/**
 * تبدیل اعداد فارسی به انگلیسی برای ارسال به سرور
 */
const fixPersianNumbers = (str: string): string => {
  const persianNumbers = [
    /۰/g,
    /۱/g,
    /۲/g,
    /۳/g,
    /۴/g,
    /۵/g,
    /۶/g,
    /۷/g,
    /۸/g,
    /۹/g,
  ];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], englishNumbers[i]);
  }
  return result;
};

/**
 * تبدیل اعداد انگلیسی به فارسی برای نمایش در UI
 * (این تابع جدید برای استانداردسازی نمایش اعداد اضافه شد)
 */
export const toPersianDigits = (
  num: number | string | undefined | null
): string => {
  if (num === undefined || num === null) return "۰";
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// ====================================================================
// ۶. فراخوانی API
// ====================================================================

const API_ENDPOINT = "/panel";

export async function fetchDashboardData(
  dateObj: DateObject | null,
  timeFilter: string
): Promise<DashboardResponse> {
  // ۱. شروع لاگ‌گیری ورودی‌ها
  console.group("🚀 Dashboard API Fetch");
  console.log("Input Date:", dateObj?.format("YYYY-MM-DD"));
  console.log("Input Filter:", timeFilter);

  const params: Record<string, string> = {};

  // ۲. مدیریت تاریخ
  if (dateObj) {
    const today = new DateObject({ calendar: persian, locale: persian_fa });
    const selectedDateStr = fixPersianNumbers(dateObj.format("YYYY-MM-DD"));
    const todayStr = fixPersianNumbers(today.format("YYYY-MM-DD"));

    if (selectedDateStr !== todayStr) {
      params.date = selectedDateStr;
      console.log("Date param ADDED (Not Today):", selectedDateStr);
    } else {
      console.log("Date param SKIPPED (Is Today)");
    }
  }

  // ۳. مدیریت فیلتر
  if (timeFilter && timeFilter !== "daily") {
    params.filter = timeFilter;
    console.log("Filter param ADDED:", timeFilter);
  } else {
    console.log("Filter param SKIPPED (Is Daily/Default)");
  }

  console.log("Final Params being sent to server:", params);

  try {
    const response = await axiosInstance.get<DashboardResponse>(API_ENDPOINT, {
      params: params,
    });

    console.log("✅ API Success Response:", response.data);
    console.groupEnd();
    return response.data;
  } catch (error: any) {
    console.error("❌ API Error Occurred");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response Body:", error.response.data);
    } else if (error.request) {
      console.log("No response received (Network Error)");
    } else {
      console.log("Request setup error:", error.message);
    }
    console.groupEnd();

    if (error.response && error.response.status === 404) {
      throw new Error(
        "رکورد کارمند برای این کاربر یافت نشد. لطفاً با پشتیبانی تماس بگیرید."
      );
    }
    throw error;
  }
}
