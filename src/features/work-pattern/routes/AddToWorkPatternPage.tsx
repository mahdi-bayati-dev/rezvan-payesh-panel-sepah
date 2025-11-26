import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import clsx from 'clsx';
import { toast } from 'react-toastify';

// hooks & types
import {
  useUsers,
  useUpdateUserWorkPattern,
  useUpdateUserShiftSchedule
} from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import { useWorkGroups, useUpdateWorkGroup } from '@/features/work-group/hooks/hook';
import { type WorkGroup } from '@/features/work-group/types/index';
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';

// ui
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import Checkbox from "@/components/ui/CheckboxTable";
import { UserPlus, Search, Loader2, Users, Briefcase, ArrowRight, AlertTriangle } from 'lucide-react'; // آیکون هشدار اضافه شد

interface PatternSelectOption extends SelectOption {
  pattern_type: 'WEEK_PATTERN' | 'SHIFT_SCHEDULE';
}

type AssignmentTab = 'EMPLOYEES' | 'WORK_GROUPS';

function AddToWorkPattern() {
  const navigate = useNavigate();

  // State
  const [selectedPattern, setSelectedPattern] = useState<PatternSelectOption | null>(null);
  const [activeTab, setActiveTab] = useState<AssignmentTab>('EMPLOYEES');
  const [searchQuery, setSearchQuery] = useState("");

  const [employeeRowSelection, setEmployeeRowSelection] = useState<RowSelectionState>({});
  const [employeePagination, setEmployeePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [groupRowSelection, setGroupRowSelection] = useState<RowSelectionState>({});
  const [groupPagination, setGroupPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const handlePatternSelect = (option: SelectOption) => {
    setSelectedPattern(option as PatternSelectOption);
  };

  // Data Fetching
  const { data: combinedPatternsData, isLoading: isLoadingPatterns } = useWorkPatterns(1, 99999);
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page: 1,
    per_page: 9999,
    search: activeTab === 'EMPLOYEES' ? searchQuery : undefined
  });
  const { data: workGroupsResponse, isLoading: isLoadingGroups } = useWorkGroups(1, 9999);

  // Mutations
  const updateUserPatternMutation = useUpdateUserWorkPattern();
  const updateUserScheduleMutation = useUpdateUserShiftSchedule();
  const updateWorkGroupMutation = useUpdateWorkGroup();

  // Processing Data
  const employees: User[] = usersResponse?.data ?? [];

  const workGroups: WorkGroup[] = useMemo(() => {
    const allGroups = workGroupsResponse?.data ?? [];
    if (!searchQuery || activeTab !== 'WORK_GROUPS') return allGroups;
    return allGroups.filter((g: WorkGroup) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [workGroupsResponse, searchQuery, activeTab]);

  const patternOptions: PatternSelectOption[] = useMemo(() => {
    return (combinedPatternsData?.patterns || []).map(p => ({
      id: p.id,
      name: `${p.name} (${p.pattern_type === 'SHIFT_SCHEDULE' ? 'شیفتی' : 'هفتگی'})`,
      pattern_type: p.pattern_type,
    }));
  }, [combinedPatternsData]);

  // Columns - Employees
  const employeeColumns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="انتخاب همه"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="انتخاب ردیف"
        />
      ),
    },
    {
      header: 'نام کارمند',
      accessorKey: 'employee.full_name',
      cell: ({ row }) => {
        const user = row.original;
        const employee = user.employee;
        const displayName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || user.user_name;
        return (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-secondaryL flex items-center justify-center text-sm">
              {displayName.charAt(0)}
            </span>
            <span className="font-medium">{displayName}</span>
          </div>
        );
      }
    },
    { header: 'کد پرسنلی', accessorKey: 'employee.personnel_code', cell: ({ row }) => row.original.employee?.personnel_code || '---' },
    {
      header: 'الگوی فعلی',
      accessorFn: (row) => row.employee?.week_pattern?.name || row.employee?.shift_schedule?.name,
      cell: info => info.getValue() || <span className="text-muted-foregroundL dark:text-muted-foregroundD text-xs">---</span>,
    },
    {
      header: 'گروه کاری',
      accessorFn: (row) => row.employee?.work_group?.name,
      cell: info => <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">{String(info.getValue() || 'بدون گروه')}</span>,
    }
  ], []);

  // Columns - Work Groups
  const workGroupColumns = useMemo<ColumnDef<WorkGroup>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="انتخاب همه"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="انتخاب ردیف"
        />
      ),
    },
    {
      header: 'نام گروه',
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-semibold text-foregroundL dark:text-foregroundD">{row.original.name}</span>
    },
    {
      header: 'وضعیت الگو',
      id: 'pattern_status',
      cell: ({ row }) => {
        const group = row.original;
        if (group.week_pattern) return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">الگوی هفتگی: {group.week_pattern.name}</span>
        if (group.shift_schedule) return <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">شیفت: {group.shift_schedule.name}</span>
        return <span className="text-xs text-muted-foregroundL">بدون الگو</span>
      }
    }
  ], []);

  // Tables
  const employeesTable = useReactTable({
    data: employees,
    columns: employeeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setEmployeeRowSelection,
    onPaginationChange: setEmployeePagination,
    state: { rowSelection: employeeRowSelection, pagination: employeePagination },
    manualPagination: false,
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
    manualPagination: false,
    getRowId: (row) => String(row.id),
  });

  // Assign Handler
  const handleAssign = () => {
    console.group("🚀 [Start] Assign Process");

    const workPatternId = selectedPattern?.id ? Number(selectedPattern.id) : null;
    const patternType = selectedPattern?.pattern_type;

    if (!workPatternId || !patternType) {
      toast.warn("لطفا ابتدا یک الگوی کاری انتخاب کنید.");
      console.groupEnd();
      return;
    }

    // Scenario 1: Employees
    if (activeTab === 'EMPLOYEES') {
      const selectedIds = employeesTable.getSelectedRowModel().flatRows.map(row => row.original.id);

      if (selectedIds.length === 0) {
        toast.warn("لطفا حداقل یک کارمند را انتخاب کنید.");
        console.groupEnd();
        return;
      }

      const mutation = patternType === 'SHIFT_SCHEDULE' ? updateUserScheduleMutation : updateUserPatternMutation;

      const promises = selectedIds.map(userId => {
        // @ts-ignore
        const payload = patternType === 'SHIFT_SCHEDULE' ? { userId, shiftScheduleId: workPatternId } : { userId, workPatternId };

        console.log(`📤 Sending Request for User ${userId}...`);

        // @ts-ignore
        return mutation.mutateAsync(payload)
          .then(res => {
            // 🛡️ بررسی امنیتی: آیا واقعاً سرور دیتا را تغییر داد؟
            const emp = res?.employee;
            const serverPatternId = patternType === 'SHIFT_SCHEDULE'
              ? emp?.shift_schedule?.id
              : emp?.week_pattern?.id;

            // تبدیل به عدد برای مقایسه دقیق
            const isUpdated = Number(serverPatternId) === Number(workPatternId);

            if (!isUpdated) {
              console.error(`⚠️ [Backend Issue] User ${userId}: Server ignored the update! fillable?`);
              // 💥 پرتاب خطا برای اینکه در بخش catch گرفته شود و به عنوان "خطا" شمرده شود
              throw new Error("Server ignored update (Check $fillable)");
            }

            console.log(`✅ [Success] User ${userId} updated.`);
            return res;
          })
          .catch(err => {
            console.error(`❌ [Error] Failed for User ${userId}:`, err);
            return { status: 'rejected', userId, err };
          });
      });

      executePromises(promises, selectedIds.length, 'کارمند');
    }
    // Scenario 2: Groups
    else {
      const selectedIds = workGroupsTable.getSelectedRowModel().flatRows.map(row => row.original.id);

      if (selectedIds.length === 0) {
        toast.warn("لطفا حداقل یک گروه کاری را انتخاب کنید.");
        console.groupEnd();
        return;
      }

      const promises = selectedIds.map(groupId => {
        const group = workGroups.find(g => g.id === groupId);
        if (!group) return Promise.resolve();

        const payload = {
          name: group.name,
          week_pattern_id: patternType === 'WEEK_PATTERN' ? workPatternId : null,
          shift_schedule_id: patternType === 'SHIFT_SCHEDULE' ? workPatternId : null,
        };

        return updateWorkGroupMutation.mutateAsync({ id: groupId, payload })
          .then(res => {
            console.log(`✅ [Success] Group ${groupId} updated.`);
            return res;
          })
          .catch(err => {
            console.error(`❌ [Error] Failed for Group ${groupId}:`, err);
            return { status: 'rejected', groupId, err };
          });
      });

      executePromises(promises, selectedIds.length, 'گروه کاری');
    }
    console.groupEnd();
  };

  const executePromises = (promises: Promise<any>[], count: number, entityName: string) => {
    Promise.allSettled(promises).then(results => {
      // ✅ حالا فقط مواردی که واقعاً موفق بوده‌اند (و تایید سرور را گرفته‌اند) شمرده می‌شوند
      const successCount = results.filter(r => r.status === 'fulfilled' && !(r as any).value?.status).length;
      const errorCount = count - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} ${entityName} با موفقیت به‌روزرسانی شد.`);
        if (activeTab === 'EMPLOYEES') setEmployeeRowSelection({});
        else setGroupRowSelection({});
      }

      if (errorCount > 0) {
        // 🔴 نمایش خطای هوشمند
        toast.error(
          <div>
            <div className='font-bold flex items-center gap-1'>
              <AlertTriangle className="w-4 h-4" />
              {errorCount} مورد انجام نشد!
            </div>
            <div className='text-xs mt-1 opacity-90'>
              احتمالا مشکل از سمت سرور است (فیلدها Fillable نیستند).
            </div>
          </div>
        );
      }
    });
  }

  const isGlobalLoading = isLoadingUsers || isLoadingPatterns || isLoadingGroups ||
    updateUserPatternMutation.isPending || updateUserScheduleMutation.isPending || updateWorkGroupMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-backgroundL-500 rounded-2xl border border-borderL dark:border-borderD dark:bg-backgroundD" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderL dark:border-borderD pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-patterns')} className="h-10 w-10">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">تخصیص الگوی کاری</h1>
            <p className="text-sm text-muted-foregroundL">الگوها را به کارمندان یا گروه‌های کاری اختصاص دهید.</p>
          </div>
        </div>
      </div>

      {/* Pattern Selection */}
      <div className="bg-backgroundL-500 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <SelectBox
              label="انتخاب الگوی کاری یا شیفت"
              placeholder="یک الگو را انتخاب کنید..."
              options={patternOptions}
              value={selectedPattern}
              onChange={handlePatternSelect}
              disabled={isGlobalLoading}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label={`جستجو در ${activeTab === 'EMPLOYEES' ? 'کارمندان' : 'گروه‌های کاری'}`}
              placeholder="نام، کد پرسنلی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-secondaryL/20 dark:bg-secondaryD/20 p-1 rtl:space-x-reverse">
        <button
          onClick={() => { setActiveTab('EMPLOYEES'); setSearchQuery(''); }}
          className={clsx(
            "w-full rounded-lg py-2.5 text-sm font-medium transition-all",
            "flex items-center justify-center gap-2",
            activeTab === 'EMPLOYEES'
              ? "bg-white dark:bg-gray-700 shadow text-primaryL"
              : "text-muted-foregroundL hover:bg-white/[0.12]"
          )}
        >
          <Users className="h-4 w-4" />
          کارمندان ({usersResponse?.data?.length ?? 0})
        </button>
        <button
          onClick={() => { setActiveTab('WORK_GROUPS'); setSearchQuery(''); }}
          className={clsx(
            "w-full rounded-lg py-2.5 text-sm font-medium transition-all",
            "flex items-center justify-center gap-2",
            activeTab === 'WORK_GROUPS'
              ? "bg-white dark:bg-gray-700 shadow text-primaryL"
              : "text-muted-foregroundL hover:bg-white/[0.12]"
          )}
        >
          <Briefcase className="h-4 w-4" />
          گروه‌های کاری ({workGroupsResponse?.data?.length ?? 0})
        </button>
      </div>

      {/* Tables */}
      <div className="bg-backgroundL-500 border rounded-md border-borderL min-h-[300px]">
        {isGlobalLoading && !usersResponse ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : (
          <>
            {activeTab === 'EMPLOYEES' ? (
              <>
                <DataTable table={employeesTable} notFoundMessage="کارمندی یافت نشد." />
                <DataTablePagination table={employeesTable} />
              </>
            ) : (
              <>
                <DataTable table={workGroupsTable} notFoundMessage="گروه کاری یافت نشد." />
                <DataTablePagination table={workGroupsTable} />
              </>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-borderL">
        <Button variant="outline" onClick={() => navigate('/work-patterns')} disabled={isGlobalLoading}>
          انصراف
        </Button>
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={!selectedPattern || isGlobalLoading || (activeTab === 'EMPLOYEES' && Object.keys(employeeRowSelection).length === 0)}
        >
          {isGlobalLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          <UserPlus className="ml-2 h-4 w-4" />
          تخصیص نهایی
        </Button>
      </div>
    </div>
  )
}

export default AddToWorkPattern;