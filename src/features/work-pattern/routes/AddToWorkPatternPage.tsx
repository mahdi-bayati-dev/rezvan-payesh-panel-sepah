import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ اضافه شدن useNavigate
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

// --- هوک‌ها و تایپ‌های کارمندان ---
import {
  useUsers,
  useUpdateUserWorkPattern,
  useUpdateUserShiftSchedule
} from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';

// --- ✅ هوک‌ها و تایپ‌های گروه‌های کاری ---
// ✅ حل خطای TS2724: استفاده از هوک جدید useWorkGroups
import { useWorkGroups, useUpdateWorkGroup } from '@/features/work-group/hooks/hook';
import { type WorkGroup } from '@/features/work-group/types/index';

// --- هوک الگوها ---
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';

// --- کامپوننت‌های UI ---
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import Checkbox from "@/components/ui/CheckboxTable";
import { UserPlus, Search, Loader2, Users, Briefcase, ArrowRight } from 'lucide-react'; // ✅ اضافه شدن آیکون ArrowRight

// تایپ SelectOption اختصاصی
interface PatternSelectOption extends SelectOption {
  pattern_type: 'WEEK_PATTERN' | 'SHIFT_SCHEDULE';
}

// تایپ برای مدیریت تب‌ها
type AssignmentTab = 'EMPLOYEES' | 'WORK_GROUPS';

