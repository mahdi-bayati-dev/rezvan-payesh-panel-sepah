import { useState, useMemo } from "react";
// 1. ایمپورت کامپوننت Combobox و آیکون‌های لازم
import { Combobox } from "@headlessui/react";
import { Filter, Check, User } from "lucide-react";
// 2. ایمپورت هوک جستجوی سرور-ساید (فرض بر وجود این مسیر)
import { useEmployeeOptionsSearch } from "../../hooks/hook";
import { type SelectOption } from "../../../../components/ui/SelectBox";
import PersianDatePickerInput from "../../../../lib/PersianDatePickerInput";
import { type DateObject } from 'react-multi-date-picker';

// تایپ ApiFilters
export interface ApiFilters {
  employee: SelectOption | null;
  date_from: DateObject | null;
  date_to: DateObject | null;
}

interface ActivityFiltersProps {
  onFilterChange: (filters: ApiFilters) => void;
}

export function ActivityFilters({
  onFilterChange,
}: ActivityFiltersProps) {

  // استیت‌های داخلی فیلتر
  const [employee, setEmployee] = useState<SelectOption | null>(null);
  const [dateFrom, setDateFrom] = useState<DateObject | null>(null);
  const [dateTo, setDateTo] = useState<DateObject | null>(null);

  // استیت جستجو
  const [employeeQuery, setEmployeeQuery] = useState('');

  // فراخوانی هوک جستجو
  const {
    data: searchResults,
    isLoading: isLoadingEmployees
  } = useEmployeeOptionsSearch(employeeQuery);


  const handleApplyFilters = () => {
    onFilterChange({
      employee: employee?.id === 'all' ? null : employee,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  // آماده‌سازی لیست گزینه‌ها
  const employeeOptionsToShow = useMemo(() => {
    const allOption: SelectOption = { id: 'all', name: 'همه کارمندان' };
    if (employeeQuery === '' && !searchResults) {
      return [allOption];
    }
    return [allOption, ...(searchResults || [])];
  }, [searchResults, employeeQuery]);


  return (
    <div className="py-4  rounded-2xl border mb-6
                    bg-white dark:bg-backgroundD
                    border-borderL dark:border-borderD
                    shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* هدر بخش فیلتر */}
      <div className="flex items-center gap-2 px-4 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="p-1.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg">
          <Filter className="w-4 h-4 text-primaryL dark:text-primaryD" />
        </div>
        <h3 className="font-bold text-sm text-foregroundL dark:text-foregroundD">
          فیلتر گزارش ها
        </h3>
      </div>

      {/* ✅ اصلاح چیدمان: در سایز lg (لپ‌تاپ) ۲ ستونه و در xl (مانیتور بزرگ) ۴ ستونه می‌شود تا فشرده نشود */}
      <div className="flex flex-col gap-3 items-center">

        {/* --- 1. انتخاب کارمند --- */}
        <div className="relative z-20">
          {/* اصلاح لیبل برای جلوگیری از شکستن خط */}
          <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">
            کارمند
          </label>
          <Combobox
            as="div"
            className="relative"
            value={employee}
            onChange={setEmployee}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User className="w-4 h-4 text-gray-400 group-focus-within:text-primaryL transition-colors" />
              </div>

              {/* کاهش ارتفاع به h-10 برای ظاهر جمع‌وجورتر */}
              <Combobox.Input
                className={` h-10 pr-9 pl-4 text-sm border rounded-lg bg-backgroundL-DEFAULT dark:bg-backgroundD-800 
                                    border-borderL dark:border-borderD 
                                    placeholder:text-gray-400 text-foregroundL dark:text-foregroundD
                                    focus:ring-2 focus:ring-primaryL/20 dark:focus:ring-primaryD/20 focus:border-primaryL dark:focus:border-primaryD
                                    transition-all duration-200 outline-none shadow-sm`}
                onChange={(event) => setEmployeeQuery(event.target.value)}
                displayValue={(opt: SelectOption) => opt?.name || ''}
                placeholder="نام کارمند..."
                autoComplete="off"
              />

              {/* <Combobox.Button className="absolute inset-y-0 left-0 flex items-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                {isLoadingEmployees ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primaryL" />
                ) : (
                  <ChevronsUpDown className="w-4 h-4" />
                )}
              </Combobox.Button> */}
            </div>

            <Combobox.Options className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl
                                            bg-white dark:bg-backgroundD-900 py-1 shadow-xl border border-gray-100 dark:border-gray-800
                                            focus:outline-none animate-in fade-in zoom-in-95 duration-100">
              {employeeOptionsToShow.length === 0 && employeeQuery.length > 1 && !isLoadingEmployees ? (
                <div className="relative cursor-default select-none py-3 px-4 text-xs text-center text-muted-foregroundL">
                  یافت نشد.
                </div>
              ) : (
                employeeOptionsToShow.map((opt) => (
                  <Combobox.Option
                    key={opt.id}
                    value={opt}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-2 pl-9 pr-3 text-xs transition-colors
                                    ${active ? 'bg-primaryL/5 text-primaryL dark:bg-primaryD/10 dark:text-primaryD' : 'text-foregroundL dark:text-foregroundD'}
                                    ${selected ? 'bg-primaryL/10 dark:bg-primaryD/20 font-medium' : ''}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {opt.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primaryL dark:text-primaryD">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Combobox>
        </div>

        {/* --- 2. تاریخ‌ها --- */}
        <div>
          <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">
            از تاریخ
          </label>
          <div className="h-10"> {/* اصلاح ارتفاع */}
            <PersianDatePickerInput
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="انتخاب..."
              label=""
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">
            تا تاریخ
          </label>
          <div className="h-10">
            <PersianDatePickerInput
              value={dateTo}
              onChange={setDateTo}
              placeholder="انتخاب..."
              label=""
            />
          </div>
        </div>

        {/* --- 3. دکمه اعمال --- */}
        <div>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="w-full h-10 flex items-center justify-center gap-2 px-4 
                        rounded-xl font-medium text-xs shadow-sm
                        bg-primaryL text-white
                        dark:bg-primaryD dark:text-primary-foregroundD
                        hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                        active:scale-[0.98]
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryL
                        transition-all duration-200"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>اعمال فیلتر</span>
          </button>
        </div>

      </div>
    </div>
  );
}