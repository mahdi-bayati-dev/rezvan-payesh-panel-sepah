import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchPendingImages,
  approveImageRequest,
  rejectImageRequest,
} from "@/features/ConfirmPhotos/api/api"; // یا ../apis/api اگر پوشه تغییر نکرده
import { type FetchRequestParams } from "../types";

// کلیدهای کش مخصوص این فیچر
export const requestKeys = {
  all: ["requests"] as const,
  images: (params: FetchRequestParams) =>
    [...requestKeys.all, "images", params] as const,
};

/**
 * هوک دریافت لیست درخواست‌ها
 */
export const useImageRequests = (params: FetchRequestParams) => {
  return useQuery({
    queryKey: requestKeys.images(params),
    queryFn: () => {
      console.log("🪝 [Hook] useImageRequests -> Calling API...");
      return fetchPendingImages(params);
    },
    staleTime: 1000 * 60, // 1 دقیقه
  });
};

/**
 * هوک تایید
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveImageRequest(id),
    onSuccess: () => {
      toast.success("درخواست با موفقیت تایید شد.");
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Approve Error:", error);
      toast.error(error?.response?.data?.message || "خطا در انجام عملیات.");
    },
  });
};

/**
 * هوک رد کردن
 */
export const useRejectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rejectImageRequest(id, reason),
    onSuccess: () => {
      toast.info("درخواست رد شد.");
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
    onError: (error: any) => {
      console.error("Reject Error:", error);
      toast.error(error?.response?.data?.message || "خطا در انجام عملیات.");
    },
  });
};
