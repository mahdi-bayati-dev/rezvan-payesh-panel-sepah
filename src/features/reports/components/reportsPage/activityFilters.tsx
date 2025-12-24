/* reports/components/reportsPage/activityFilters.tsx */
import { useState, useMemo, Fragment } from "react";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { Filter, Check, User, SlidersHorizontal, X } from "lucide-react";
import { useEmployeeOptionsSearch } from "../../hooks/hook";
import { type SelectOption } from "../../../../components/ui/SelectBox";
import PersianDatePickerInput from "../../../../lib/PersianDatePickerInput";
import { type DateObject } from 'react-multi-date-picker';

export interface ApiFilters {
  employee: SelectOption | null;
  date_from: DateObject | null;
  date_to: DateObject | null;
}

interface ActivityFiltersProps {
  onFilterChange: (filters: ApiFilters) => void;
}

export function ActivityFilters({ onFilterChange }: ActivityFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState<SelectOption | null>(null);
  const [dateFrom, setDateFrom] = useState<DateObject | null>(null);
  const [dateTo, setDateTo] = useState<DateObject | null>(null);
  const [employeeQuery, setEmployeeQuery] = useState('');

  // ✅ تغییر: isLoadingEmployees حذف شد چون در JSX استفاده نشده بود
  const { data: searchResults } = useEmployeeOptionsSearch(employeeQuery);

  const handleApplyFilters = () => {
    onFilterChange({
      employee: employee?.id === 'all' ? null : employee,
      date_from: dateFrom,
      date_to: dateTo,
    });
    setIsOpen(false);
  };

  const employeeOptionsToShow = useMemo(() => {
    const allOption: SelectOption = { id: 'all', name: 'همه سربازان' };
    if (employeeQuery === '' && !searchResults) return [allOption];
    return [allOption, ...(searchResults || [])];
  }, [searchResults, employeeQuery]);

  const renderFilterContent = () => (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex items-center justify-between pb-3 border-b border-borderL dark:border-borderD">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg">
            <Filter className="w-4 h-4 text-primaryL dark:text-primaryD" />
          </div>
          <h3 className="font-bold text-sm text-foregroundL dark:text-foregroundD">فیلتر گزارش‌ها</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-muted-foregroundL hover:text-foregroundL transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="text-xs font-bold text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">سرباز</label>
          <Combobox as="div" className="relative w-full" value={employee} onChange={setEmployee}>
            <div className="relative group w-full">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User className="w-4 h-4 text-muted-foregroundL group-focus-within:text-primaryL transition-colors" />
              </div>
              <Combobox.Input
                className="w-full h-11 pr-9 pl-4 text-sm border rounded-xl bg-backgroundL-500 dark:bg-backgroundD border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD focus:ring-2 focus:ring-primaryL/20 focus:border-primaryL outline-none transition-all"
                onChange={(event) => setEmployeeQuery(event.target.value)}
                displayValue={(opt: SelectOption) => opt?.name || ''}
                placeholder="جستجوی نام..."
                autoComplete="off"
              />
            </div>
            <Combobox.Options className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl bg-backgroundL-500 dark:bg-backgroundD py-1 shadow-xl border border-borderL dark:border-borderD animate-in fade-in zoom-in-95 duration-100">
              {employeeOptionsToShow.map((opt) => (
                <Combobox.Option
                  key={opt.id}
                  value={opt}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2.5 pl-9 pr-3 text-xs transition-colors
                            ${active ? 'bg-primaryL/5 text-primaryL dark:bg-primaryD/10' : 'text-foregroundL dark:text-foregroundD'}
                            ${selected ? 'bg-primaryL/10 font-medium' : ''}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.name}</span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primaryL">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>

        <PersianDatePickerInput
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="از تاریخ..."
          label="تاریخ شروع"
          inputClassName="h-11"
        />
        <PersianDatePickerInput
          value={dateTo}
          onChange={setDateTo}
          placeholder="تا تاریخ..."
          label="تاریخ پایان"
          inputClassName="h-11"
        />
      </div>

      <button
        type="button"
        onClick={handleApplyFilters}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-md bg-primaryL text-white dark:bg-primaryD dark:text-black hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <Filter className="w-4 h-4" />
        <span>اعمال فیلتر</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="md:hidden flex justify-end mb-4">
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD text-foregroundL dark:text-foregroundD shadow-sm">
          <SlidersHorizontal size={18} className="text-primaryL dark:text-primaryD" />
          <span>فیلتر و جستجو</span>
        </button>
      </div>

      <aside className="hidden md:block w-full p-4 rounded-2xl border bg-backgroundL-500 dark:bg-backgroundD border-borderL dark:border-borderD shadow-sm">
        {renderFilterContent()}
      </aside>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-[60] md:hidden">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child as={Fragment} enter="transform transition ease-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in duration-200" leaveFrom="translate-x-0" leaveTo="translate-x-full">
              <Dialog.Panel className="w-screen max-w-xs bg-backgroundL-500 dark:bg-backgroundD p-5 shadow-2xl flex flex-col">
                {renderFilterContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}