import React, { useState } from 'react';
import { WorkCalendarGrid } from '../components/WorkCalendarGrid';
import { HolidayType } from '../types';
import type { ActiveTool } from '../types';
// دریافت هوک دریافت داده‌ها در سطح صفحه برای مدیریت بهتر Bulk Action
import { useGetHolidays, useBulkCreateHolidays, useBulkDeleteHolidays } from '../hooks/useWorkCalendar';
import { getFridaysOfCurrentJalaliMonth, getFridaysInRange, getFridaysOfJalaliYear } from '../utils/calendarUtils';
import moment from 'jalali-moment';
import {
    CalendarCheck, Check, Eraser, Flag, Handshake, SquarePen, Zap, CalendarDays, ChevronDown, Trash2
} from 'lucide-react';

const YearPicker = ({ value, options, onChange }: any) => (
    <div className="relative w-full">
        <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-[42px] px-3 pr-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
            {options.map((opt: any) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
);

export const WorkCalendarPage = () => {
    const [selectedJalaliYear, setSelectedJalaliYear] = useState(1404);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTool, setActiveTool] = useState<ActiveTool>(HolidayType.OFFICIAL);

    // دریافت داده‌ها در سطح Page برای اشتراک‌گذاری بین Header و Grid
    const { data: holidayMap, isLoading } = useGetHolidays(selectedJalaliYear);

    return (
        <div className="container mx-auto px-4 py-6 max-w-[1600px] min-h-screen flex flex-col gap-6" style={{ direction: 'rtl' }}>
            <WorkCalendarHeader
                selectedYear={selectedJalaliYear}
                onYearChange={setSelectedJalaliYear}
                isEditing={isEditing}
                onIsEditingChange={setIsEditing}
                activeTool={activeTool}
                onActiveToolChange={setActiveTool}
                holidayMap={holidayMap} // ارسال نقشه تعطیلات برای فیلتر هوشمند حذف
            />
            <main className="flex-1 w-full animate-fadeIn">
                <WorkCalendarGrid
                    jalaliYear={selectedJalaliYear}
                    isEditing={isEditing}
                    activeTool={activeTool}
                    holidayMap={holidayMap} // ارسال داده‌ها به گرید
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
};

const WorkCalendarHeader: React.FC<any> = ({
    selectedYear,
    onYearChange,
    isEditing,
    onIsEditingChange,
    activeTool,
    onActiveToolChange,
    holidayMap
}) => {
    const bulkCreate = useBulkCreateHolidays();
    const bulkDelete = useBulkDeleteHolidays();
    const [bulkMode, setBulkMode] = useState<'add' | 'remove'>('add');

    const handleBulkFridays = (type: string) => {
        // ۱. تولید لیست جمعه‌های مورد نظر (به فرمت میلادی برای محاسبات)
        let targetGregorianDates: string[] = [];
        if (type === 'month') targetGregorianDates = getFridaysOfCurrentJalaliMonth();
        else if (type === '15') targetGregorianDates = getFridaysInRange(moment(), 15);
        else if (type === 'year') targetGregorianDates = getFridaysOfJalaliYear(selectedYear);

        if (targetGregorianDates.length === 0) return;

        if (bulkMode === 'add') {
            // ثبت دسته‌جمعی: ارسال تاریخ‌های میلادی
            bulkCreate.mutate(targetGregorianDates);
        } else {
            /**
             * ۲. فیلتر هوشمند برای جلوگیری از خطای 404:
             * فقط تاریخ‌هایی را برای حذف می‌فرستیم که در حال حاضر در holidayMap وجود دارند.
             */
            const existingJalaliDatesToDelete = targetGregorianDates
                .filter(gregDate => !!holidayMap?.[gregDate]) // فقط اگر در مپ موجود بود
                .map(gregDate => holidayMap[gregDate].date); // استخراج رشته تاریخ جلالی اصلی از دیتابیس

            if (existingJalaliDatesToDelete.length > 0) {
                bulkDelete.mutate(existingJalaliDatesToDelete);
            } else {
                // نمایش پیام یا لاگ در صورتی که هیچ جمعه‌ای برای حذف وجود نداشت
                console.log("هیچ موردی برای حذف در این بازه یافت نشد.");
            }
        }
    };

    return (
        <div className="sticky top-4 z-40 flex flex-col gap-4">
            <div className="bg-white  dark:bg-backgroundD rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white">تقویم کاری</h1>
                        <p className="text-xs text-slate-500">مدیریت هوشمند روزهای تعطیل</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-32">
                        <YearPicker
                            options={[{ id: 1403, name: "۱۴۰۳" }, { id: 1404, name: "۱۴۰۴" }, { id: 1405, name: "۱۴۰۵" }]}
                            value={selectedYear}
                            onChange={onYearChange}
                        />
                    </div>
                    <button
                        onClick={() => onIsEditingChange(!isEditing)}
                        className={`h-[42px] px-6 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-600 text-white shadow-blue-200'
                            }`}
                    >
                        {isEditing ? <><Check className="w-4 h-4" /> پایان ویرایش</> : <><SquarePen className="w-4 h-4" /> ویرایش تقویم</>}
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 xl:grid-cols-12 gap-4 transition-all duration-500 ease-in-out ${isEditing ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 invisible -translate-y-4'}`}>
                <div className="xl:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase whitespace-nowrap">ابزار دستی:</span>
                    <ToolButton isActive={activeTool === HolidayType.OFFICIAL} onClick={() => onActiveToolChange(HolidayType.OFFICIAL)} activeClass="bg-rose-500 text-white" Icon={Flag} label="رسمی" />
                    <ToolButton isActive={activeTool === HolidayType.AGREEMENT} onClick={() => onActiveToolChange(HolidayType.AGREEMENT)} activeClass="bg-amber-400 text-slate-900" Icon={Handshake} label="توافقی" />
                    <ToolButton isActive={activeTool === 'remove'} onClick={() => onActiveToolChange('remove')} activeClass="bg-slate-700 text-white" Icon={Eraser} label="پاک‌کن" />
                </div>

                <div className={`xl:col-span-7 rounded-xl p-2 flex items-center gap-2 shadow-lg transition-colors duration-300 ${bulkMode === 'add' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                    <div className="flex bg-black/20 rounded-lg p-1 shrink-0">
                        <button onClick={() => setBulkMode('add')} className={`p-1.5 rounded-md transition-all ${bulkMode === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60'}`}><Zap className="w-4 h-4" /></button>
                        <button onClick={() => setBulkMode('remove')} className={`p-1.5 rounded-md transition-all ${bulkMode === 'remove' ? 'bg-white text-rose-600 shadow-sm' : 'text-white/60'}`}><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <span className="text-[10px] font-bold text-white shrink-0 ml-1">
                        {bulkMode === 'add' ? 'ثبت جمعه‌ها:' : 'حذف جمعه‌ها:'}
                    </span>
                    <div className="flex gap-1 flex-1 overflow-x-auto no-scrollbar">
                        <QuickActionButton onClick={() => handleBulkFridays('month')} label="این ماه" />
                        <QuickActionButton onClick={() => handleBulkFridays('15')} label="۱۵ روز آینده" />
                        <QuickActionButton onClick={() => handleBulkFridays('year')} label={`کل سال ${selectedYear}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolButton = ({ isActive, onClick, activeClass, Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm ${isActive ? `${activeClass} scale-105` : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
    >
        <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
        {label}
    </button>
);

const QuickActionButton = ({ onClick, label }: any) => (
    <button
        onClick={onClick}
        className="flex-1 min-w-[100px] text-[10px] font-bold py-2 px-3 rounded-md transition-all border border-white/10 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white active:scale-95"
    >
        <CalendarDays className="w-3 h-3" />
        {label}
    </button>
);

export default WorkCalendarPage;