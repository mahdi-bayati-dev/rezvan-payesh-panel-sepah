import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify"; // ✅ ایمپورت toast
import {
  fetchUsers,
  updateUserOrganization,
  fetchUserById,
  updateUserProfile,
  deleteUser,
  createUser,
} from "../api/api";
import {
  type FetchUsersParams,
  type UserListResponse,
  type User,
} from "@/features/User/types/index";
import type {
  UserProfileFormData,
  CreateUserFormData,
  AccessManagementFormData, // ✅ ایمپورت تایپ جدید
} from "@/features/User/Schema/userProfileFormSchema";

// --- کلیدهای کوئری ---
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: FetchUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// --- هوک‌های موجود ---

/**
 * هوک برای فچ کردن لیست کاربران
 */
export const useUsers = (params: FetchUsersParams) => {
  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * هوک برای تغییر سازمان کاربر (توسط Super Admin)
 */
export const useUpdateUserOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: number; organizationId: number }>({
    mutationFn: updateUserOrganization,
    onSuccess: (updatedUser) => {
      console.log("hook=>", updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// --- هوک‌های جدید برای صفحه پروفایل ---

/**
 * هوک برای دریافت اطلاعات تکی کاربر
 * @param userId شناسه کاربر
 */
export const useUser = (userId: number) => {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });
};

/**
 * هوک Mutation برای ویرایش پروفایل کاربر
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User, // تایپ دیتایی که برمی‌گردد
    Error, // تایپ خطا
    { userId: number; payload: UserProfileFormData } // تایپ ورودی تابع mutate
  >({
    mutationFn: updateUserProfile,

    onSuccess: (updatedUser) => {
      // ✅ به‌روزرسانی کش جزئیات کاربر
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      // ✅ به‌روزرسانی کش لیست‌ها (چون ممکن است نقش یا نام تغییر کرده باشد)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "خطا در به‌روزرسانی پروفایل.";
      toast.error(errorMessage);
    },
  });
};

// --- ✅ هوک جدید: تغییر نقش کاربر (مخصوص Super Admin) ---
/**
 * هوک Mutation برای ویرایش نقش کاربر (فقط Super Admin)
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  // ما از هوک useUpdateUserProfile که قبلاً ساخته بودیم استفاده مجدد می‌کنیم
  // تا کد تکراری ننویسیم و فقط payload را مدیریت کنیم.
  

  // تابع mutate اختصاصی خودمان را برمی‌گردانیم
  return useMutation<
    User,
    Error,
    { userId: number; payload: AccessManagementFormData }
  >({
    mutationFn: updateUserProfile, // از همان تابع API استفاده می‌کند
    onSuccess: (updatedUser) => {
      // onSuccess اصلی در useUpdateUserProfile مدیریت می‌شود
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("نقش کاربر با موفقیت به‌روزرسانی شد.");
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "خطا در تغییر نقش.";
      // مستندات API می‌گوید 403 (Forbidden) برمی‌گردد اگر Super Admin نباشیم
      if ((error as any)?.response?.status === 403) {
        toast.error("خطای دسترسی: فقط Super Admin مجاز به تغییر نقش است.");
      } else {
        toast.error(errorMessage);
      }
    },
  });
};
// --- --- --- --- --- --- --- --- --- --- --- ---

/**
 * ✅ هوک جدید: به‌روزرسانی (تخصیص) الگوی کاری کارمندان
 * این هوک از زیرساخت updateUserProfile استفاده می‌کند اما متمرکز بر work_pattern_id است.
 */
export const useUpdateUserWorkPattern = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    Error,
    { userId: number; workPatternId: number | null }
  >({
    mutationFn: ({ userId, workPatternId }) => {
      const payload: UserProfileFormData = {
        employee: {
          work_pattern_id: workPatternId,
        } as any,
      };
      return updateUserProfile({ userId, payload });
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "خطا در تخصیص الگوی کاری.";
      throw new Error(errorMessage);
    },
  });
};

/**
 * ✅ هوک جدید: حذف کاربر
 * این هوک برای ActionsCell.tsx مورد نیاز است.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    number // ورودی: userId
  >({
    mutationFn: deleteUser, // تابع API

    onSuccess: (_, deletedUserId) => {
      // ۱. کلید لیست کاربران را باطل می‌کنیم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // ۲. جزئیات کاربر حذف شده را از کش پاک می‌کنیم
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedUserId) });
      // پیام موفقیت در کامپوننت (ActionsCell) داده می‌شود
    },

    onError: (error) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "خطا در حذف کاربر رخ داد.";
      toast.error(errorMessage); // نمایش پیام خطا
    },
  });
};

// --- ✅ هوک جدید: ایجاد کاربر ---

/**
 * هوک Mutation برای ایجاد کاربر جدید (POST /api/users)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User, // تایپ دیتایی که برمی‌گردد
    Error, // تایپ خطا
    CreateUserFormData // تایپ ورودی تابع mutate
  >({
    mutationFn: createUser, // تابع API که در مرحله قبل ساختیم

    onSuccess: (newUser) => {
      // ۱. لیست کاربران را باطل می‌کنیم تا داده‌های جدید فچ شوند
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // ۲. (اختیاری) می‌توانیم کاربر جدید را مستقیماً در کش جزئیات اضافه کنیم
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);

      // (پیام موفقیت در خود کامپوننت فرم مدیریت می‌شود)
    },

    onError: (error) => {
      // مدیریت خطاهای عمومی
      const errorMessage =
        (error as any)?.response?.data?.message || "خطا در ایجاد کاربر.";

      // اگر خطای اعتبarsنجی (422) نباشد، آن را نشان می‌دهیم
      if ((error as any)?.response?.status !== 422) {
        toast.error(errorMessage);
      }
      // ما خطا را مجدداً throw می‌کنیم تا کامپوننت فرم بتواند
      // خطاهای 422 (validation) را گرفته و در فیلدها ست کند.
      throw error;
    },
  });
};
