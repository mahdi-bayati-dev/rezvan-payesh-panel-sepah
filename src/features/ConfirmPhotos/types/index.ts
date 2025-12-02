// ایمپورت تایپ‌های پایه از ماژول کاربر
// import { type Employee } from "@/features/User/types";

/**
 * وضعیت‌های ممکن برای یک درخواست
 */
export type RequestStatus = "pending" | "approved" | "rejected";

/**
 * اینترفیس اختصاصی برای درخواست تایید تصویر
 */
export interface ImageRequest {
  id: number;
  employee_id: number;
  original_path: string; // مسیر فایل
  status: RequestStatus;
  created_at: string;

  // ریلیشن با کارمند (برای نمایش نام و مشخصات)
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    personnel_code: string;
    // ✅ فیکس: اضافه کردن پوزیشن برای جلوگیری از خطای بیلد
    position?: string | null; 
    // برای نمایش در جدول نیاز به نام سازمان و گروه داریم
    organization?: { id: number; name: string } | null;
    work_group?: { id: number; name: string } | null;
  };
}

/**
 * ساختار پاسخ لیست درخواست‌ها (Pagination)
 */
export interface RequestListResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

/**
 * پارامترهای فیلتر
 */
export interface FetchRequestParams {
  page: number;
  per_page: number;
  status?: RequestStatus; // امکان فیلتر بر اساس وضعیت
}