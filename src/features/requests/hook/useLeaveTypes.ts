// features/requests/hooks/useLeaveTypes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveTypesTree,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  type LeaveTypePayload,
  type LeaveType,
} from "../api/api";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
// (می‌توانید از یک سرویس Toast برای نمایش خطاها استفاده کنید)
// import { toast } from 'react-hot-toast';

// کلید اصلی کش برای انواع مرخصی
export const LEAVE_TYPES_QUERY_KEY = ["leaveTypes"];

/**
 * هوک برای دریافت لیست درختی انواع مرخصی (GET)
 */
export const useLeaveTypes = () => {
  return useQuery<LeaveType[], Error>({
    queryKey: LEAVE_TYPES_QUERY_KEY,
    queryFn: getLeaveTypesTree,
    // (اختیاری) داده‌ها تا ۵ دقیقه تازه می‌مانند
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * هوک برای دریافت جزئیات یک نوع (استفاده نشده در این فاز، اما مفید است)
 */
export const useLeaveTypeById = (id: number | null) => {
  return useQuery<LeaveType, Error>({
    queryKey: [LEAVE_TYPES_QUERY_KEY, "detail", id],
    queryFn: () => getLeaveTypeById(id!),
    enabled: !!id, // فقط زمانی اجرا شو که ID وجود داشته باشد
  });
};

/**
 * هوک برای ایجاد نوع مرخصی (POST)
 */
export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation<LeaveType, Error, LeaveTypePayload>({
    mutationFn: createLeaveType,
    onSuccess: (newData) => {
      // کش لیست را باطل کن تا دوباره فچ شود
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEY });
      // (اختیاری) نمایش پیغام موفقیت
      // toast.success(`نوع مرخصی "${newData.name}" با موفقیت ایجاد شد.`);
      toast.success(`نوع مرخصی "${newData.name}" با موفقیت ایجاد شد.`);
    },
    onError: (error) => {
      // toast.error("خطا در ایجاد نوع مرخصی.");
      toast.error("خطا در ایجاد نوع مرخصی.");
      console.error(error);
    },
  });
};

/**
 * هوک برای به‌روزرسانی نوع مرخصی (PUT)
 */
export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation<
    LeaveType,
    Error,
    { id: number; payload: LeaveTypePayload }
  >({
    mutationFn: ({ id, payload }) => updateLeaveType(id, payload),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEY });
      // (اختیاری) می‌توانیم کش جزئیات را هم مستقیماً آپدیت کنیم
      queryClient.setQueryData(
        [LEAVE_TYPES_QUERY_KEY, "detail", updatedData.id],
        updatedData
      );
      // toast.success(`نوع مرخصی "${updatedData.name}" به‌روز شد.`);
      toast.success(`نوع مرخصی "${updatedData.name}" به‌روز شد.`);
    },
    onError: (error) => {
      // toast.error("خطا در به‌روزرسانی.");
      toast.error("خطا در به‌روزرسانی.");
      console.error(error);
    },
  });
};

/**
 * هوک برای حذف نوع مرخصی (DELETE)
 */
export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message: string }>, number>({
    mutationFn: deleteLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEY });
      // toast.success("نوع مرخصی با موفقیت حذف شد.");
      toast.success("نوع مرخصی با موفقیت حذف شد.");
    },
    onError: (error) => {
      // مدیریت خطای 409 (Conflict) از API
      if (error.response?.status === 409) {
        // toast.error(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        // toast.error("خطا در حذف نوع مرخصی.");
        toast.error("خطا در حذف نوع مرخصی.");
      }
      console.error(error);
    },
  });
};
