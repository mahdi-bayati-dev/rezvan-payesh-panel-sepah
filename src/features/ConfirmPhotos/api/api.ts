import axiosInstance from "@/lib/AxiosConfig";
import {
  type RequestListResponse,
  type ImageRequest,
  type FetchRequestParams,
} from "../types";

/**
 * دریافت لیست تصاویر در انتظار تایید
 * Endpoint: /api/admin/pending-images
 */
export const fetchPendingImages = async (
  params: FetchRequestParams
): Promise<RequestListResponse<ImageRequest>> => {
  // 🔍 LOG: شروع درخواست
  console.group("🚀 [API Request] fetchPendingImages");
  console.log("📦 Params:", params);

  const queryParams = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.status) {
    queryParams.append("status", params.status);
  }

  const url = `/admin/pending-images?${queryParams.toString()}`;
  console.log("🔗 Full URL:", url);

  try {
    const { data } = await axiosInstance.get(url);

    // 🔍 LOG: بررسی دیتای خام دریافتی
    console.log("✅ [API Response 200] Raw Data:", data);

    if (Array.isArray(data.data)) {
      console.log(`📊 Records Found: ${data.data.length}`);
    } else {
      console.warn("⚠️ Warning: 'data.data' is missing or not an array!", data);
    }
    console.groupEnd();

    return data;
  } catch (error) {
    console.error("❌ [API Error]:", error);
    console.groupEnd();
    throw error;
  }
};

/**
 * تایید نهایی تصویر
 */
export const approveImageRequest = async (id: number): Promise<void> => {
  console.log(`🔵 [API] Approving Image ID: ${id}`);
  await axiosInstance.post(`/admin/pending-images/${id}/approve`);
};

/**
 * رد کردن تصویر
 */
export const rejectImageRequest = async (
  id: number,
  reason: string
): Promise<void> => {
  console.log(`🔴 [API] Rejecting Image ID: ${id}, Reason: ${reason}`);
  await axiosInstance.post(`/admin/pending-images/${id}/reject`, { reason });
};
