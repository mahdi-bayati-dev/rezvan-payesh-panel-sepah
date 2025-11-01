import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// ✅ مسیرهای نسبی
import {
  fetchUsers,
  updateUserOrganization,
  fetchUserById, // ✅ جدید
  updateUserProfile, // ✅ جدید
} from "../api/api";
import {
  type FetchUsersParams,
  type UserListResponse,
  type User,
  // ✅ جدید
} from "@/features/User/types/index";
import type { UserProfileFormData } from "@/features/User/Schema/userProfileFormSchema";
// --- کلیدهای کوئری ---
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: FetchUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const, // ✅ جدید
  detail: (id: number) => [...userKeys.details(), id] as const, // ✅ جدید
};

// --- هوک‌های موجود ---

/**
 * هوک برای فچ کردن لیست کاربران
 */
export const useUsers = (params: FetchUsersParams) => {
  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
    // ✅ اصلاح شده برای React Query v5
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
      // ✅ اصلاح شده (ESLint)
      console.log("hook=>", updatedUser);

      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// --- ✅ هوک‌های جدید برای صفحه پروفایل ---

/**
 * هوک برای دریافت اطلاعات تکی کاربر
 * @param userId شناسه کاربر
 */
export const useUser = (userId: number) => {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserById(userId),
    enabled: !!userId, // فقط زمانی اجرا شو که ID معتبر باشد
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
      // پس از موفقیت، هم لیست‌ها و هم کوئری detail این کاربر را آپدیت می‌کنیم

      // ۱. آپدیت کوئری detail
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      // ۲. باطل کردن لیست‌ها (تا در صورت بازگشت، لیست آپدیت باشد)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
