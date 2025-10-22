import { useState } from "react";
import { Filter, Plus } from "lucide-react";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import {
  activityTypeOptions,
  trafficAreaOptions,
} from "@/features/reports/data/mockData";

interface ActivityFiltersProps {
  onFilterChange: (filters: {
    activityType: SelectOption | null;
    trafficArea: SelectOption | null;
  }) => void;
}

export function ActivityFilters({ onFilterChange }: ActivityFiltersProps) {
  const [activityType, setActivityType] = useState<SelectOption | null>(
    activityTypeOptions[0]
  );
  const [trafficArea, setTrafficArea] = useState<SelectOption | null>(
    trafficAreaOptions[0]
  );

  const handleActivityChange = (value: SelectOption) => {
    setActivityType(value);
    onFilterChange({ activityType: value, trafficArea });
  };

  const handleAreaChange = (value: SelectOption) => {
    setTrafficArea(value);
    onFilterChange({ activityType, trafficArea: value });
  };

  const handleAddActivity = () => {
    console.log("Add new activity clicked");
  };

  return (
    <div
      className="p-5 rounded-2xl border mb-5
                 bg-backgroundL-500 dark:bg-backgroundD
                 border-borderL dark:border-borderD
                 shadow-sm transition-colors duration-300 space-y-6"
    >
      {/* عنوان بخش فیلتر */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-primaryL dark:text-primaryD" />
        <h3 className="font-semibold text-foregroundL dark:text-foregroundD">
          فیلتر فعالیت‌ها
        </h3>
      </div>

      {/* انتخاب‌گرها */}
      <div className="flex flex-col gap-4">
        <SelectBox
          label="نوع فعالیت"
          placeholder="انتخاب کنید"
          options={activityTypeOptions}
          value={activityType}
          onChange={handleActivityChange}
        />
        <SelectBox
          label="ناحیه تردد"
          placeholder="انتخاب کنید"
          options={trafficAreaOptions}
          value={trafficArea}
          onChange={handleAreaChange}
        />
      </div>

      {/* دکمه خروجی */}
      <button
        type="button"
        onClick={handleAddActivity}
        className="w-full flex items-center justify-center gap-2 px-6 py-2.5
                   rounded-xl font-medium shadow-md
                   bg-primaryL text-primary-foregroundL
                   dark:bg-primaryD dark:text-primary-foregroundD
                   hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-primaryL dark:focus:ring-primaryD
                   transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        <span>خروجی</span>
      </button>
    </div>
  );
}
