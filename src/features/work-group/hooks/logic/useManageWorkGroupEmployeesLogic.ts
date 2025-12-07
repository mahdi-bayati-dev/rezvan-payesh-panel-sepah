import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { toast } from "react-toastify";

// هوک‌های API
import {
  useWorkGroup,
  useAddEmployeeToGroup,
  useRemoveEmployeeFromGroup,
} from "@/features/work-group/hooks/hook";
import { useUsers } from "@/features/User/hooks/hook";

// تعریف هوک Debounce داخلی
const useInternalDebounce = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const safeParseTotal = (value: any): number => {
  if (Array.isArray(value)) return parseInt(String(value[0])) || 0;
  return parseInt(String(value)) || 0;
};

export const useManageWorkGroupEmployeesLogic = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const isValidId = !isNaN(numericId) && numericId > 0;

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useInternalDebounce(searchTerm, 500);

  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  // Pagination States
  const [assignedPagination, setAssignedPagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize: 5 }
  );
  const [availablePagination, setAvailablePagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  // ✅ Selection States (جدید)
  const [assignedRowSelection, setAssignedRowSelection] =
    useState<RowSelectionState>({});
  const [availableRowSelection, setAvailableRowSelection] =
    useState<RowSelectionState>({});

  // ریست کردن Pagination و Selection هنگام جستجو
  useEffect(() => {
    setAssignedPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setAvailablePagination((prev) => ({ ...prev, pageIndex: 0 }));
    setAssignedRowSelection({});
    setAvailableRowSelection({});
  }, [debouncedSearch]);

  // --- Data Fetching ---
  const { data: workGroup, isLoading: isGroupLoading } =
    useWorkGroup(numericId);

  const {
    data: assignedResponse,
    isLoading: isAssignedLoading,
    refetch: refetchAssigned,
  } = useUsers({
    page: assignedPagination.pageIndex + 1,
    per_page: assignedPagination.pageSize,
    work_group_id: numericId,
    search: debouncedSearch,
  });

  const {
    data: availableResponse,
    isLoading: isAvailableLoading,
    refetch: refetchAvailable,
  } = useUsers({
    page: availablePagination.pageIndex + 1,
    per_page: availablePagination.pageSize,
    is_not_assigned_to_group: true,
    search: debouncedSearch,
  });

  // --- Mutations ---
  const { mutate: addEmployee, isPending: isAdding } = useAddEmployeeToGroup();
  const { mutate: removeEmployee, isPending: isRemoving } =
    useRemoveEmployeeFromGroup();

  // --- Handlers (Single) ---
  const handleAssignUser = useCallback(
    (userId: number) => {
      if (!isValidId) return;
      setPendingUserId(userId);
      addEmployee(
        {
          groupId: numericId,
          payload: { employee_ids: [userId], action: "attach" },
        },
        {
          onSuccess: () => {
            refetchAvailable();
            refetchAssigned();
          },
          onSettled: () => setPendingUserId(null),
        }
      );
    },
    [numericId, isValidId, addEmployee, refetchAvailable, refetchAssigned]
  );

  const handleRemoveUser = useCallback(
    (userId: number) => {
      if (!isValidId) return;
      setPendingUserId(userId);
      removeEmployee(
        {
          groupId: numericId,
          payload: { employee_ids: [userId], action: "detach" },
        },
        {
          onSuccess: () => {
            refetchAssigned();
            refetchAvailable();
          },
          onSettled: () => setPendingUserId(null),
        }
      );
    },
    [numericId, isValidId, removeEmployee, refetchAssigned, refetchAvailable]
  );

  // --- ✅ Handlers (Bulk) ---
  const handleBulkAssign = useCallback(() => {
    const selectedIds = Object.keys(availableRowSelection).map(Number);
    if (!isValidId || selectedIds.length === 0) return;

    addEmployee(
      {
        groupId: numericId,
        payload: { employee_ids: selectedIds, action: "attach" },
      },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.length} کاربر با موفقیت اضافه شدند.`);
          setAvailableRowSelection({}); // پاک کردن انتخاب‌ها
          refetchAvailable();
          refetchAssigned();
        },
      }
    );
  }, [
    isValidId,
    numericId,
    availableRowSelection,
    addEmployee,
    refetchAvailable,
    refetchAssigned,
  ]);

  const handleBulkRemove = useCallback(() => {
    const selectedIds = Object.keys(assignedRowSelection).map(Number);
    if (!isValidId || selectedIds.length === 0) return;

    removeEmployee(
      {
        groupId: numericId,
        payload: { employee_ids: selectedIds, action: "detach" },
      },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.length} کاربر با موفقیت حذف شدند.`);
          setAssignedRowSelection({}); // پاک کردن انتخاب‌ها
          refetchAssigned();
          refetchAvailable();
        },
      }
    );
  }, [
    isValidId,
    numericId,
    assignedRowSelection,
    removeEmployee,
    refetchAssigned,
    refetchAvailable,
  ]);

  return {
    isValidId,
    groupName: workGroup?.name || "گروه کاری",
    searchTerm,
    setSearchTerm,
    isLoading: isGroupLoading || isAssignedLoading || isAvailableLoading,
    isMutating: isAdding || isRemoving,
    pendingUserId,

    // Assigned Data & Selection
    assignedUsers: assignedResponse?.data || [],
    assignedPagination,
    setAssignedPagination,
    assignedPageCount: assignedResponse?.meta?.last_page || 0,
    assignedTotal: safeParseTotal(assignedResponse?.meta?.total),
    assignedRowSelection, // ✅
    setAssignedRowSelection, // ✅

    // Available Data & Selection
    availableUsers: availableResponse?.data || [],
    availablePagination,
    setAvailablePagination,
    availablePageCount: availableResponse?.meta?.last_page || 0,
    availableTotal: safeParseTotal(availableResponse?.meta?.total),
    availableRowSelection, // ✅
    setAvailableRowSelection, // ✅

    // Handlers
    handleAssignUser,
    handleRemoveUser,
    handleBulkAssign, // ✅
    handleBulkRemove, // ✅
  };
};
