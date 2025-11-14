import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganizations,
  createOrganization,
  fetchOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "@/features/Organization/api/api";
import {
  type Organization,
  type OrganizationCollectionResponse,
  type OrganizationResourceResponse,
} from "@/features/Organization/types";
// import { type OrganizationFormData } from "@/features/Organization/index";
// --- ۱. ایمپورت هوک و سلکتور Redux ---
import { useAppSelector } from "@/hook/reduxHooks"; // (مسیر هوک‌های Redux شما)
import { selectUser } from "@/store/slices/authSlice"; // (مسیر authSlice شما)

const useOrganizationRole = () => {
  const user = useAppSelector(selectUser);

  // ۲. [اصلاح] اگر user یا roles وجود نداشت، باید 'guest' برگردانیم
  if (!user || !user.roles || user.roles.length === 0) {
    return "guest";
  }
  // اگر 'super_admin' در آرایه نقش‌ها بود، این نقش اصلی است
  if (user.roles.includes("super_admin")) {
    return "super_admin";
  }
  // در غیر این صورت، اولین نقش (مثلاً 'Admin L2' یا 'Admin L3') را برمی‌گردانیم
  return user.roles[0];
};

// --- کلیدهای کوئری ---
export const organizationKeys = {
  all: ["organizations"] as const,
  // لیست‌ها بر اساس نقش کاربر متفاوت هستند، پس نقش را در کلید کوئری می‌آوریم
  list: (role: string) => [...organizationKeys.all, "list", { role }] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: number) => [...organizationKeys.details(), id] as const,
};

// --- هوک‌های React Query ---

/**
 * هوک اصلی برای فچ کردن چارت سازمانی
 * این هوک منطق پیچیده API (بر اساس نقش) را مدیریت می‌کند
 * و *همیشه* یک آرایه یکدست از سازمان‌ها برمی‌گرداند که برای ساختن درخت آماده است
 * ✅ اصلاح: پذیرش آرگومان options
 */
export const useOrganizations = (options?: { enabled?: boolean }) => {
  // ۳. استفاده از هوک Redux به جای useAuth فرضی
  const role = useOrganizationRole();

  return useQuery<Organization[], Error>({
    queryKey: organizationKeys.list(role),
    queryFn: async () => {
      const response = await fetchOrganizations();
      console.log(response);

      // --- منطق حیاتی (بدون تغییر) ---
      if ("id" in response.data) {
        const singleOrg = (response as OrganizationResourceResponse).data;
        return [singleOrg];
      }
      return (response as OrganizationCollectionResponse).data;
    },

    // ۴. فعال کردن کوئری فقط زمانی که کاربر نقش معتبر دارد
    enabled: (options?.enabled ?? true) && role !== "guest", // ✅ اعمال enabled از پراپ و نقش
  });
};

/**
 * هوک برای دریافت اطلاعات تکی یک سازمان (برای صفحه جزئیات یا pre-fetch)
 */
export const useOrganization = (id: number) => {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id, // فقط زمانی اجرا شو که ID معتبر باشد
  });
};

/**
 * هوک Mutation برای ایجاد سازمان
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  // ۵. گرفتن نقش برای invalidate کردن کوئری صحیح
  const role = useOrganizationRole();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.list(role) });
    },
  });
};

/**
 * هوک Mutation برای ویرایش سازمان
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const role = useOrganizationRole();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.list(role) });
      queryClient.setQueryData(
        organizationKeys.detail(updatedData.id),
        updatedData
      );
    },
  });
};

/**
 * هوک Mutation برای حذف سازمان
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  const role = useOrganizationRole();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.list(role) });
    },
  });
};
