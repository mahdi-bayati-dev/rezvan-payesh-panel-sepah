import axiosInstance from "@/lib/AxiosConfig";
import {
  type Organization,
  type ApiResponse,
} from "@/features/Organization/types";
import { type OrganizationFormData } from "@/features/Organization/Schema/organizationFormSchema";

/**
 * 1. دریافت لیست سازمان‌ها (Index)
 * خروجی نهایی این تابع باید دیتای خام باشد (یا آرایه یا آبجکت تکی)
 * نرمال‌سازی نهایی در هوک انجام می‌شود.
 */
export const fetchOrganizations = async (): Promise<
  Organization[] | Organization
> => {
  // طبق مستندات:
  // Super Admin -> { data: [...] }
  // L2/L3 Admin -> { data: { ... } }
  const response = await axiosInstance.get<
    ApiResponse<Organization[] | Organization>
  >("/organizations");
  return response.data.data;
};

/**
 * 2. ایجاد سازمان جدید (Store)
 */
export const createOrganization = async (
  payload: OrganizationFormData
): Promise<Organization> => {
  const { data } = await axiosInstance.post<ApiResponse<Organization>>(
    "/organizations",
    payload
  );
  return data.data;
};

/**
 * 3. دریافت سازمان تکی (Show)
 */
export const fetchOrganizationById = async (
  id: number
): Promise<Organization> => {
  const { data } = await axiosInstance.get<ApiResponse<Organization>>(
    `/organizations/${id}`
  );
  return data.data;
};

/**
 * 4. به‌روزرسانی سازمان (Update)
 */
export const updateOrganization = async ({
  id,
  payload,
}: {
  id: number;
  payload: OrganizationFormData;
}): Promise<Organization> => {
  const { data } = await axiosInstance.put<ApiResponse<Organization>>(
    `/organizations/${id}`,
    payload
  );
  return data.data;
};

/**
 * 5. حذف سازمان (Destroy)
 */
export const deleteOrganization = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/organizations/${id}`);
};
