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

/**
 * هوک برای فچ کردن لیست درخواست‌ها (Paginated)
 * ✅ [بروزرسانی] این هوک حالا سطح دسترسی کاربر را مدیریت می‌کند.
 */
export const useLeaveRequests = (params: GetLeaveRequestsParams) => {
  const currentUser = useAppSelector(selectUser) as User | null;

  const finalParams = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const isSuperAdmin = currentUser.roles.includes("super_admin");
    // ✅✅✅ [اصلاحیه خطای 403]
    // ما باید رول‌های "مدیر" را هم چک کنیم.
    const isManager = isSuperAdmin || 
                      currentUser.roles.includes("org-admin-l2") || 
                      currentUser.roles.includes("org-admin-l3");

    // اگر کاربر یک مدیر (هر سطحی) است
    if (isManager) {
      // اگر سوپر ادمین است، پارامترهای UI را مستقیماً اعمال کن
      // (این شامل employee_id هم می‌شود اگر سوپر ادمین در حال فیلتر باشد)
      return params;
    }

    // --- اگر کاربر عادی بود ---
    
    // ✅✅✅ [اصلاحیه کلیدی خطای 403]
    // طبق مستندات، کاربر عادی *نباید* employee_id ارسال کند.
    // سرور به صورت خودکار از روی توکن فیلتر می‌کند.
    // ما پارامترهای ارسالی از UI (مثل status) را حفظ می‌کنیم
    // اما پارامترهای مدیریتی (employee_id و organization_id) را حذف می‌کنیم.
    return {
      ...params,
      employee_id: undefined, // <-- حذف شد
      organization_id: undefined, // <-- حذف شد
    };

  }, [currentUser, params]); 

  return useQuery<ApiPaginatedResponse<LeaveRequest>, Error>({
    queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list", finalParams],
    queryFn: () => getLeaveRequests(finalParams!),
    enabled: !!finalParams,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // ۲ دقیقه
  });
};

/**
 * هوک برای فچ کردن جزئیات یک درخواست
 */
export const useLeaveRequestById = (id: number | null) => {
  return useQuery<ApiResponse<LeaveRequest>, Error>({
    queryKey: [LEAVE_REQUESTS_QUERY_KEY, "detail", id],
    queryFn: () => getLeaveRequestById(id!),
    enabled: !!id,
  });
};

/**
 * هوک برای ایجاد درخواست جدید
 */
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
    AxiosError<{ message?: string }>,
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
      const message = error.response?.data?.message || "خطا در پردازش درخواست.";
      if (error.response?.status === 409) {
        toast.warn(message);
      } else {
        toast.error(message);
      }
      console.error(error);
    },
  });
};

/**
 * هوک برای ویرایش درخواست (توسط کارمند یا مدیر)
 */
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

/**
 * هوک برای لغو (حذف) درخواست
 */
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