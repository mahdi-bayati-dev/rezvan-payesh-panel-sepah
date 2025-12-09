import React, { useState } from 'react';
import { useEditShiftScheduleForm } from '@/features/shift-schedule/hooks/useEditShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { ScheduleSlotRow } from '@/features/shift-schedule/components/ScheduleSlotRow';
import { GeneratedShiftsList } from '@/features/shift-schedule/components/GeneratedShiftsList';
import { GenerateShiftsForm } from '@/features/shift-schedule/components/GenerateShiftsForm';
// ❌ حذف Dialog ایمپورت شده، چون GenerateShiftsForm حالا خودش Modal دارد
// import { Dialog } from '@/components/ui/Dialog'; 
import { type AvailableWorkPattern } from '@/features/shift-schedule/types';
import { Controller, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import {
    Loader2, Save, CalendarOff, Settings2, ArrowRight,
    AlertTriangle, CheckCircle2, TimerReset, CalendarClock, Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import type { EditShiftScheduleFormData } from '../schema/EditShiftScheduleSchema';

const toPersianDigits = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return "";
    return n.toString().replace(/\d/g, (x) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(x)]);
};

type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;

interface EditShiftScheduleFormProps extends Omit<EditFormHookReturn, 'handleSubmit' | 'onSubmit'> {
    onCancel: () => void;
    availablePatterns: AvailableWorkPattern[];
    handleSubmit: UseFormReturn<EditShiftScheduleFormData>['handleSubmit'];
    onSubmit: SubmitHandler<EditShiftScheduleFormData>;
}

