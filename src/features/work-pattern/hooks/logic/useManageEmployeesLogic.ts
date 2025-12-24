import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useUsers,
  useUpdateUserWorkPattern,
  useUpdateUserShiftSchedule,
} from "@/features/User/hooks/hook";
import { useWeekPatternDetails } from "@/features/work-pattern/hooks/api/useWeekPatternDetails";
import { useShiftSchedule } from "@/features/shift-schedule/hooks/hook";
import { type User } from "@/features/User/types/index";

const useDebounce = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export const useManageEmployeesLogic = () => {
  const { patternType, patternId } = useParams<{
    patternType: string;
    patternId: string;
  }>();
  const numericPatternId = useMemo(() => Number(patternId), [patternId]);
  const isShiftSchedule = patternType === "schedule";

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 450);

  // --- Data Fetching ---
  const { data: patternDetails, isLoading: isPatternLoading } =
    useWeekPatternDetails(!isShiftSchedule ? numericPatternId : 0);
  const { data: scheduleDetails, isLoading: isScheduleLoading } =
    useShiftSchedule(isShiftSchedule ? numericPatternId : 0);

  const {
    data: userResponse,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers({
    page: 1,
    per_page: 9999,
    search: debouncedSearch,
  });

  // --- Mutations ---
  const assignPatternMutation = useUpdateUserWorkPattern();
  const assignScheduleMutation = useUpdateUserShiftSchedule();
  const isMutating =
    assignPatternMutation.isPending || assignScheduleMutation.isPending;

  // --- Logic: Split Users ---
  // ✅ اصلاح خطا: تایپ‌گذاری صریح برای متغیرهای داخلی و خروجی
  const { assignedUsers, availableUsers } = useMemo<{
    assignedUsers: User[];
    availableUsers: User[];
  }>(() => {
    // مطمئن می‌شویم که all تایپ درستی دارد
    const all: User[] = userResponse?.data ?? [];

    if (!numericPatternId || all.length === 0) {
      return { assignedUsers: [], availableUsers: all };
    }

    const assigned: User[] = [];
    const available: User[] = [];

    for (const u of all) {
      const emp = u.employee;
      let isAssigned = false;

      if (isShiftSchedule) {
        if (
          emp?.shift_schedule &&
          Number(emp.shift_schedule.id) === numericPatternId
        ) {
          isAssigned = true;
        }
      } else {
        if (
          emp?.week_pattern &&
          Number(emp.week_pattern.id) === numericPatternId
        ) {
          isAssigned = true;
        }
      }

      if (isAssigned) assigned.push(u);
      else available.push(u);
    }

    return { assignedUsers: assigned, availableUsers: available };
  }, [userResponse, numericPatternId, isShiftSchedule]);

  // --- Handlers (Memoized) ---
  // ✅ بهینه‌سازی: استفاده از useCallback برای جلوگیری از رندرهای اضافی در جداول
  const handleAssignUser = useCallback(
    (userId: number) => {
      const mutation = isShiftSchedule
        ? assignScheduleMutation
        : assignPatternMutation;
      const payload = isShiftSchedule
        ? { userId, shiftScheduleId: numericPatternId }
        : { userId, workPatternId: numericPatternId };

      // @ts-ignore
      mutation.mutate(payload, {
        // ✅ اصلاح خطا: حذف پارامتر response بی‌استفاده
        onSuccess: () => {
          // Verification logic (Simplified for brevity)
          toast.success("سرباز با موفقیت اضافه شد.");
          refetchUsers();
        },
        onError: (err) => toast.error((err as Error)?.message ?? "خطای نامشخص"),
      });
    },
    [
      isShiftSchedule,
      numericPatternId,
      assignScheduleMutation,
      assignPatternMutation,
      refetchUsers,
    ]
  );

  const handleRemoveUser = useCallback(
    (userId: number) => {
      const mutation = isShiftSchedule
        ? assignScheduleMutation
        : assignPatternMutation;
      const payload = isShiftSchedule
        ? { userId, shiftScheduleId: null }
        : { userId, workPatternId: null };

      // @ts-ignore
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success("سرباز با موفقیت حذف شد.");
          refetchUsers();
        },
        onError: (err) => toast.error((err as Error)?.message ?? "خطای نامشخص"),
      });
    },
    [
      isShiftSchedule,
      assignScheduleMutation,
      assignPatternMutation,
      refetchUsers,
    ]
  );

  const patternName = isShiftSchedule
    ? scheduleDetails?.name ?? "برنامهٔ شیفتی"
    : patternDetails?.name ?? "الگوی کاری";

  const isLoading = isPatternLoading || isScheduleLoading || isUsersLoading;

  return {
    assignedUsers,
    availableUsers,
    patternName,
    numericPatternId,
    isLoading,
    isMutating,
    isUsersError,
    usersError,
    searchTerm,
    setSearchTerm,
    handleAssignUser,
    handleRemoveUser,
    isValidId: !isNaN(numericPatternId),
  };
};
