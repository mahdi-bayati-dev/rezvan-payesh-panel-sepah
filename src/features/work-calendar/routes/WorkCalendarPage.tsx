import React, { useState } from 'react';
import { WorkCalendarGrid } from '../components/WorkCalendarGrid';
import { HolidayType } from '../types';
import type { ActiveTool } from '../types/index';
import SelectBox from '@/components/ui/SelectBox';
import type { SelectOption } from '@/components/ui/SelectBox';
// import { toPersianDigits } from '@/features/work-calendar/utils/numberUtils';

// --- ایمپورت آیکون‌های Lucide ---
import {
    CalendarCheck,
    Check,
    Eraser,
    Flag,
    Handshake,
    SquarePen,
    // LucideIcon
} from 'lucide-react';

export const WorkCalendarPage = () => {
    const [selectedJalaliYear, setSelectedJalaliYear] = useState(1404);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTool, setActiveTool] = useState<ActiveTool>(HolidayType.OFFICIAL);

    return (
        <div className="container mx-auto px-4 py-6 max-w-[1600px] min-h-screen flex flex-col gap-6">

            {/* هدر و نوار ابزار یکپارچه */}
            <WorkCalendarHeader
                selectedYear={selectedJalaliYear}
                onYearChange={setSelectedJalaliYear}
                isEditing={isEditing}
                onIsEditingChange={setIsEditing}
                activeTool={activeTool}
                onActiveToolChange={setActiveTool}
            />

            {/* محتوای اصلی - گرید تقویم */}
            <main className="flex-1 w-full animate-fadeIn">
                <WorkCalendarGrid
                    jalaliYear={selectedJalaliYear}
                    isEditing={isEditing}
                    activeTool={activeTool}
                />
            </main>
        </div>
    );
};

// --- کامپوننت نوار ابزار (Header & Toolbar) ---
const WorkCalendarHeader: React.FC<{
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
        const yearOptions: SelectOption[] = [
            { id: 1403, name: "۱۴۰۳" },
            { id: 1404, name: "۱۴۰۴" },
            { id: 1405, name: "۱۴۰۵" },
        ];

        const selectedYearOption = yearOptions.find(opt => opt.id === selectedYear) || null;

        return (
            <div className="sticky top-4 z-40 flex flex-col gap-4">

                {/* بخش ۱: عنوان و سال (همیشه ثابت) */}
                <div className="bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-borderL dark:border-borderD shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            {/* آیکون تقویم */}
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-foregroundL dark:text-foregroundD tracking-tight">
                                تقویم کاری
                            </h1>
                            <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5">
                                مدیریت شیفت‌ها و تعطیلات
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* انتخابگر سال */}
                        <div className="w-32">
                            <SelectBox
                                label=""
                                placeholder="سال"
                                options={yearOptions}
                                value={selectedYearOption}
                                onChange={(opt) => onYearChange(Number(opt.id))}
                            />
                        </div>

                        {/* دکمه اصلی ویرایش */}
                        <button
                            onClick={() => onIsEditingChange(!isEditing)}
                            className={`
                            flex-1 md:flex-none h-[42px] px-6 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
                            ${isEditing
                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                                    : 'bg-primary text-primary-foregroundL shadow-lg shadow-primary/20 hover:scale-105'
                                }
                        `}
                        >
                            {isEditing ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>پایان ویرایش</span>
                                </>
                            ) : (
                                <>
                                    <SquarePen className="w-4 h-4 text-infoD-background  dark:text-infoD-foreground" />
                                    <span className='text-infoD-background dark:text-infoD-foreground'>ویرایش تقویم</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* بخش ۲: پالت ابزار (فقط در حالت ویرایش ظاهر می‌شود) */}
                <div className={`
                overflow-hidden transition-all duration-500 ease-in-out bg-backgroundL-500 dark:bg-backgroundD rounded-lg
                ${isEditing ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
            `}>
                    <div className="bg-cardL/90 backdrop-blur-md dark:bg-cardD/90 rounded-xl border border-blue-500/30 p-2 shadow-lg flex items-center justify-center md:justify-start gap-2 overflow-x-auto">
                        <span className="text-xs font-bold text-muted-foregroundL dark:text-backgroundL-500 ml-2 hidden md:block whitespace-nowrap px-2">
                            ابزار انتخاب:
                        </span>

                        {/* پاس دادن کامپوننت آیکون به جای استرینگ */}
                        <ToolButton
                            isActive={activeTool === HolidayType.OFFICIAL}
                            onClick={() => onActiveToolChange(HolidayType.OFFICIAL)}
                            activeClass="bg-rose-500 text-white shadow-rose-500/30"
                            Icon={Flag}
                            label="تعطیلی رسمی"
                        />

                        <ToolButton
                            isActive={activeTool === HolidayType.AGREEMENT}
                            onClick={() => onActiveToolChange(HolidayType.AGREEMENT)}
                            activeClass="bg-amber-400 text-amber-950 shadow-amber-400/30"
                            Icon={Handshake}
                            label="تعطیلی توافقی"
                        />

                        <div className="w-px h-6 bg-borderL dark:bg-borderD mx-1" /> {/* خط جداکننده */}

                        <ToolButton
                            isActive={activeTool === 'remove'}
                            onClick={() => onActiveToolChange('remove')}
                            activeClass="bg-slate-600 text-white shadow-slate-600/30"
                            Icon={Eraser}
                            label="پاک کردن"
                        />
                    </div>
                </div>
            </div>
        );
    };

// --- تعریف تایپ پراپ‌های دکمه ابزار ---
interface ToolButtonProps {
    isActive: boolean;
    onClick: () => void;
    activeClass: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // تایپ صحیح برای کامپوننت آیکون
    label: string;
}

// کامپوننت دکمه ابزار (آپدیت شده برای دریافت کامپوننت Icon)
const ToolButton: React.FC<ToolButtonProps> = ({ isActive, onClick, activeClass, Icon, label }) => (
    <button
        onClick={onClick}
        className={`
            relative cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 md:flex-none justify-center dark:text-backgroundL-500
            ${isActive
                ? `${activeClass} shadow-md scale-100 ring-2 ring-white dark:ring-black ring-offset-0`
                : 'bg-secondaryL dark:bg-secondaryD text-secondary-foregroundL hover:bg-secondaryL/80'
            }
        `}
    >
        {/* رندر کردن کامپوننت آیکون دریافتی */}
        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
        <span>{label}</span>
    </button>
);

export default WorkCalendarPage;