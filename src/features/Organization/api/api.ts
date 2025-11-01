import axiosInstance from "@/lib/AxiosConfig"; // (مسیر axiosInstance خودتان را بررسی کنید)
import {
  type Organization,
  type OrganizationCollectionResponse,
  type OrganizationResourceResponse,
} from "@/features/Organization/types";
import { type OrganizationFormData } from "@/features/Organization/Schema/organizationFormSchema";

/**
 * 1. دریافت لیست سازمان‌ها (Index)
 * بر اساس نقش، این تابع یا OrganizationCollectionResponse یا OrganizationResourceResponse برمی‌گرداند.
 * این منطق در هوک useOrganizations مدیریت خواهد شد.
 */
export const fetchOrganizations = async (): Promise<
  OrganizationCollectionResponse | OrganizationResourceResponse
> => {
  const { data } = await axiosInstance.get("/organizations");
  console.log("==>", data);

  return data;
};

/**
 * 2. ایجاد سازمان جدید (Store)
 */
export const createOrganization = async (
  payload: OrganizationFormData
): Promise<Organization> => {
  // API یک آبجکت OrganizationResource برمی‌گرداند (شامل { data: ... })
  const { data } = await axiosInstance.post("/organizations", payload);
  return data.data;
};

/**
 * 3. دریافت سازمان تکی (Show)
 */
export const fetchOrganizationById = async (
  id: number
): Promise<Organization> => {
  const { data } = await axiosInstance.get(`/organizations/${id}`);
  return data.data; // API یک OrganizationResource برمی‌گرداند
};

/**
 * 4. به‌روزرسانی سازمان (Update)
 */
export const updateOrganization = async ({
  id,
  payload,
}: {
  id: number;
  // فرم ویرایش هم از همان اسکیما و تایپ ایجاد استفاده می‌کند
  payload: OrganizationFormData;
}): Promise<Organization> => {
  const { data } = await axiosInstance.put(`/organizations/${id}`, payload);
  return data.data; // API یک OrganizationResource برمی‌گرداند
};

/**
 * 5. حذف سازمان (Destroy)
 */
export const deleteOrganization = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/organizations/${id}`);
  // API 204 No Content برمی‌گرداند
};
