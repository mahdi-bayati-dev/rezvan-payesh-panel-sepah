import React, { useState, useMemo } from 'react';
import { WorkCalendarGrid } from '../components/WorkCalendarGrid';
import { HolidayType } from '../types';
import type { ActiveTool } from '../types';
import { useGetHolidays, useBulkCreateHolidays, useBulkDeleteHolidays } from '../hooks/useWorkCalendar';
import { getFridaysOfCurrentJalaliMonth, getFridaysInRange, getFridaysOfJalaliYear } from '../utils/calendarUtils';
import moment from 'jalali-moment';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUserRoles } from '@/store/slices/authSlice';
// ✅ ایمپورت کامپوننت سلکت باکس سفارشی و تایپ آن
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import {
    CalendarCheck, Check, Eraser, Flag, Handshake, SquarePen, Zap, CalendarDays, Trash2
} from 'lucide-react';

export const WorkCalendarPage = () => {
    const currentJalaliYear = moment().jYear();

    const userRoles = useAppSelector(selectUserRoles);
    const isSuperAdmin = useMemo(() => userRoles.includes('super_admin'), [userRoles]);

    const [selectedJalaliYear, setSelectedJalaliYear] = useState(currentJalaliYear);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTool, setActiveTool] = useState<ActiveTool>(HolidayType.OFFICIAL);

    // تولید لیست سال‌ها برای گزینه‌های سلکت باکس
    const yearOptions: SelectOption[] = useMemo(() => {
        const years = [];
        for (let year = 1403; year <= 1410; year++) {
            years.push({ id: year, name: year.toString() });
        }
        return years;
    }, []);

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
                holidayMap={holidayMap}
                yearOptions={yearOptions}
                canEdit={isSuperAdmin}
            />
            <main className="flex-1 w-full animate-fadeIn">
                <WorkCalendarGrid
                    jalaliYear={selectedJalaliYear}
                    isEditing={isEditing && isSuperAdmin}
                    activeTool={activeTool}
                    holidayMap={holidayMap}
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
    holidayMap,
    yearOptions,
    canEdit
}) => {
    const bulkCreate = useBulkCreateHolidays();
    const bulkDelete = useBulkDeleteHolidays();
    const [bulkMode, setBulkMode] = useState<'add' | 'remove'>('add');

    // پیدا کردن آپشن انتخاب شده فعلی برای پاس دادن به SelectBox
    const currentYearOption = useMemo(() =>
        yearOptions.find((opt: SelectOption) => opt.id === selectedYear) || null
        , [selectedYear, yearOptions]);

    const handleBulkFridays = (type: string) => {
        if (!canEdit) return;

        let targetGregorianDates: string[] = [];
        if (type === 'month') targetGregorianDates = getFridaysOfCurrentJalaliMonth();
        else if (type === '15') targetGregorianDates = getFridaysInRange(moment(), 15);
        else if (type === 'year') targetGregorianDates = getFridaysOfJalaliYear(selectedYear);

        if (targetGregorianDates.length === 0) return;

        if (bulkMode === 'add') {
            bulkCreate.mutate(targetGregorianDates);
        } else {
            const existingJalaliDatesToDelete = targetGregorianDates
                .filter(gregDate => !!holidayMap?.[gregDate])
                .map(gregDate => holidayMap[gregDate].date);

            if (existingJalaliDatesToDelete.length > 0) {
                bulkDelete.mutate(existingJalaliDatesToDelete);
            }
        }
    };

    return (
        <div className="sticky top-4 z-40 flex flex-col gap-4">
            <div className="bg-white dark:bg-backgroundD rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    {/* ✅ استفاده از کامپوننت SelectBox سفارشی پروژه */}
                    <div className="w-40">
                        <SelectBox
                            label=""
                            placeholder="انتخاب سال"
                            options={yearOptions}
                            value={currentYearOption}
                            onChange={(option: SelectOption) => onYearChange(Number(option.id))}
                            className="text-right"
                        />
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => onIsEditingChange(!isEditing)}
                            className={`h-[42px] px-6 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-600 text-white shadow-blue-200'
                                }`}
                        >
                            {isEditing ? <><Check className="w-4 h-4" /> پایان ویرایش</> : <><SquarePen className="w-4 h-4" /> ویرایش تقویم</>}
                        </button>
                    )}
                </div>
            </div>

            {canEdit && (
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
            )}
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