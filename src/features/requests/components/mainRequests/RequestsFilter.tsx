// src/features/requests/components/mainRequests/RequestsFilter.tsx

import { Filter, CirclePlus, Settings2 } from "lucide-react";
import { Link } from 'react-router-dom';

// کامپوننت‌های UI و تایپ‌ها
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import type { User } from '../../types';
// import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from "react-multi-date-picker";

interface RequestsFilterProps {
  currentUser: User | null;
  organization: SelectOption | null;
  onOrganizationChange: (value: SelectOption | null) => void;
  category: SelectOption | null;
  onCategoryChange: (value: SelectOption | null) => void;
  leaveType: SelectOption | null;
  onLeaveTypeChange: (value: SelectOption | null) => void;
  status: SelectOption | null;
  onStatusChange: (value: SelectOption | null) => void;
  date: DateObject | null;
  onDateChange: (value: DateObject | null) => void;
}

const mockStatuses: SelectOption[] = [
  { id: "pending", name: "در انتظار" },
  { id: "approved", name: "تایید شده" },
  { id: "rejected", name: "رد شده" },
];

const RequestsFilter = ({
  currentUser,
  status,
  onStatusChange,
  // date,
  // onDateChange,
}: RequestsFilterProps) => {

  // --- تعیین دسترسی‌ها ---
  const isSuperAdmin = currentUser?.roles?.includes('super_admin') ?? false;
  const canCreateRequest = !!currentUser && !isSuperAdmin;

  return (
    <div className="p-4 rounded-2xl border mb-6
                    bg-backgroundL-500 dark:bg-backgroundD
                    border-borderL dark:border-borderD
                    shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* --- هدر بخش فیلتر --- */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-borderL dark:border-borderD">
        <div className="p-1.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg">
          <Filter className="w-4 h-4 text-primaryL dark:text-primaryD" />
        </div>
        <h3 className="font-bold text-sm text-foregroundL dark:text-foregroundD">
          فیلتر درخواست‌ها
        </h3>
      </div>

      {/* --- کانتینر اصلی فیلترها و دکمه‌ها --- */}
      <div className="flex flex-col gap-3 flex-wrap items-center">

        {/* ۱. فیلتر وضعیت */}
        <div className="w-full md:w-48 lg:w-56">
          <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">
            وضعیت درخواست
          </label>
          <div className="h-10">
            <SelectBox
              label=""
              placeholder="همه وضعیت‌ها"
              options={mockStatuses}
              value={status || null}
              onChange={onStatusChange}
            // نکته: اطمینان حاصل کنید SelectBox شما از bg-backgroundL-500 استفاده می‌کند
            />
          </div>
        </div>

        {/* ۲. فیلتر تاریخ */}
        {/* <div className="">
          <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD mb-1.5 block px-1">
            تاریخ درخواست
          </label>
           <div className="h-10">
            <PersianDatePickerInput
              value={date}
              onChange={onDateChange}
              label=""
              placeholder="انتخاب تاریخ"
              inputClassName="h-10 text-sm bg-backgroundL-500 dark:bg-backgroundD text-foregroundL dark:text-foregroundD border-borderL dark:border-borderD"
              containerClassName="w-full"
            />
          </div> 
        </div> */}

        {/* ۳. دکمه‌های عملیات (ثبت درخواست و تنظیمات) */}
        <div className="w-full md:w-auto md:mr-auto flex gap-2 mt-2 md:mt-5">

          {canCreateRequest && (
            <Link
              to='/requests/new'
              className="flex-1 md:flex-none h-10 flex items-center justify-center gap-2 px-4 
                         rounded-xl font-medium text-xs shadow-sm whitespace-nowrap
                         bg-primaryL text-primary-foregroundL
                         dark:bg-primaryD dark:text-primary-foregroundD
                         hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                         transition-all duration-200"
            >
              <CirclePlus className="w-4 h-4" />
              <span>ثبت درخواست</span>
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              to='/requests/settings-table'
              className="flex-1  md:flex-none h-10 flex items-center justify-center gap-2 px-4 
                         rounded-xl font-medium text-xs shadow-sm whitespace-nowrap
                         bg-secondaryL text-secondary-foregroundL
                         dark:bg-secondaryD dark:text-secondary-foregroundD
                         hover:bg-secondaryL/80 dark:hover:bg-secondaryD/80
                         transition-all duration-200 border border-borderL/50 dark:border-borderD/50"
            >
              <Settings2 className="w-4 h-4" />
              <span>تنظیمات در خواست ها</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default RequestsFilter;