import { useState, useMemo } from "react"; // <-- ۱. useMemo اینجا اضافه شد
import { Filter, Loader2 } from "lucide-react";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from 'react-multi-date-picker';

// تعریف فیلترهای API
interface ApiFilters {
  employee: SelectOption | null;
  date_from: DateObject | null;
  date_to: DateObject | null;
}

// به‌روزرسانی پراپ‌ها
interface ActivityFiltersProps {
  onFilterChange: (filters: ApiFilters) => void;
  employeeOptions: SelectOption[]; // لیست واقعی
  isLoadingEmployees: boolean; // استیت لودینگ
}

export function ActivityFilters({
  onFilterChange,
  employeeOptions,
  isLoadingEmployees
}: ActivityFiltersProps) {

  // استیت‌های داخلی فیلتر
  const [employee, setEmployee] = useState<SelectOption | null>(null);
  const [dateFrom, setDateFrom] = useState<DateObject | null>(null);
  const [dateTo, setDateTo] = useState<DateObject | null>(null);

  const handleApplyFilters = () => {
    onFilterChange({
      // اگر id 'all' بود، null بفرست (یعنی بدون فیلتر کارمند)
      employee: employee?.id === 'all' ? null : employee,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  // ۲. افزودن "همه کارمندان" به لیست با استفاده از useMemo
  const employeesWithAllOption = useMemo(() => {
    // اطمینان از اینکه 'all' فقط یک بار اضافه می‌شود
    const hasAllOption = employeeOptions.some(opt => opt.id === 'all');
    if (hasAllOption) return employeeOptions;

    return [{ id: 'all', name: 'همه کارمندان' }, ...employeeOptions];
  }, [employeeOptions]);


  return (
    <div className="p-5 rounded-2xl border mb-5
                 bg-backgroundL-500 dark:bg-backgroundD
                 border-borderL dark:border-borderD
                 shadow-sm transition-colors duration-300 space-y-6"
    >
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-primaryL dark:text-primaryD" />
        <h3 className="font-semibold text-foregroundL dark:text-foregroundD">
          فیلتر گزارش‌ها
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* اتصال SelectBox به داده واقعی */}
        <div className="relative">
          <SelectBox
            label="کارمند"
            placeholder={isLoadingEmployees ? "در حال بارگذاری..." : "انتخاب کنید"}
            options={employeesWithAllOption} // <-- ۳. استفاده از لیست جدید
            value={employee}
            onChange={setEmployee}
            disabled={isLoadingEmployees}
          />
          {isLoadingEmployees && (
            <Loader2 className="w-4 h-4 absolute left-3 top-10 animate-spin text-muted-foregroundL" />
          )}
        </div>

        {/* TODO: از DateRangePicker استفاده کنید */}
        <PersianDatePickerInput
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="از تاریخ..."
          label="تاریخ"
        />
        <PersianDatePickerInput
          value={dateTo}
          onChange={setDateTo}
          placeholder="تا تاریخ..."
          label=" " // لیبل خالی برای هم‌ترازی
        />
      </div>

      <button
        type="button"
        onClick={handleApplyFilters}
        className="w-full flex items-center justify-center gap-2 px-6 py-2.5
                   rounded-xl font-medium shadow-md
                   bg-primaryL text-primary-foregroundL
                   dark:bg-primaryD dark:text-primary-foregroundD
                   hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-primaryL dark:focus:ring-primaryD
                   transition-all duration-200"
      >
        <Filter className="w-5 h-5" />
        <span>اعمال فیلتر</span>
      </button>
    </div>
  );
}