export const EditShiftScheduleForm: React.FC<EditShiftScheduleFormProps> = ({
    onCancel, initialSchedule, register, control, handleSubmit,
    formErrors, isPending, generalApiError, isDirty, onSubmit, availablePatterns,
}) => {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    if (!initialSchedule) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>{generalApiError || "برنامه شیفتی یافت نشد."}</AlertDescription>
                </Alert>
            </div>
        );
    }
    const slots = initialSchedule.slots || [];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8" dir="rtl">

            {/* --- هدر صفحه --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-borderL dark:border-gray-700 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foregroundL dark:text-foregroundD flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-500/10 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                            <Settings2 className="w-7 h-7" />
                        </div>
                        مدیریت برنامه شیفتی
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-2 mr-1 text-sm font-medium">
                        ویرایش چرخه کاری و تولید شیفت برای الگوی <span className="font-bold text-indigo-600 dark:text-indigo-400">«{initialSchedule.name}»</span>
                    </p>
                </div>

                {/* دکمه‌های هدر */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="hidden md:flex flex-col items-end text-sm text-muted-foregroundL dark:text-muted-foregroundD px-4 border-l border-borderL dark:border-gray-700">
                        <span>طول چرخه</span>
                        <span className="font-bold text-lg text-foregroundL dark:text-foregroundD">{toPersianDigits(initialSchedule.cycle_length_days)} روز</span>
                    </div>

                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="gap-2 bg-transparent dark:bg-transparent dark:text-gray-300 dark:hover:text-white hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:border-gray-600 dark:hover:border-red-800 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        بازگشت
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

                {/* --- ستون اصلی (چپ) --- */}
                <div className="xl:col-span-3 space-y-8">

                    {/* کارت اسلات‌ها */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-gray-700/50 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-borderL dark:border-gray-700/50 bg-secondaryL/10 dark:bg-gray-900/30 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">ساختار چرخه کاری</h2>
                            </div>
                            <span className="text-xs bg-white dark:bg-gray-900/50 border border-borderL dark:border-gray-700 px-2.5 py-1 rounded-full text-muted-foregroundL dark:text-muted-foregroundD">
                                {toPersianDigits(slots.length)} روز تعریف شده
                            </span>
                        </div>

                        <div className="p-0">
                            {slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                        <CalendarOff className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">هنوز اسلاتی تعریف نشده است.</span>
                                    <p className="text-gray-400 text-sm mt-1">برای شروع، لطفاً یک برنامه جدید ایجاد کنید.</p>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto">
                                    <div className="min-w-[800px]">
                                        {/* هدر جدول */}
                                        <div className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] py-3 px-4 bg-gray-50/80 dark:bg-gray-900/50 text-xs font-bold text-muted-foregroundL dark:text-muted-foregroundD border-b border-borderL dark:border-gray-700/50">
                                            <div className="text-center">روز چرخه</div>
                                            <div className="pr-4">الگوی کاری</div>
                                            <div className="text-center">ساعت شروع</div>
                                            <div className="text-center">ساعت پایان</div>
                                            <div className="text-center">وضعیت / مدت</div>
                                            <div className="text-center">عملیات</div>
                                        </div>

                                        {/* لیست اسلات‌ها */}
                                        <div className="divide-y divide-borderL/60 dark:divide-gray-700/30">
                                            {slots.map((slot) => (
                                                <div key={slot.id} className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] items-stretch hover:bg-secondaryL/5 dark:hover:bg-indigo-900/10 transition-colors group">
                                                    <ScheduleSlotRow slot={slot} shiftScheduleId={initialSchedule.id} availablePatterns={availablePatterns} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* لیست شیفت‌های تولید شده */}
                    <GeneratedShiftsList shiftScheduleId={initialSchedule.id} />
                </div>

                {/* --- سایدبار تنظیمات (راست) --- */}
                <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-6 h-fit">

                    {/* کارت تنظیمات */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-gray-700/50 rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-borderL dark:border-gray-700/50 bg-gradient-to-l from-primaryL/5 to-transparent dark:from-indigo-900/10">
                            <h2 className="font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-primaryL dark:text-indigo-400" />
                                تنظیمات عمومی
                            </h2>
                        </div>

                        <div className="p-5 space-y-5">
                            {generalApiError && !generalApiError.includes("بارگذاری") && (
                                <Alert variant="destructive" className="py-2 text-xs"><AlertDescription>{generalApiError}</AlertDescription></Alert>
                            )}

                            <div className="space-y-4">
                                <div className="[&_input]:bg-white [&_input]:dark:bg-gray-900/50 [&_input]:dark:border-gray-600 [&_input]:dark:text-gray-100">
                                    <Input label="عنوان برنامه" {...register('name')} error={formErrors.name?.message} disabled={isPending} className="font-medium" />
                                </div>

                                <div className="[&_input]:bg-white [&_input]:dark:bg-gray-900/50 [&_input]:dark:border-gray-600 [&_input]:dark:text-gray-100">
                                    <Controller
                                        name="cycle_start_date"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <PersianDatePickerInput
                                                label="مبدا تاریخ چرخه"
                                                error={error?.message}
                                                value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                                onChange={(d) => field.onChange(d ? d.convert(gregorian, gregorian_en).format("YYYY-MM-DD") : "")}
                                            />
                                        )}
                                    />
                                </div>

                                {/* وضعیت تعطیلات */}
                                <div className={clsx(
                                    "flex items-start gap-3 rounded-xl p-3 text-sm border transition-all",
                                    initialSchedule.ignore_holidays
                                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                                )}>
                                    {initialSchedule.ignore_holidays
                                        ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                        : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                    }
                                    <div>
                                        <span className="font-bold block mb-1">
                                            {initialSchedule.ignore_holidays ? "نادیده گرفتن تعطیلات" : "رعایت تعطیلات رسمی"}
                                        </span>
                                        <span className="text-xs opacity-80 leading-relaxed block">
                                            {initialSchedule.ignore_holidays
                                                ? "شیفت‌ها بدون توجه به تقویم تعطیلات اعمال می‌شوند."
                                                : "روزهای تعطیل رسمی به عنوان روز آف (Off) خواهند بود."}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* تنظیمات شناوری */}
                            <div className="bg-secondaryL/30 dark:bg-gray-900/30 rounded-xl p-4 border border-borderL/50 dark:border-gray-700/50 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foregroundL dark:text-muted-foregroundD uppercase tracking-wider">
                                    <TimerReset className="w-4 h-4" />
                                    آستانه شناوری (دقیقه)
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-muted-foregroundL dark:text-muted-foregroundD text-center block">ورود</label>
                                        <Input
                                            type="number"
                                            {...register('floating_start')}
                                            disabled={isPending}
                                            className="text-center font-bold bg-white dark:bg-gray-800 border-borderL dark:border-gray-600 dark:text-gray-100"
                                            min={0}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-muted-foregroundL dark:text-muted-foregroundD text-center block">خروج</label>
                                        <Input
                                            type="number"
                                            {...register('floating_end')}
                                            disabled={isPending}
                                            className="text-center font-bold bg-white dark:bg-gray-800 border-borderL dark:border-gray-600 dark:text-gray-100"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-borderL dark:border-gray-700/50 space-y-3">
                            <Button type="submit" className="w-full font-bold shadow-md shadow-primaryL/20 dark:shadow-none bg-primaryL hover:bg-primaryL/90 dark:bg-indigo-600 dark:hover:bg-indigo-500" disabled={!isDirty || isPending}>
                                {isPending ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                                ذخیره تغییرات
                            </Button>
                            <Button type="button" variant="outline" className="w-full border-dashed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" onClick={onCancel}>
                                <ArrowRight className="ml-2 h-4 w-4" /> بازگشت به لیست
                            </Button>
                        </div>
                    </form>

                    {/* کارت عملیات ویژه (تولید شیفت) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800/60 dark:to-backgroundD border border-indigo-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm text-center space-y-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-indigo-200 dark:border-indigo-500/20">
                            <CalendarClock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900 dark:text-gray-100">تولید خودکار شیفت ها</h3>
                            <p className="text-xs text-indigo-600/70 dark:text-gray-400 mt-1">
                                اعمال این چرخه برای کارمندان در یک بازه زمانی خاص
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            تولید و زمان‌بندی شیفت‌ها
                        </Button>
                    </div>

                </div>
            </div>

            {/* مودال تولید شیفت */}
            {/* ✅ فقط کامپوننت رندر می‌شود، isOpen به آن پاس داده می‌شود */}
            <GenerateShiftsForm
                isOpen={isGenerateModalOpen}
                shiftScheduleId={initialSchedule.id}
                shiftScheduleName={initialSchedule.name}
                onClose={() => setIsGenerateModalOpen(false)}
            />
        </div>
    );
};