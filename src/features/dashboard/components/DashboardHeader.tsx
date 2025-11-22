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
  
  // قابلیت‌های کنترلی جدید
  hideFilters?: boolean;      // مخفی کردن دکمه‌های فیلتر
  hideDatePicker?: boolean;   // مخفی کردن انتخابگر تاریخ
  infoLabel?: string;         // متنی که وقتی فیلترها مخفی هستند نمایش داده می‌شود
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeFilter,
  onFilterChange,
  selectedDate,
  onDateChange,
  hideFilters = false,
  hideDatePicker = false, // پیش‌فرض نمایش داده می‌شود مگر اینکه true بفرستیم
  infoLabel,
}) => {
  const filterButtons: { key: TimeFilter; label: string }[] = [
    { key: "daily", label: "امروز" },
    { key: "weekly", label: "هفتگی" },
    { key: "monthly", label: "ماهانه" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center transition-colors min-h-[42px]">
      <div className="flex items-center space-x-4 space-x-reverse w-full md:w-auto">
        {/* رندر شرطی: دکمه‌ها یا متن اطلاع‌رسانی */}
        {!hideFilters ? (
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
        ) : (
          /* نمایش متن وضعیت (وقتی فیلترها مخفی هستند) */
          <div className="bg-secondaryL/30 dark:bg-secondaryD/30 px-3 py-1.5 rounded-lg border border-secondaryL dark:border-secondaryD/50 w-full md:w-auto text-center md:text-right">
            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {infoLabel || "گزارش وضعیت"}
            </span>
          </div>
        )}
      </div>

      {/* انتخابگر تاریخ (فقط اگر مخفی نباشد رندر می‌شود) */}
      {!hideDatePicker && (
        <div className="relative mt-4 md:mt-0 w-full md:w-auto min-w-[200px]">
          <PersianDatePickerInput
            label=""
            value={selectedDate}
            onChange={onDateChange}
            placeholder="انتخاب تاریخ"
            containerClassName="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;