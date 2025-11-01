// (لطفاً مسیر axiosInstance را بر اساس پروژه خودتان تنظیم کنید)
import axiosInstance from "@/lib/AxiosConfig";
import {
  type UserListResponse,
  type FetchUsersParams,
  type User,
} from "@/features/User/types";

/**
 * دریافت لیست کاربران (فیلتر شده و صفحه‌بندی شده)
 * GET /api/users
 */
export const fetchUsers = async (
  params: FetchUsersParams
): Promise<UserListResponse> => {
  // ساخت آبجکت پارامترهای کوئری
  // اطمینان حاصل می‌کنیم که فقط پارامترهای تعریف شده ارسال شوند
  const queryParams = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.organization_id) {
    queryParams.append("organization_id", String(params.organization_id));
  }
  if (params.role) {
    queryParams.append("role", params.role);
  }

  // ارسال درخواست
  // API پاسخ را با ساختار { data: [], links: {}, meta: {} } برمی‌گرداند
  const { data } = await axiosInstance.get(`/users?${queryParams.toString()}`);
  console.log(data);

  return data;
};

/**
 * به‌روزرسانی سازمان یک کاربر (فقط Super Admin)
 * PUT /api/users/{userId}
 * @param userId شناسه کاربری که باید آپدیت شود
 * @param organizationId شناسه سازمان جدید
 */
export const updateUserOrganization = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}): Promise<User> => {
  const payload = {
    employee: {
      organization_id: organizationId,
    },
  };

  // API یک UserResource کامل برمی‌گرداند
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);
  // بر اساس مستندات API، پاسخ در data.data نیست، بلکه خود UserResource است
  // (لطفاً این بخش را چک کنید، اگر پاسخ شما { data: UserResource } بود، data.data را برگردانید)
  return data;
};
