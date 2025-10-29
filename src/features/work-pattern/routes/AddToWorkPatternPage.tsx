import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import clsx from 'clsx'

// کامنت: ایمپورت‌ها با حروف کوچک اصلاح شدند
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable/index";
import Checkbox from "@/components/ui/CheckboxTable"; // کامپوننت جدید
import { UserPlus, Search } from 'lucide-react';

// --- تعریف تایپ‌ها و داده‌های فیک ---

type Employee = {
  id: string;
  personalCode: string;
  name: string;
  familyName: string;
  avatarUrl: string; // آدرس عکس پروفایل
  workGroup: string;
  status: 'active' | 'inactive';
};

// داده‌های فیک برای الگوهای کاری
const mockPatterns: SelectOption[] = [
  { id: 'p1', name: 'شیفت صبح (اداری)' },
  { id: 'p2', name: 'شیفت عصر (نگهبانی)' },
  { id: 'p3', name: 'برنامه چرخشی (تولید)' },
];

// داده‌های فیک برای کارمندان
const mockEmployees: Employee[] = [
  { id: 'e1', personalCode: '0123456789', name: 'مهدی', familyName: 'بیاتی', avatarUrl: 'https://placehold.co/40x40/E2E8F0/64748B?text=MB', workGroup: 'توسعه', status: 'active' },
  { id: 'e2', personalCode: '9876543210', name: 'سارا', familyName: 'رضایی', avatarUrl: 'https://placehold.co/40x40/E2E8F0/64748B?text=SR', workGroup: 'مالی', status: 'active' },
  { id: 'e3', personalCode: '1122334455', name: 'علی', familyName: 'احمدی', avatarUrl: 'https://placehold.co/40x40/E2E8F0/64748B?text=AA', workGroup: 'توسعه', status: 'inactive' },
  { id: 'e4', personalCode: '5566778899', name: 'زهرا', familyName: 'محمدی', avatarUrl: 'https://placehold.co/40x40/E2E8F0/64748B?text=ZM', workGroup: 'منابع انسانی', status: 'active' },
  { id: 'e5', personalCode: '3344556677', name: 'رضا', familyName: 'کریمی', avatarUrl: 'https://placehold.co/40x40/E2E8F0/64748B?text=RK', workGroup: 'مالی', status: 'active' },
];

// --- کامپوننت اصلی ---

function AddToWorkPattern() {
  // استیت برای الگوی کاری انتخاب شده
  const [selectedPattern, setSelectedPattern] = useState<SelectOption | null>(null);
  // استیت برای متن جستجو
  const [searchQuery, setSearchQuery] = useState("");
  // استیت برای ردیف‌های انتخاب شده در جدول
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [allEmployees] = useState<Employee[]>(mockEmployees);

  // فیلتر کردن کارمندان بر اساس جستجو
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return allEmployees;
    const lowerQuery = searchQuery.toLowerCase();
    return allEmployees.filter(emp =>
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.familyName.toLowerCase().includes(lowerQuery) ||
      emp.personalCode.includes(lowerQuery) ||
      emp.workGroup.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, allEmployees]);

  // تعریف ستون‌های جدول
  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      // ستون مخصوص Checkbox برای انتخاب
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
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
      // فعال کردن/غیرفعال کردن resize و sort برای این ستون
    },
    {
      header: 'مشخصات',
      accessorKey: 'name', // استفاده از یک accessorKey الزامی است
      cell: ({ row }) => (
        <div className="flex items-center gap-2" style={{ minWidth: '150px' }}>
          <img
            src={row.original.avatarUrl}
            alt={`${row.original.name} ${row.original.familyName}`}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40/E2E8F0/64748B?text=??')}
          />
          <span className="font-medium">{row.original.name} {row.original.familyName}</span>
        </div>
      )
    },
    { header: 'کد پرسنلی', accessorKey: 'personalCode' },
    { header: 'گروه کاری', accessorKey: 'workGroup' },
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
          {row.original.status === 'active' ? 'حاضر' : 'غایب'}
        </span>
      )
    }
  ], []);

  // ساختن نمونه جدول
  const table = useReactTable({
    data: filteredEmployees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection, // مدیریت استیت انتخاب
    state: {
      rowSelection, // پاس دادن استیت به جدول
    }
  });

  const selectedCount = Object.keys(rowSelection).length;

  // فانکشن برای دکمه "تخصیص" (فعلا فقط لاگ می‌گیرد)
  const handleAssignEmployees = () => {
    const selectedEmployeeIds = Object.keys(rowSelection);
    const selectedEmployees = allEmployees.filter(emp => selectedEmployeeIds.includes(emp.id));

    if (!selectedPattern) {
      console.warn("لطفا ابتدا یک الگوی کاری انتخاب کنید.");
      // در دنیای واقعی اینجا یک Toast نمایش می‌دهیم
      return;
    }

    if (selectedEmployees.length === 0) {
      console.warn("لطفا حداقل یک کارمند را انتخاب کنید.");
      // در دنیای واقعی اینجا یک Toast نمایش می‌دهیم
      return;
    }

    console.log("--- شبیه‌سازی ارسال به API ---");
    console.log(`الگوی کاری: ${selectedPattern.name} (ID: ${selectedPattern.id})`);
    console.log("کارمندان انتخاب شده:", selectedEmployees.map(e => `${e.name} ${e.familyName} (ID: ${e.id})`));
    console.log("---------------------------------");

    // پاک کردن فرم پس از موفقیت
    setRowSelection({});
    setSelectedPattern(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-backgroundL-500 rounded-2xl bordr border-borderL dark:border-borderD dark:bg-backgroundD">
      <div className='border-b border-borderL dark:border-borderD pb-2'>
        <h1 className="text-2xl font-semibold text-foregroundL dark:text-foregroundD ">
          افزودن کارمندان / گروه کاری
        </h1>
      </div>


      {/* بخش فیلترها و انتخاب الگو */}
      <div className="bg-backgroundL-500  rounded-md  transition-colors duration-300 dark:bg-backgroundD ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectBox
            label="انتخاب الگوی کاری"
            placeholder="یک الگو را انتخاب کنید..."
            options={mockPatterns}
            value={selectedPattern}
            onChange={setSelectedPattern}
          />
          <Input
            label="جستجوی کارمند"
            placeholder="بر اساس نام، کد پرسنلی، گروه کاری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2"
            icon={<Search className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />}
          />
        </div>
      </div>

      {/* بخش جدول کارمندان */}
      <div className="bg-backgroundL-500 border rounded-md border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD overflow-hidden">
        <DataTable table={table} notFoundMessage="کارمندی با این مشخصات یافت نشد." />
      </div>

      {/* بخش دکمه نهایی */}
      <div className="flex justify-end gap-4 pt-4 border-t border-borderL dark:border-borderD">
        <Button
          type="button"
          variant="primary"
          onClick={handleAssignEmployees}
          disabled={selectedCount === 0 || !selectedPattern}
        >
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
