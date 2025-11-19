// src/features/dashboard/api/dashboardApi.ts

import axiosInstance from "@/lib/AxiosConfig";
import { DateObject } from "react-multi-date-picker";

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
  children_stats: ChildOrgStat[] | null; // ممکن است نال باشد
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

/**
 * این تایپ می‌تواند یا دیتای ادمین باشد یا دیتای کاربر.
 * ما از وجود فیلد 'summary_stats' برای تشخیص نوع آن استفاده می‌کنیم.
 */
export type DashboardResponse = AdminDashboardData | UserDashboardData;

// ====================================================================
// ۴. Type Guards (توابع محافظ تایپ)
// ====================================================================

/**
 * بررسی می‌کند که آیا دیتا مربوط به پنل مدیریت است؟
 */
export function isAdminDashboard(
  data: DashboardResponse
): data is AdminDashboardData {
  return (data as AdminDashboardData).summary_stats !== undefined;
}

/**
 * بررسی می‌کند که آیا دیتا مربوط به پنل کاربر عادی است؟
 */
export function isUserDashboard(
  data: DashboardResponse
): data is UserDashboardData {
  return (data as UserDashboardData).absences_count !== undefined;
}

// ====================================================================
// ۵. توابع کمکی
// ====================================================================

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

// ====================================================================
// ۶. فراخوانی API
// ====================================================================

const API_ENDPOINT = "/panel"; // طبق مستندات جدید

export async function fetchDashboardData(
  dateObj: DateObject | null,
  timeFilter: string
): Promise<DashboardResponse> {
  let dateParam: string | undefined = undefined;

  if (dateObj) {
    const rawPersianDate = dateObj.format("YYYY-MM-DD");
    dateParam = fixPersianNumbers(rawPersianDate);
  }

  try {
    const response = await axiosInstance.get<DashboardResponse>(API_ENDPOINT, {
      params: {
        date: dateParam,
        // نکته: طبق مستندات، برای User Dashboard شاید فیلتر تاریخ اعمال نشود (همیشه ماه جاری)،
        // اما ارسال آن ضرری ندارد و برای Admin لازم است.
        filter: timeFilter,
      },
    });

    // لاگ برای دیباگ
    console.log("Dashboard API Response:", response.data);

    return response.data;
  } catch (error: any) {
    // هندل کردن خطای خاص ۴۰۴ طبق مستندات (کارمند یافت نشد)
    if (error.response && error.response.status === 404) {
      throw new Error(
        "رکورد کارمند برای این کاربر یافت نشد. لطفاً با پشتیبانی تماس بگیرید."
      );
    }
    throw error;
  }
}
