import axiosInstance from "../../../lib/AxiosConfig";
import {
  type UserListResponse,
  type FetchUsersParams,
  type User,
} from "@/features/User/types/index";
import type {
  UserProfileFormData,
  CreateUserFormData,
} from "@/features/User/Schema/userProfileFormSchema";
import { AppConfig } from "@/config";
/**
 * دریافت لیست کاربران
 */
export const fetchUsers = async (
  params: FetchUsersParams
): Promise<UserListResponse> => {
  console.log("🔍 [API] Fetching Users with Params:", params);

  const queryParams = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.organization_id)
    queryParams.append("organization_id", String(params.organization_id));

  if (params.search) queryParams.append("search", params.search);
  if (params.organization_id)
    queryParams.append("organization_id", String(params.organization_id));
  if (params.role) queryParams.append("role", params.role);
  if (params.week_pattern_id)
    queryParams.append("week_pattern_id", String(params.week_pattern_id));
  if (params.shift_schedule_id)
    queryParams.append("shift_schedule_id", String(params.shift_schedule_id));

  if (params.is_not_assigned_to_group) {
    queryParams.append("work_group_id", "null");
  } else if (params.work_group_id) {
    queryParams.append("work_group_id", String(params.work_group_id));
  }

  try {
    const { data } = await axiosInstance.get(
      `/users?${queryParams.toString()}`
    );
    console.log(data);

    return data;
  } catch (error) {
    console.error("❌ [API] Error Fetching Users:", error);
    throw error;
  }
};

export const updateUserOrganization = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}): Promise<User> => {
  const payload = { employee: { organization_id: organizationId } };
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);
  return data;
};

export const updateUserShiftScheduleAssignment = async ({
  userId,
  shiftScheduleId,
}: {
  userId: number;
  shiftScheduleId: number | null;
}): Promise<User> => {
  const payload: UserProfileFormData = {
    employee: { shift_schedule_id: shiftScheduleId } as any,
  };
  return updateUserProfile({ userId, payload });
};

export const fetchUserById = async (userId: number): Promise<User> => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  console.log(data.data);

  return data.data;
};

/**
 * آپدیت پروفایل کاربر (با پشتیبانی از آپدیت فایل)
 * برای ویرایش هم از منطق مشابه استفاده می‌کنیم
 */
export const updateUserProfile = async ({
  userId,
  payload,
}: {
  userId: number;
  payload: UserProfileFormData;
}): Promise<User> => {
  // بررسی وجود فایل برای تصمیم‌گیری بین JSON و FormData
  const hasFiles =
    (payload as any).employee?.images &&
    (payload as any).employee.images.length > 0;
  const hasDeletedFiles =
    (payload as any).employee?.delete_images &&
    (payload as any).employee.delete_images.length > 0;

  // اگر فایل نداشتیم و حذفی هم نداشتیم، ارسال معمولی JSON (متد PUT)
  if (!hasFiles && !hasDeletedFiles) {
    const { data } = await axiosInstance.put(`/users/${userId}`, payload);
    return data.data; // معمولا data.data برمی‌گردد
  }

  // اگر فایل داشتیم یا حذف عکس داشتیم -> FormData
  console.group(`🚀 [API Request] Update User (Multipart) - ID: ${userId}`);
  const formData = new FormData();
  formData.append("_method", "PUT"); // لاراول برای دریافت فایل در متد PUT نیاز به این دارد (POST واقعی ارسال می‌شود)

  // تابع کمکی بازگشتی برای پر کردن FormData
  const appendToFormData = (data: any, rootKey?: string) => {
    if (data === null || data === undefined) return;

    if (data instanceof File) {
      if (rootKey) formData.append(rootKey, data);
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        // تصاویر جدید
        if (item instanceof File && rootKey?.includes("images")) {
          formData.append(`${rootKey}[${index}]`, item);
        }
        // ID های حذف شده
        else if (rootKey?.includes("delete_images")) {
          formData.append(`${rootKey}[${index}]`, String(item));
        } else {
          appendToFormData(item, `${rootKey}[${index}]`);
        }
      });
      return;
    }

    if (typeof data === "object") {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        const formKey = rootKey ? `${rootKey}[${key}]` : key;
        // جلوگیری از ارسال تکراری تصاویر که در حلقه بالا هندل می‌شوند
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file, idx) => {
            formData.append(`${formKey}[${idx}]`, file);
          });
        } else {
          appendToFormData(value, formKey);
        }
      });
      return;
    }

    // مقادیر اولیه (String, Number, Boolean)
    if (typeof data === "boolean") {
      if (rootKey) formData.append(rootKey, data ? "1" : "0");
    } else {
      if (rootKey) formData.append(rootKey, String(data));
    }
  };

  appendToFormData(payload);

  try {
    const { data } = await axiosInstance.post(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ [API Success] User Updated:", data);
    console.groupEnd();
    return data.data;
  } catch (error) {
    console.error("🔥 [API Error] Update Failed:", error);
    console.groupEnd();
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

/**
 * ✅ ایجاد کاربر جدید (دقیقاً طبق داکیومنت PDF + پچ امنیتی برای خطای 500)
 */
export const createUser = async (
  payload: CreateUserFormData
): Promise<User> => {
  console.group("🚀 [API Request] Create User (Standard FormData)");

  const formData = new FormData();

  // 1. افزودن فیلدهای سطح کاربر (User Fields)
  formData.append("user_name", payload.user_name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  formData.append("status", payload.status);

  // 2. افزودن فیلدهای سطح کارمند (Employee Fields)
  if (payload.employee) {
    // 🔥 پچ امنیتی (Critical Fix):
    // خطای 500 نشان داد بکند به دنبال 'personnel_code' در ریشه می‌گردد.
    // ما آن را هم در ریشه و هم در employee ارسال می‌کنیم تا خطا رفع شود.
    if (payload.employee.personnel_code) {
      formData.append("personnel_code", payload.employee.personnel_code);
    }

    Object.entries(payload.employee).forEach(([key, value]) => {
      // تصاویر جداگانه پردازش می‌شوند
      if (key === "images") return;

      if (value !== null && value !== undefined && value !== "") {
        if (typeof value === "boolean") {
          formData.append(`employee[${key}]`, value ? "1" : "0");
        } else {
          formData.append(`employee[${key}]`, String(value));
        }
      }
    });

    // 3. افزودن فایل‌های تصاویر (Images)
    if (payload.employee.images && payload.employee.images.length > 0) {
      payload.employee.images.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`employee[images][${index}]`, file);
        }
      });
    }
  }

  try {
    const { data } = await axiosInstance.post("/users", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ [API Success] User Created:", data);
    console.groupEnd();
    return data.data;
  } catch (error: any) {
    console.group("🔥 [API Error] Create User Failed");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message);

    // لاگ کردن خطاهای اعتبارسنجی اگر وجود داشته باشد
    if (error.response?.data?.errors) {
      console.table(error.response.data.errors);
    }

    console.groupEnd();
    throw error;
  }
};

