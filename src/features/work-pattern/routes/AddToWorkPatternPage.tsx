import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom'; // ✅ خطای ۱۲: حذف شد (استفاده نشده)
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import clsx from 'clsx'
import { toast } from 'react-toastify';

// ✅ ۱. ایمپورت هوک‌های واقعی (User و Work Pattern)
import { useUsers, useUpdateUserWorkPattern } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import { useWorkPatternsList } from '@/features/work-group/hooks/hook';


import SelectBox, { type SelectOption } from "@/components/ui/SelectBox"; // ✅ حروف کوچک
import Input from "@/components/ui/Input"; // ✅ حروف کوچک
import { Button } from "@/components/ui/Button"; // ✅ حروف کوچک
import { DataTable } from "@/components/ui/DataTable/index";
import Checkbox from "@/components/ui/CheckboxTable";
import { UserPlus, Search, Loader2 } from 'lucide-react';


// --- کامپوننت اصلی ---

function AddToWorkPattern() {
  // const navigate = useNavigate(); // ✅ حذف شد
  // استیت برای الگوی کاری انتخاب شده
  const [selectedPattern, setSelectedPattern] = useState<SelectOption | null>(null);
  // استیت برای متن جستجو
  const [searchQuery, setSearchQuery] = useState("");
  // استیت برای ردیف‌های انتخاب شده در جدول
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  // استیت برای لودینگ‌های تکی
  // const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({}); // ✅ خطای ۱۳: حذف شد (استفاده نشده)


  // ✅ ۲. فچ کردن لیست کارمندان و الگوها
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page: 1,
    per_page: 9999,
    search: searchQuery
  });

  const { data: rawPatterns, isLoading: isLoadingPatterns } = useWorkPatternsList();

  // ✅ ۳. هوک Mutation برای تخصیص الگوی کاری
  const patternAssignmentMutation = useUpdateUserWorkPattern();


  const employees: User[] = usersResponse?.data ?? [];

  // ✅ ۴. تبدیل لیست الگوها به SelectOption
  const patternOptions: SelectOption[] = useMemo(() => {
    return rawPatterns?.map(p => ({ id: p.id, name: p.name })) || [];
  }, [rawPatterns]);

  // تعریف ستون‌های جدول
  const columns = useMemo<ColumnDef<User>[]>(() => [
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
      header: 'مشخصات',
      accessorKey: 'employee.full_name',
      cell: ({ row }) => {
        const user = row.original;
        const employee = user.employee;
        const displayName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || user.user_name;

        return (
          <div className="flex items-center gap-2" style={{ minWidth: '150px' }}>
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
      header: 'الگوی کاری فعلی', accessorKey: 'employee.work_pattern_id', cell: ({ row }) => {
        const patternId = row.original.employee?.work_pattern_id;
        const pattern = patternOptions.find(p => p.id === patternId);
        return pattern?.name || '---';
      }
    },
    {
      header: 'وضعیت',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          row.original.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        )}>
          {row.original.status === 'active' ? 'فعال' : 'غیرفعال'}
        </span>
      )
    }
  ], [patternOptions]);


  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    }
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleAssignEmployees = () => {
    const workPatternId = selectedPattern?.id ? Number(selectedPattern.id) : null;

    if (!workPatternId) {
      toast.warn("لطفا ابتدا یک الگوی کاری انتخاب کنید.");
      return;
    }

    if (selectedCount === 0) {
      toast.warn("لطفا حداقل یک کارمند را انتخاب کنید.");
      return;
    }

    const selectedUserIds = table
      .getSelectedRowModel()
      .rows
      .map(row => row.original.id);

    // ۱. تنظیم حالت لودینگ
    // (منطق loadingStates حذف شد چون استفاده نشده بود)

    // ۲. ایجاد آرایه پرامیس‌ها برای آپدیت
    const promises = selectedUserIds.map(userId =>
      patternAssignmentMutation.mutateAsync({ userId, workPatternId })
        .catch(error => {
          console.error(`Error assigning pattern to user ${userId}:`, (error as Error).message);
          return { status: 'rejected', reason: (error as Error).message, userId };
        })
    );

    // ۳. اجرای همه آپدیت‌ها و گزارش نهایی
    Promise.allSettled(promises)
      .then(results => {
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const errorCount = results.filter(r => r.status === 'rejected').length;

        // ✅✅✅ اصلاح خطای ۱۴: اضافه کردن if check ✅✅✅
        if (successCount > 0 && selectedPattern) {
          toast.success(`${successCount} کارمند با موفقیت به الگوی "${selectedPattern.name}" تخصیص یافتند.`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} مورد با خطا مواجه شد.`);
        }
      })
      .finally(() => {
        // ۴. پاکسازی نهایی
        setRowSelection({});
        // setLoadingStates({}); // ✅ حذف شد
      });
  };

  const isGlobalLoading = isLoadingUsers || isLoadingPatterns || patternAssignmentMutation.isPending;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-backgroundL-500 rounded-2xl bordr border-borderL dark:border-borderD dark:bg-backgroundD">
      <div className='border-b border-borderL dark:border-borderD pb-2'>
        <h1 className="text-2xl font-semibold text-foregroundL dark:text-foregroundD ">
          تخصیص الگوی کاری به کارمندان
        </h1>
      </div>


      {/* بخش فیلترها و انتخاب الگو */}
      <div className="bg-backgroundL-500  rounded-md  transition-colors duration-300 dark:bg-backgroundD ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectBox
            label="انتخاب الگوی کاری"
            placeholder="یک الگو را انتخاب کنید..."
            options={patternOptions}
            value={selectedPattern}
            onChange={setSelectedPattern}
            disabled={isGlobalLoading}
          />
          <Input
            label="جستجوی کارمند"
            placeholder="بر اساس نام, کد پرسنلی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2"
            icon={<Search className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />}
          />
        </div>
      </div>

      {/* بخش جدول کارمندان */}
      <div className="bg-backgroundL-500 border rounded-md border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD overflow-hidden">
        {isGlobalLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">در حال بارگذاری لیست کارمندان و الگوها...</span>
          </div>
        ) : (
          <DataTable table={table} notFoundMessage="کارمندی با این مشخصات یافت نشد." />
        )}
      </div>

      {/* بخش دکمه نهایی */}
      <div className="flex justify-end gap-4 pt-4 border-t border-borderL dark:border-borderD">
        <Button
          type="button"
          variant="primary"
          onClick={handleAssignEmployees}
          disabled={selectedCount === 0 || !selectedPattern || isGlobalLoading}
        >
          {patternAssignmentMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          <UserPlus className="ml-2 h-4 w-4" />
          {selectedCount > 0
            ? `تخصیص ${selectedCount} کارمند به الگو`
            : 'تخصیص کارمندان به الگو'
          }
        </Button>
      </div>
    </div>
  )
}

export default AddToWorkPattern;
