import { useState, useMemo } from "react";
// 1. ایمپورت کامپوننت Combobox و آیکون‌های لازم
import { Combobox } from "@headlessui/react";
import { Filter, Loader2, Check, ChevronsUpDown } from "lucide-react";
// 2. ایمپورت هوک جستجوی سرور-ساید
import { useEmployeeOptionsSearch } from "../../hooks/hook";
import { type SelectOption } from "../../../../components/ui/SelectBox"; // (این تایپ مشترک است)
import PersianDatePickerInput from "../../../../lib/PersianDatePickerInput";
import { type DateObject } from 'react-multi-date-picker';

// تایپ ApiFilters بدون تغییر باقی می‌ماند
export interface ApiFilters {
  employee: SelectOption | null;
  date_from: DateObject | null;
  date_to: DateObject | null;
}

// 3. پراپ‌های ورودی کامپوننت حذف شدند (چون خودش دیتا را واکشی می‌کند)
interface ActivityFiltersProps {
  onFilterChange: (filters: ApiFilters) => void;
  // employeeOptions: SelectOption[]; // <-- حذف شد
  // isLoadingEmployees: boolean; // <-- حذف شد
}

export function ActivityFilters({
  onFilterChange,
}: ActivityFiltersProps) {

  // استیت‌های داخلی فیلتر
  const [employee, setEmployee] = useState<SelectOption | null>(null);
  const [dateFrom, setDateFrom] = useState<DateObject | null>(null);
  const [dateTo, setDateTo] = useState<DateObject | null>(null);

  // 4. استیت برای نگهداری عبارت جستجوی کاربر
  const [employeeQuery, setEmployeeQuery] = useState('');

  // 5. فراخوانی هوک جستجو بر اساس تایپ کاربر
  const {
    data: searchResults,
    isLoading: isLoadingEmployees
  } = useEmployeeOptionsSearch(employeeQuery);


  const handleApplyFilters = () => {
    onFilterChange({
      // 6. این منطق همچنان درست است
      // اگر "همه" (id: 'all') انتخاب شده بود، null بفرست
      employee: employee?.id === 'all' ? null : employee,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  // 7. آماده‌سازی لیست گزینه‌ها برای نمایش
  // (گزینه "همه کارمندان" + نتایج جستجو)
  const employeeOptionsToShow = useMemo(() => {
    const allOption: SelectOption = { id: 'all', name: 'همه کارمندان' };

    // اگر کاربر جستجو نکرده، فقط "همه" را نشان بده
    if (employeeQuery === '' && !searchResults) {
      return [allOption];
    }
    // اگر جستجو کرده، "همه" را در بالای نتایج نشان بده
    return [allOption, ...(searchResults || [])];

  }, [searchResults, employeeQuery]);


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

        {/* --- 8. جایگزینی SelectBox با Combobox --- */}
        <Combobox
          as="div"
          className="relative"
          value={employee}
          onChange={setEmployee}
        >
          <Combobox.Label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
            کارمند
          </Combobox.Label>
          <div className="relative">
            <Combobox.Input
              className={`w-full p-3 pr-10 border rounded-xl bg-backgroundL-DEFAULT dark:bg-backgroundD-800 transition-colors
                          border-borderL dark:border-borderD focus:ring-primaryL
                          focus:outline-none focus:ring-2`}
              // ورودی تایپ شده توسط کاربر، استیت query را آپدیت می‌کند
              onChange={(event) => setEmployeeQuery(event.target.value)}
              // متنی که بعد از انتخاب نمایش داده می‌شود
              displayValue={(opt: SelectOption) => opt?.name || ''}
              placeholder="جستجوی نام کارمند..."
              autoComplete="off"
            />
            <Combobox.Button className="absolute inset-y-0 left-0 flex items-center px-3 text-muted-foregroundL dark:text-muted-foregroundD">
              {isLoadingEmployees ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronsUpDown className="w-5 h-5" />
              )}
            </Combobox.Button>
          </div>

          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl
                                    bg-backgroundL-500 dark:bg-backgroundD-900 py-1 shadow-lg ring-1
                                    ring-black/5 dark:ring-white/10 focus:outline-none">

            {/* منطق نمایش گزینه‌ها */}
            {employeeOptionsToShow.length === 0 && employeeQuery.length > 1 && !isLoadingEmployees ? (
              <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                کارمندی یافت نشد.
              </div>
            ) : (
              employeeOptionsToShow.map((opt) => (
                <Combobox.Option
                  key={opt.id}
                  value={opt}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4
                    ${active ? 'bg-primaryL/10 text-primaryL dark:bg-primaryD/10 dark:text-primaryD' : 'text-foregroundL dark:text-foregroundD'}`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {opt.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3
                                    ${active ? 'text-primaryL dark:text-primaryD' : 'text-primaryL dark:text-primaryD'}`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox>
        {/* --- پایان بخش Combobox --- */}


        {/* فیلدهای تاریخ (بدون تغییر) */}
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