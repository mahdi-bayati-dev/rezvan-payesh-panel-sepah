// کامنت: این فایل صرفاً تعاریف ستون‌ها را نگه می‌دارد تا کامپوننت اصلی خلوت بماند.
import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/features/User/types/index";
import { type WorkGroup } from "@/features/work-group/types/index";
import Checkbox from "@/components/ui/Checkbox";
import { toPersianDigits } from "@/features/work-pattern/utils/persianUtils";

// --- ستون‌های مربوط به کارمندان ---
export const employeeColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="انتخاب همه"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label=""
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
      // کامنت: مدیریت نمایش نام (اگر نام کارمند خالی بود، نام کاربری نمایش داده شود)
      const displayName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || user.user_name;
      return (
        <div className="flex items-center gap-2">
          {/* آواتار ساده با حرف اول */}
          <span className="w-8 h-8 rounded-full bg-secondaryL flex items-center justify-center text-sm font-bold text-foregroundL/70">
            {displayName.charAt(0)}
          </span>
          <span className="font-medium text-sm">{displayName}</span>
        </div>
      );
    }
  },
  {
    header: 'کد پرسنلی',
    accessorKey: 'employee.personnel_code',
    cell: ({ row }) => toPersianDigits(row.original.employee?.personnel_code || '---')
  },
  {
    header: 'الگوی فعلی',
    // کامنت: نمایش هوشمند نام الگو چه شیفت باشد چه الگوی هفتگی
    accessorFn: (row) => row.employee?.week_pattern?.name || row.employee?.shift_schedule?.name,
    cell: info => {
      const val = info.getValue() as string;
      return val ? (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondaryL/50 dark:bg-secondaryD/30">
          {val}
        </span>
      ) : (
        <span className="text-muted-foregroundL dark:text-muted-foregroundD text-xs">---</span>
      );
    },
  },
  {
    header: 'گروه کاری',
    accessorFn: (row) => row.employee?.work_group?.name,
    cell: info => {
      const val = info.getValue() as string;
      return val ? (
        <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          {val}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foregroundL">بدون گروه</span>
      );
    },
  }
];

// --- ستون‌های مربوط به گروه‌های کاری ---
export const workGroupColumns: ColumnDef<WorkGroup>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        label=""
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="انتخاب همه"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label=""
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
      if (group.week_pattern)
        return <span className="text-xs px-2 py-1 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">الگوی هفتگی: {group.week_pattern.name}</span>
      if (group.shift_schedule)
        return <span className="text-xs px-2 py-1 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">شیفت: {group.shift_schedule.name}</span>
      return <span className="text-xs text-muted-foregroundL opacity-70">بدون الگو</span>
    }
  }
];