// --- بخش مربوط به ایمپورت اکسل ---

/**
 * اینترفیس ورودی برای ایمپورت
 */
export interface ImportUserPayload {
  file: File;
  organization_id: number;
  default_password: boolean; // طبق داکیومنت: 1 یا 0
  work_group_id?: number | null;
  shift_schedule_id?: number | null;
}

/**
 * فراخوانی API ایمپورت کاربران
 * متد: POST /api/users/import
 * نوع محتوا: multipart/form-data
 */
export const importUsers = async (
  payload: ImportUserPayload
): Promise<{ message: string }> => {
  // 1. دیباگ: بررسی مشخصات فایل
  console.group("🚀 [API Debug] Import Payload");
  console.log("Original File Name:", payload.file?.name);
  console.log("Original File Type:", payload.file?.type);

  const formData = new FormData();

  // ✅ Fix نهایی: اجبار کردن MIME Type استاندارد بر اساس پسوند فایل
  // این کار باعث می‌شود اگر مرورگر تایپ را تشخیص نداد، ما دستی آن را ست کنیم تا لاراول قبول کند.
  let fileToUpload = payload.file;
  const fileName = payload.file.name.toLowerCase();

  const mimeTypes: Record<string, string> = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
  };

  const extension = fileName.split(".").pop();

  // اگر پسوند معتبر بود، یک فایل جدید با MIME Type استاندارد می‌سازیم
  if (extension && mimeTypes[extension]) {
    const correctMime = mimeTypes[extension];
    // اگر تایپ فعلی فایل با تایپ استاندارد فرق داشت یا خالی بود
    if (fileToUpload.type !== correctMime) {
      console.log(
        `🔧 [Fix] Replacing MIME type '${fileToUpload.type}' with '${correctMime}'`
      );
      const blob = fileToUpload.slice(0, fileToUpload.size, correctMime);
      fileToUpload = new File([blob], payload.file.name, { type: correctMime });
    }
  }

  formData.append("file", fileToUpload);
  formData.append("organization_id", String(payload.organization_id));
  formData.append("default_password", payload.default_password ? "1" : "0");

  if (payload.work_group_id) {
    formData.append("work_group_id", String(payload.work_group_id));
  }
  if (payload.shift_schedule_id) {
    formData.append("shift_schedule_id", String(payload.shift_schedule_id));
  }

  try {
    const { data } = await axiosInstance.post("/users/import", formData, {
      timeout: 60000,
      headers: {
        "Content-Type": undefined,
      },
    });
    console.log("✅ [API Success] Import Started");
    console.groupEnd();
    return data;
  } catch (error: any) {
    if (error.response?.status === 422) {
      console.group("❌ [Import API] Validation Errors:");
      console.log("Status: 422 Unprocessable Content");
      if (error.response.data?.errors) {
        console.table(error.response.data.errors);
      } else {
        console.log("Error Body:", error.response.data);
      }
      console.groupEnd();
    } else {
      console.error("❌ [Import API] Failed:", error);
    }
    throw error;
  }
};

/**
 * دانلود فایل نمونه اکسل
 * این تابع یک فایل استاتیک را دانلود می‌کند یا از API می‌گیرد
 */
export const downloadSampleExcel = () => {
  // اگر فایل در پوشه public پروژه است:
  const link = document.createElement("a");
  link.href = `${AppConfig.STORAGE_URL}/user_import_sample.xlsx`; // مسیر فرضی در public
  link.download = "users-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

};
