// features/requests/hook/useLeaveRequests.ts
/**
 * این فایل هوک‌های react-query را برای مدیریت
 * server state مربوط به درخواست‌های مرخصی فراهم می‌کند.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  processLeaveRequest,
  type GetLeaveRequestsParams,
} from "../api/api-requests";
import {
  type LeaveRequest,
  type ApiResponse,
  type ApiPaginatedResponse,
  type CreateLeaveRequestPayload,
  type UpdateLeaveRequestPayload,
  type ProcessLeaveRequestPayload,
  type User,
} from "../types";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";

import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

export const LEAVE_REQUESTS_QUERY_KEY = "leaveRequests";

// ✅ [جدید] اینترفیس استاندارد برای خطاهای اعتبارسنجی API (مثل لاراول)
interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

export const useLeaveRequests = (params: GetLeaveRequestsParams) => {
  const currentUser = useAppSelector(selectUser) as User | null;

  const finalParams = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const isSuperAdmin = currentUser.roles.includes("super_admin");
    const isManager =
      isSuperAdmin ||
      currentUser.roles.includes("org-admin-l2") ||
      currentUser.roles.includes("org-admin-l3");

    if (isManager) {
      return params;
    }

    return {
      ...params,
      employee_id: undefined,
      organization_id: undefined,
    };
  }, [currentUser, params]);

  return useQuery<ApiPaginatedResponse<LeaveRequest>, Error>({
    queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list", finalParams],
    queryFn: () => getLeaveRequests(finalParams!),
    enabled: !!finalParams,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  });
};

export const useLeaveRequestById = (id: number | null) => {
  return useQuery<ApiResponse<LeaveRequest>, Error>({
    queryKey: [LEAVE_REQUESTS_QUERY_KEY, "detail", id],
    queryFn: () => getLeaveRequestById(id!),
    enabled: !!id,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<LeaveRequest>,
    AxiosError,
    CreateLeaveRequestPayload
  >({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
      });
      toast.success("درخواست شما با موفقیت ثبت شد.");
    },
    onError: (error) => {
      if (error.response?.status !== 422) {
        toast.error("خطا در ثبت درخواست.");
      }
      console.error(error);
      throw error;
    },
  });
};

/**
 * هوک برای پردازش (تایید/رد) درخواست
 */
export const useProcessLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<LeaveRequest>,
    AxiosError<ApiValidationError>, // ✅ استفاده از تایپ خطای دقیق
    { id: number; payload: ProcessLeaveRequestPayload }
  >({
    mutationFn: ({ id, payload }) => processLeaveRequest(id, payload),
    onSuccess: (response) => {
      const updatedRequest = response.data;
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
      });
      queryClient.setQueryData(
        [LEAVE_REQUESTS_QUERY_KEY, "detail", updatedRequest.id],
        response
      );
      toast.success(
        `درخواست با موفقیت ${
          updatedRequest.status === "approved" ? "تایید" : "رد"
        } شد.`
      );
    },
    onError: (error) => {
      const status = error.response?.status;
      const data = error.response?.data;

      // ✅ [بهبود یافته] مدیریت هوشمند خطای ۴۲۲
      // اگر به هر دلیلی اعتبارسنجی کلاینت رد شد، اینجا خطای دقیق سرور را نشان می‌دهیم
      if (status === 422 && data?.errors) {
        if (data.errors.rejection_reason) {
          // پیام خطای خاص فیلد دلیل رد
          toast.error(data.errors.rejection_reason[0]);
        } else {
          // نمایش اولین خطای موجود در لیست خطاها
          const firstError = Object.values(data.errors)[0]?.[0];
          toast.error(
            firstError || data.message || "اطلاعات ارسالی معتبر نیست."
          );
        }
      } else if (status === 409) {
        toast.warn(data?.message || "تداخل در درخواست.");
      } else {
        toast.error(data?.message || "خطا در پردازش درخواست.");
      }
      console.error("Process Request Error:", error);
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<LeaveRequest>,
    AxiosError<{ message?: string }>,
    { id: number; payload: UpdateLeaveRequestPayload }
  >({
    mutationFn: ({ id, payload }) => updateLeaveRequest(id, payload),
    onSuccess: (response) => {
      const updatedRequest = response.data;
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
      });
      queryClient.setQueryData(
        [LEAVE_REQUESTS_QUERY_KEY, "detail", updatedRequest.id],
        response
      );
      toast.success("درخواست با موفقیت ویرایش شد.");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "خطا در ویرایش درخواست.";
      if (error.response?.status === 409) {
        toast.warn(message);
      } else {
        toast.error(message);
      }
      console.error(error);
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message?: string }>, number>({
    mutationFn: deleteLeaveRequest,
    onSuccess: (_, deletedId) => {
      toast.success("درخواست با موفقیت لغو شد.");
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
      });
      queryClient.removeQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, "detail", deletedId],
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "خطا در لغو درخواست.";
      toast.error(message);
      console.error(error);
    },
  });
};
