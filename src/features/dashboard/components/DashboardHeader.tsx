// src/features/dashboard/components/DashboardHeader.tsx

import React from "react";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { DateObject } from "react-multi-date-picker";
import clsx from "clsx";

type TimeFilter = "daily" | "weekly" | "monthly";

interface DashboardHeaderProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  selectedDate: DateObject | null;
  onDateChange: (date: DateObject | null) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeFilter,
  onFilterChange,
  selectedDate,
  onDateChange,
}) => {
  const filterButtons: { key: TimeFilter; label: string }[] = [
    { key: "daily", label: "امروز" },
    { key: "weekly", label: "هفتگی" },
    { key: "monthly", label: "ماهانه" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center transition-colors">
      <div className="flex items-center space-x-4 space-x-reverse">
        {/* دکمه‌های فیلتر */}
        <div className="bg-secondaryL dark:bg-secondaryD p-1 rounded-lg flex space-x-1 space-x-reverse">
          {filterButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => onFilterChange(button.key)}
              className={clsx(
                "px-4 py-1 text-sm font-semibold rounded-md transition-colors duration-200",
                {
                  "bg-backgroundL-500 text-primaryL dark:bg-primaryD dark:text-secondary-foregroundL shadow-sm":
                    activeFilter === button.key,
                  "text-secondary-foregroundL dark:text-muted-foregroundD hover:bg-borderL dark:hover:bg-borderD":
                    activeFilter !== button.key,
                }
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* انتخابگر تاریخ */}
      <div className="relative mt-4 md:mt-0 w-full md:w-auto min-w-[200px]">
        <PersianDatePickerInput
          label="" // لیبل خالی چون در هدر است
          value={selectedDate}
          onChange={onDateChange}
          placeholder="انتخاب تاریخ"
          containerClassName="w-full"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;