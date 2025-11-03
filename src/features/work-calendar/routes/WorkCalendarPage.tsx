import React, { useState } from 'react';
import { WorkCalendarGrid } from '../components/WorkCalendarGrid';
import { HolidayType } from '../types';
import type { ActiveTool } from '../types/index';

// --- اصلاحیه ۱: ایمپورت کردن SelectBox و تایپ آن ---
// مسیر ایمپورت را بر اساس ساختار پروژه خودتان تنظیم کنید
import SelectBox from '@/components/ui/SelectBox';
import type { SelectOption } from '@/components/ui/SelectBox';
// --- پایان اصلاحیه ۱ ---

export const WorkCalendarPage = () => {

    const [selectedJalaliYear, setSelectedJalaliYear] = useState(1404);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTool, setActiveTool] = useState<ActiveTool>(HolidayType.OFFICIAL);

    return (
        <div className=" max-w-full mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-foregroundL dark:text-foregroundD">تقویم کاری</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-4">
                    <WorkCalendarGrid
                        jalaliYear={selectedJalaliYear}
                        isEditing={isEditing}
                        activeTool={activeTool}
                    />
                </div>
                <aside className="lg:col-span-1">
                    <WorkCalendarSidebar
                        selectedYear={selectedJalaliYear}
                        onYearChange={setSelectedJalaliYear}
                        isEditing={isEditing}
                        onIsEditingChange={setIsEditing}
                        activeTool={activeTool}
                        onActiveToolChange={setActiveTool}
                    />
                </aside>
            </div>
        </div>
    );
};


/**
 * کامپوننت سایدبار (اکنون دکمه‌های ویرایش را هم دارد)
 */
const WorkCalendarSidebar: React.FC<{
    selectedYear: number;
    onYearChange: (year: number) => void;
    isEditing: boolean;
    onIsEditingChange: (isEditing: boolean) => void;
    activeTool: ActiveTool;
    onActiveToolChange: (tool: ActiveTool) => void;
}> = ({
    selectedYear,
    onYearChange,
    isEditing,
    onIsEditingChange,
    activeTool,
    onActiveToolChange
}) => {

        // --- اصلاحیه ۲: تعریف گزینه‌ها برای SelectBox ---
        const yearOptions: SelectOption[] = [
            { id: 1403, name: "1403" },
            { id: 1404, name: "1404" },
            { id: 1405, name: "1405" },
        ];

        // --- اصلاحیه ۳: پیدا کردن آبجکت 'value' بر اساس 'state' (که یک عدد است) ---
        const selectedYearOption = yearOptions.find(opt => opt.id === selectedYear) || null;

        // --- اصلاحیه ۴: مدیریت 'onChange' که یک آبجکت برمی‌گرداند ---
        const handleYearChange = (option: SelectOption) => {
            onYearChange(Number(option.id));
        };
        // --- پایان اصلاحیه‌ها ---

        return (
            <div className="bg-backgroundL-500 p-4 rounded-lg border border-borderL sticky top-4 shadow-sm transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                <h3 className="text-lg font-semibold mb-4 border-b border-borderL pb-2 text-foregroundL dark:text-foregroundD">ویرایش تقویم</h3>

                {/* --- اصلاحیه ۵: جایگزینی select با SelectBox --- */}
                <div className="mb-4">
                    <SelectBox
                        label="سال تقویم"
                        placeholder="انتخاب سال..."
                        options={yearOptions}
                        value={selectedYearOption}
                        onChange={handleYearChange}
                    />
                </div>
                {/* --- پایان اصلاحیه ۵ --- */}

                {/* دکمه‌های ویرایش */}
                <div className="border-t border-borderL pt-4 mt-4 dark:border-borderD">
                    <button
                        onClick={() => onIsEditingChange(!isEditing)}
                        className="w-full bg-blue text-primary-foregroundL px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all mb-4"
                    >
                        {isEditing ? 'اتمام ویرایش' : 'ویرایش'}
                    </button>

                    {/* گروه ابزارها */}
                    <div className={`flex flex-col gap-2 ${!isEditing ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                        <button
                            disabled={!isEditing}
                            onClick={() => onActiveToolChange(HolidayType.OFFICIAL)}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTool === HolidayType.OFFICIAL
                                    ? 'bg-destructiveL text-white shadow-md'
                                    : 'bg-secondaryL text-secondary-foregroundL hover:bg-borderL dark:bg-secondaryD dark:text-secondary-foregroundD dark:hover:bg-borderD'
                                }`}
                        >
                            رسمی
                        </button>
                        <button
                            disabled={!isEditing}
                            onClick={() => onActiveToolChange(HolidayType.AGREEMENT)}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTool === HolidayType.AGREEMENT
                                    ? 'bg-yellow-400 text-black shadow-md'
                                    : 'bg-secondaryL text-secondary-foregroundL hover:bg-borderL dark:bg-secondaryD dark:text-secondary-foregroundD dark:hover:bg-borderD'
                                }`}
                        >
                            توافقی
                        </button>
                        <button
                            disabled={!isEditing}
                            onClick={() => onActiveToolChange('remove')}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTool === 'remove'
                                    ? 'bg-destructiveL text-white shadow-md'
                                    : 'bg-destructiveL-background text-destructiveL-foreground dark:bg-destructiveD-background dark:text-destructiveD-foreground hover:bg-destructiveL/20'
                                }`}
                        >
                            پاک کردن
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export default WorkCalendarPage;