function AddToWorkPattern() {
  const navigate = useNavigate(); // ✅ استفاده از هوک ناوبری

  // --- State های عمومی ---
  const [selectedPattern, setSelectedPattern] = useState<PatternSelectOption | null>(null);
  const [activeTab, setActiveTab] = useState<AssignmentTab>('EMPLOYEES');
  const [searchQuery, setSearchQuery] = useState("");

  // --- State های جدول کارمندان ---
  const [employeeRowSelection, setEmployeeRowSelection] = useState<RowSelectionState>({});
  const [employeePagination, setEmployeePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- State های جدول گروه‌های کاری ---
  const [groupRowSelection, setGroupRowSelection] = useState<RowSelectionState>({});
  const [groupPagination, setGroupPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const handlePatternSelect = (option: SelectOption) => {
    // چون ما می‌دانیم که گزینه‌های ما PatternSelectOption هستند (توسط useMemo ساخته شده‌اند)
    // می‌توانیم با خیال راحت Type Casting انجام دهیم.
    setSelectedPattern(option as PatternSelectOption);
  };
  // --- دریافت داده‌ها ---

  // ۱. لیست الگوها (ترکیبی)
  const { data: combinedPatternsData, isLoading: isLoadingPatterns } = useWorkPatterns(1, 99999);

  // ۲. لیست کارمندان
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page: 1,
    per_page: 9999, // دریافت همه برای فیلتر کلاینت ساید
    search: activeTab === 'EMPLOYEES' ? searchQuery : undefined // جستجو فقط وقتی تب فعال است
  });

  // ۳. ✅ لیست گروه‌های کاری
  const { data: workGroupsResponse, isLoading: isLoadingGroups } = useWorkGroups(1, 9999);
  // نکته: اگر API گروه‌ها سرچ سمت سرور دارد، می‌توانید اینجا پارامتر search را پاس دهید.
  // فعلاً فرض بر فیلتر سمت کلاینت است.

  // --- هوک‌های Mutation ---
  const updateUserPatternMutation = useUpdateUserWorkPattern();
  const updateUserScheduleMutation = useUpdateUserShiftSchedule();
  const updateWorkGroupMutation = useUpdateWorkGroup();

  // --- پردازش داده‌ها ---
  const employees: User[] = usersResponse?.data ?? [];

  // ✅ فیلتر گروه‌های کاری بر اساس جستجو (سمت کلاینت)
  const workGroups: WorkGroup[] = useMemo(() => {
    const allGroups = workGroupsResponse?.data ?? [];
    if (!searchQuery || activeTab !== 'WORK_GROUPS') return allGroups;
    // ✅ حل خطای TS7006: تایپ صریح WorkGroup به پارامتر g داده شد
    return allGroups.filter((g: WorkGroup) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [workGroupsResponse, searchQuery, activeTab]);


  const patternOptions: PatternSelectOption[] = useMemo(() => {
    return (combinedPatternsData?.patterns || []).map(p => ({
      id: p.id,
      name: `${p.name} (${p.pattern_type === 'SHIFT_SCHEDULE' ? 'شیفتی' : 'هفتگی'})`,
      pattern_type: p.pattern_type,
    }));
  }, [combinedPatternsData]);


  // --- تعریف ستون‌های جدول کارمندان ---
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

  // --- ✅ تعریف ستون‌های جدول گروه‌های کاری ---
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
        if (group.week_pattern) {
          return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">الگوی هفتگی: {group.week_pattern.name}</span>
        }
        if (group.shift_schedule) {
          return <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">شیفت: {group.shift_schedule.name}</span>
        }
        return <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">بدون الگو</span>
      }
    }
  ], []);


  // --- پیکربندی جداول ---
  const employeesTable = useReactTable({
    data: employees,
    columns: employeeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setEmployeeRowSelection,
    onPaginationChange: setEmployeePagination,
    state: { rowSelection: employeeRowSelection, pagination: employeePagination },
    manualPagination: false,
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
  });


  // --- هندلر اصلی تخصیص ---
  const handleAssign = () => {
    const workPatternId = selectedPattern?.id ? Number(selectedPattern.id) : null;
    const patternType = selectedPattern?.pattern_type;

    if (!workPatternId || !patternType) {
      toast.warn("لطفا ابتدا یک الگوی کاری انتخاب کنید.");
      return;
    }

    // --- سناریوی ۱: تخصیص به کارمندان ---
    if (activeTab === 'EMPLOYEES') {
      const selectedIds = Object.keys(employeeRowSelection).map(index => employeesTable.getRow(index).original.id);

      if (selectedIds.length === 0) {
        toast.warn("لطفا حداقل یک کارمند را انتخاب کنید.");
        return;
      }

      const mutation = patternType === 'SHIFT_SCHEDULE' ? updateUserScheduleMutation : updateUserPatternMutation;

      const promises = selectedIds.map(userId => {
        // @ts-ignore
        const payload = patternType === 'SHIFT_SCHEDULE' ? { userId, shiftScheduleId: workPatternId } : { userId, workPatternId };
        // @ts-ignore
        return mutation.mutateAsync(payload).catch(err => ({ status: 'rejected', userId, err }));
      });

      executePromises(promises, selectedIds.length, 'کارمند');
    }
    // --- سناریوی ۲: تخصیص به گروه‌های کاری ---
    else {
      const selectedIds = Object.keys(groupRowSelection).map(index => workGroupsTable.getRow(index).original.id);

      if (selectedIds.length === 0) {
        toast.warn("لطفا حداقل یک گروه کاری را انتخاب کنید.");
        return;
      }

      const promises = selectedIds.map(groupId => {
        const group = workGroups.find(g => g.id === groupId);
        if (!group) return Promise.resolve();

        // ✅ پِی‌لود هوشمند: اگر الگوی هفتگی ست شود، شیفت باید نال شود و برعکس
        const payload = {
          name: group.name, // نام اجباری است، نام فعلی را می‌فرستیم
          week_pattern_id: patternType === 'WEEK_PATTERN' ? workPatternId : null,
          shift_schedule_id: patternType === 'SHIFT_SCHEDULE' ? workPatternId : null,
        };

        return updateWorkGroupMutation.mutateAsync({ id: groupId, payload }).catch(err => ({ status: 'rejected', groupId, err }));
      });

      executePromises(promises, selectedIds.length, 'گروه کاری');
    }
  };

  // تابع کمکی برای اجرای پرامیس‌ها و نمایش نتیجه
  const executePromises = (promises: Promise<any>[], count: number, entityName: string) => {
    Promise.allSettled(promises).then(results => {
      const successCount = results.filter(r => r.status === 'fulfilled' && !(r as any).value?.status).length;
      const errorCount = count - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} ${entityName} با موفقیت به‌روزرسانی شد.`);
        // پاک کردن انتخاب‌ها
        if (activeTab === 'EMPLOYEES') setEmployeeRowSelection({});
        else setGroupRowSelection({});
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} مورد با خطا مواجه شد.`);
      }
    });
  }


  const isGlobalLoading = isLoadingUsers || isLoadingPatterns || isLoadingGroups ||
    updateUserPatternMutation.isPending || updateUserScheduleMutation.isPending || updateWorkGroupMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-backgroundL-500 rounded-2xl border border-borderL dark:border-borderD dark:bg-backgroundD" dir="rtl">

      {/* ✅ بخش هدر با دکمه بازگشت */}
      <div className="flex items-center justify-between border-b border-borderL dark:border-borderD pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/work-patterns')}
            className="h-10 w-10 text-muted-foregroundL dark:text-muted-foregroundD hover:text-foregroundL dark:hover:text-foregroundD"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foregroundL dark:text-foregroundD">
              تخصیص الگوی کاری
            </h1>
            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
              شما می‌توانید الگوها را به صورت انفرادی به کارمندان یا به صورت گروهی به گروه‌های کاری اختصاص دهید.
            </p>
          </div>
        </div>
      </div>

      {/* بخش ۱: انتخاب الگو */}
      <div className="bg-backgroundL-500 rounded-md transition-colors duration-300 dark:bg-backgroundD ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <SelectBox
              label="انتخاب الگوی کاری یا شیفت"
              placeholder="یک الگو را انتخاب کنید..."
              options={patternOptions}
              value={selectedPattern}
              // onChange={setSelectedPattern}
              onChange={handlePatternSelect}
              disabled={isGlobalLoading}
            />
          </div>

          {/* جستجو */}
          <div className="md:col-span-2">
            <Input
              label={`جستجو در ${activeTab === 'EMPLOYEES' ? 'کارمندان' : 'گروه‌های کاری'}`}
              placeholder="نام، کد پرسنلی و ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />}
            />
          </div>
        </div>
      </div>

      {/* بخش ۲: تب‌ها */}
      <div className="flex space-x-1 rounded-xl bg-secondaryL/20 dark:bg-secondaryD/20 p-1 rtl:space-x-reverse">
        <button
          onClick={() => { setActiveTab('EMPLOYEES'); setSearchQuery(''); }}
          className={clsx(
            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
            "flex items-center justify-center gap-2",
            activeTab === 'EMPLOYEES'
              ? "bg-white dark:bg-gray-700 shadow text-primaryL dark:text-primaryD"
              : "text-muted-foregroundL dark:text-muted-foregroundD hover:bg-white/[0.12] hover:text-foregroundL dark:hover:text-foregroundD"
          )}
        >
          <Users className="h-4 w-4" />
          کارمندان ({usersResponse?.data?.length ?? 0})
        </button>
        <button
          onClick={() => { setActiveTab('WORK_GROUPS'); setSearchQuery(''); }}
          className={clsx(
            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
            "flex items-center justify-center gap-2",
            activeTab === 'WORK_GROUPS'
              ? "bg-white dark:bg-gray-700 shadow text-primaryL dark:text-primaryD"
              : "text-muted-foregroundL dark:text-muted-foregroundD hover:bg-white/[0.12] hover:text-foregroundL dark:hover:text-foregroundD"
          )}
        >
          <Briefcase className="h-4 w-4" />
          گروه‌های کاری ({workGroupsResponse?.data?.length ?? 0})
        </button>
      </div>

      {/* بخش ۳: جدول‌ها */}
      <div className="bg-backgroundL-500 border rounded-md border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD overflow-hidden min-h-[300px]">
        {isGlobalLoading && !usersResponse ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">در حال بارگذاری اطلاعات...</span>
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

      {/* بخش ۴: دکمه عملیات */}
      <div className="flex justify-end gap-4 pt-4 border-t border-borderL dark:border-borderD">
        <Button
          type="button"
          variant="outline" // دکمه انصراف اضافه شد
          onClick={() => navigate('/work-patterns')}
          disabled={isGlobalLoading}
        >
          انصراف
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleAssign}
          disabled={
            !selectedPattern || isGlobalLoading ||
            (activeTab === 'EMPLOYEES' && Object.keys(employeeRowSelection).length === 0) ||
            (activeTab === 'WORK_GROUPS' && Object.keys(groupRowSelection).length === 0)
          }
        >
          {(updateUserPatternMutation.isPending || updateUserScheduleMutation.isPending || updateWorkGroupMutation.isPending) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          <UserPlus className="ml-2 h-4 w-4" />
          {activeTab === 'EMPLOYEES'
            ? `تخصیص به ${Object.keys(employeeRowSelection).length} کارمند`
            : `تخصیص به ${Object.keys(groupRowSelection).length} گروه کاری`
          }
        </Button>
      </div>
    </div>
  )
}

export default AddToWorkPattern;