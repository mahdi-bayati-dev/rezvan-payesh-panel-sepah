import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganizations,
  createOrganization,
  fetchOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "@/features/Organization/api/api";
import { type Organization } from "@/features/Organization/types";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

const useOrganizationRole = () => {
  const user = useAppSelector(selectUser);
  if (!user || !user.roles || user.roles.length === 0) return "guest";
  if (user.roles.includes("super_admin")) return "super_admin";
  return user.roles[0];
};

export const organizationKeys = {
  all: ["organizations"] as const,
  list: (role: string) => [...organizationKeys.all, "list", { role }] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: number) => [...organizationKeys.details(), id] as const,
};

export const useOrganizations = (options?: { enabled?: boolean }) => {
  const role = useOrganizationRole();

  return useQuery<Organization[], Error>({
    queryKey: organizationKeys.list(role),
    queryFn: async () => {
      const data = await fetchOrganizations();

      // --- نرمال‌سازی حیاتی ---
      // اگر آرایه بود، یعنی Super Admin است و ساختار درختی دارد.
      if (Array.isArray(data)) {
        return data;
      }
      
      // اگر آبجکت تکی بود (L2/L3)، آن را داخل آرایه می‌گذاریم تا ساختار درختی UI نشکند.
      // بررسی می‌کنیم که آیا واقعا آبجکت معتبر است یا خیر
      if (data && typeof data === 'object' && 'id' in data) {
         return [data as Organization];
      }
      
      return [];
    },
    // فقط زمانی که کاربر لاگین است و نقش دارد درخواست بزن
    enabled: (options?.enabled ?? true) && role !== "guest",
    
    // کش برای ۵ دقیقه تازه بماند (بهینه سازی)
    staleTime: 1000 * 60 * 5, 
  });
};

export const useOrganization = (id: number) => {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const role = useOrganizationRole();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      // لیست را نامعتبر کن تا دوباره گرفته شود
      queryClient.invalidateQueries({ queryKey: organizationKeys.list(role) });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const role = useOrganizationRole();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.list(role) });
      // دیتای کش جزئیات را هم آپدیت کن که اگر کاربر وارد صفحه جزئیات شد، دیتای جدید ببیند
      queryClient.setQueryData(organizationKeys.detail(updatedData.id), updatedData);
    },
  });
};

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