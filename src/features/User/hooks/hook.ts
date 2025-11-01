import {
  useQuery,
  useMutation,
  useQueryClient,
  // type UseQueryOptions,
} from "@tanstack/react-query";
import { fetchUsers, updateUserOrganization } from "@/features/User/api/api";
import {
  type FetchUsersParams,
  type UserListResponse,
  type User,
} from "@/features/User/types";

// --- کلیدهای کوئری ---
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  // لیست‌ها بر اساس پارامترها فیلتر می‌شوند
  list: (params: FetchUsersParams) => [...userKeys.lists(), params] as const,
};

// --- هوک React Query ---

/**
 * هوک برای فچ کردن لیست کاربران با قابلیت فیلتر و صفحه‌بندی
 * @param params پارامترهای فیلتر (page, search, organization_id, ...)
 */
export const useUsers = (params: FetchUsersParams) => {
  return useQuery<UserListResponse, Error>({
    // کلید کوئری شامل تمام پارامترها است
    // تا با تغییر فیلترها، کوئری مجدد اجرا شود
    queryKey: userKeys.list(params),

    // تابع فچ‌کننده
    queryFn: () => fetchUsers(params),

    // این کار از چشمک زدن جدول در زمان تغییر صفحه (pagination) جلوگیری می‌کند.
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateUserOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User, // تایپ دیتایی که برمی‌گردد
    Error, // تایپ خطا
    { userId: number; organizationId: number } // تایپ ورودی تابع mutate
  >({
    mutationFn: updateUserOrganization,

    onSuccess: (updatedUser) => {
      // پس از موفقیت، تمام کوئری‌های لیست کاربران را باطل می‌کنیم
      // تا لیست‌ها (هم صفحه جستجو و هم صفحه قبلی) آپدیت شوند
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      console.log(updatedUser);

      // همچنین می‌توانیم دیتای کوئری "detail" این کاربر را هم آپدیت کنیم
      // (اگر صفحه‌ای برای جزئیات تکی کاربر دارید)
      // queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
  });
};
