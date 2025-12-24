import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { toPersianDigits } from "@/features/work-pattern/utils/persianUtils";

// API Hooks
import {
  useUsers,
  useUpdateUserWorkPattern,
  useUpdateUserShiftSchedule,
} from "@/features/User/hooks/hook";
import {
  useWorkGroups,
  useUpdateWorkGroup,
} from "@/features/work-group/hooks/hook";
import { useWorkPatterns } from "@/features/work-pattern/hooks/api/useWorkPatternsHookGet";
import {
  employeeColumns,
  workGroupColumns,
} from "../../components/assignment/assignmentColumns";
import { type SelectOption } from "@/components/ui/SelectBox";

export type PatternSelectOption = SelectOption & {
  pattern_type: "WEEK_PATTERN" | "SHIFT_SCHEDULE";
};

export type AssignmentTab = "EMPLOYEES" | "WORK_GROUPS";

export const useAssignmentLogic = () => {
  // --- State Management ---
  const [selectedPattern, setSelectedPattern] =
    useState<PatternSelectOption | null>(null);
  const [activeTab, setActiveTab] = useState<AssignmentTab>("EMPLOYEES");
  const [searchQuery, setSearchQuery] = useState("");

  // Table States
  const [employeeRowSelection, setEmployeeRowSelection] =
    useState<RowSelectionState>({});
  const [employeePagination, setEmployeePagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize: 10 }
  );

  const [groupRowSelection, setGroupRowSelection] = useState<RowSelectionState>(
    {}
  );
  const [groupPagination, setGroupPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Data Fetching ---
  const { data: combinedPatternsData, isLoading: isLoadingPatterns } =
    useWorkPatterns(1, 1000);

  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page: 1,
    per_page: 9999,
    search: activeTab === "EMPLOYEES" ? searchQuery : undefined,
  });

  const { data: workGroupsResponse, isLoading: isLoadingGroups } =
    useWorkGroups(1, 9999);

  // --- Mutations ---
  const updateUserPatternMutation = useUpdateUserWorkPattern();
  const updateUserScheduleMutation = useUpdateUserShiftSchedule();
  const updateWorkGroupMutation = useUpdateWorkGroup();

  // --- Derived Data ---
  const employees = usersResponse?.data ?? [];

  const workGroups = useMemo(() => {
    const allGroups = workGroupsResponse?.data ?? [];
    if (!searchQuery || activeTab !== "WORK_GROUPS") return allGroups;
    return allGroups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workGroupsResponse, searchQuery, activeTab]);

  const patternOptions: PatternSelectOption[] = useMemo(() => {
    return (combinedPatternsData?.patterns || []).map((p) => ({
      id: p.id,
      name: `${p.name} (${
        p.pattern_type === "SHIFT_SCHEDULE" ? "شیفتی" : "هفتگی"
      })`,
      pattern_type: p.pattern_type,
    }));
  }, [combinedPatternsData]);

  // --- Table Instances ---
  const employeesTable = useReactTable({
    data: employees,
    columns: employeeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setEmployeeRowSelection,
    onPaginationChange: setEmployeePagination,
    state: {
      rowSelection: employeeRowSelection,
      pagination: employeePagination,
    },
    getRowId: (row) => String(row.id),
  });

  const workGroupsTable = useReactTable({
    data: workGroups,
    columns: workGroupColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setGroupRowSelection,
    onPaginationChange: setGroupPagination,
    state: { rowSelection: groupRowSelection, pagination: groupPagination },
    getRowId: (row) => String(row.id),
  });

  // --- Action Handlers ---
  const handlePromiseResults = (
    results: PromiseSettledResult<any>[],
    count: number,
    entityName: string
  ) => {
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errorCount = count - successCount;

    if (successCount > 0) {
      toast.success(
        `${toPersianDigits(
          successCount
        )} ${entityName} با موفقیت به‌روزرسانی شد.`
      );
      if (activeTab === "EMPLOYEES") setEmployeeRowSelection({});
      else setGroupRowSelection({});
    }

    if (errorCount > 0) {
      toast.warn(`${toPersianDigits(errorCount)} مورد با خطا مواجه شد.`);
      console.error(
        "Errors in assignment:",
        results.filter((r) => r.status === "rejected")
      );
    }
  };

  const handleAssign = async () => {
    const workPatternId = selectedPattern?.id
      ? Number(selectedPattern.id)
      : null;
    const patternType = selectedPattern?.pattern_type;

    if (!workPatternId || !patternType) {
      toast.warn("لطفا ابتدا یک الگوی کاری انتخاب کنید.");
      return;
    }

    // سناریوی ۱: تخصیص به سربازان
    if (activeTab === "EMPLOYEES") {
      const selectedRows = employeesTable.getSelectedRowModel().flatRows;
      if (selectedRows.length === 0)
        return toast.warn("لطفا حداقل یک سرباز را انتخاب کنید.");

      // ✅ اصلاح خطا: به جای استفاده از یک متغیر mutation مشترک که باعث خطای Union Type می‌شد،
      // منطق را جدا کردیم تا تایپ‌اسکریپت بتواند نوع payload را دقیق تشخیص دهد.
      const promises = selectedRows.map((row) => {
        const userId = row.original.id;

        if (patternType === "SHIFT_SCHEDULE") {
          return updateUserScheduleMutation.mutateAsync({
            userId,
            shiftScheduleId: workPatternId,
          });
        } else {
          return updateUserPatternMutation.mutateAsync({
            userId,
            workPatternId,
          });
        }
      });

      const results = await Promise.allSettled(promises);
      handlePromiseResults(results, selectedRows.length, "سرباز");
    }
    // سناریوی ۲: تخصیص به گروه‌ها
    else {
      const selectedRows = workGroupsTable.getSelectedRowModel().flatRows;
      if (selectedRows.length === 0)
        return toast.warn("لطفا حداقل یک گروه کاری را انتخاب کنید.");

      const promises = selectedRows.map((row) => {
        const group = row.original;
        const payload = {
          name: group.name,
          week_pattern_id:
            patternType === "WEEK_PATTERN" ? workPatternId : null,
          shift_schedule_id:
            patternType === "SHIFT_SCHEDULE" ? workPatternId : null,
        };
        return updateWorkGroupMutation.mutateAsync({ id: group.id, payload });
      });

      const results = await Promise.allSettled(promises);
      handlePromiseResults(results, selectedRows.length, "گروه کاری");
    }
  };

  const isGlobalLoading =
    isLoadingUsers ||
    isLoadingPatterns ||
    isLoadingGroups ||
    updateUserPatternMutation.isPending ||
    updateUserScheduleMutation.isPending ||
    updateWorkGroupMutation.isPending;

  return {
    selectedPattern,
    setSelectedPattern,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isGlobalLoading,
    patternOptions,
    employeesCount: usersResponse?.data?.length ?? 0,
    groupsCount: workGroupsResponse?.data?.length ?? 0,
    employeesTable,
    workGroupsTable,
    handleAssign,
    hasSelection:
      activeTab === "EMPLOYEES"
        ? Object.keys(employeeRowSelection).length > 0
        : Object.keys(groupRowSelection).length > 0,
  };
};
