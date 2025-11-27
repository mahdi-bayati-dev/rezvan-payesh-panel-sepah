import React from 'react';
import { useEditShiftScheduleForm } from '@/features/shift-schedule/hooks/useEditShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { ScheduleSlotRow } from '@/features/shift-schedule/components/ScheduleSlotRow';
import { GeneratedShiftsList } from '@/features/shift-schedule/components/GeneratedShiftsList';
import { type WorkPatternBase } from '@/features/shift-schedule/types';
import { Controller, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import {
    Loader2, Save, CalendarOff, FilePenLine, RefreshCw, ArrowLeft,
    AlertTriangle, CheckCircle2, TimerReset, Settings2
} from 'lucide-react';
import clsx from 'clsx';
import type { EditShiftScheduleFormData } from '../schema/EditShiftScheduleSchema';

// --- تابع تبدیل اعداد به فارسی ---
const toPersianDigits = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return "";
    return n.toString().replace(/\d/g, (x) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(x)]);
};

type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;

interface EditShiftScheduleFormProps extends Omit<EditFormHookReturn, 'handleSubmit' | 'onSubmit'> {
    onCancel: () => void;
    availablePatterns: WorkPatternBase[];
    handleSubmit: UseFormReturn<EditShiftScheduleFormData>['handleSubmit'];
    onSubmit: SubmitHandler<EditShiftScheduleFormData>;
}

export const EditShiftScheduleForm: React.FC<EditShiftScheduleFormProps> = ({
    onCancel, initialSchedule, register, control, handleSubmit,
    formErrors, isPending, generalApiError, isDirty, onSubmit, availablePatterns,
}) => {

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
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- ستون چپ (اسلات‌ها و لیست شیفت) --- */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD flex items-center gap-3">
                                <span className="bg-primaryL/10 dark:bg-primaryD/10 p-2 rounded-lg text-primaryL dark:text-primaryD">
                                    <Settings2 className="w-8 h-8" />
                                </span>
                                مدیریت برنامه شیفتی
                            </h1>
                            <p className="text-muted-foregroundL mt-2 text-sm">
                                ویرایش ساختار چرخه و تنظیمات برنامه <span className="font-bold text-foregroundL dark:text-foregroundD">«{initialSchedule.name}»</span>
                            </p>
                        </div>
                    </div>

                    {/* باکس اسلات‌ها */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-indigo-500" />
                                ساختار چرخه ({toPersianDigits(initialSchedule.cycle_length_days)} روز)
                            </h2>
                        </div>

                        <div className="p-5">
                            {slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[150px] p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <CalendarOff className="h-10 w-10 mb-3 text-gray-400" />
                                    <span className="text-gray-500 font-medium">هیچ اسلاتی برای این چرخه تعریف نشده است.</span>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto border border-borderL dark:border-borderD rounded-lg shadow-sm">
                                    <div className="min-w-[800px]">
                                        <div className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] font-bold text-sm text-center bg-gray-100 dark:bg-gray-800/80 border-b border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD">
                                            <div className="p-3">روز چرخه</div>
                                            <div className="p-3 text-right pr-6">الگوی کاری</div>
                                            <div className="p-3">شروع</div>
                                            <div className="p-3">پایان</div>
                                            <div className="p-3">مدت زمان</div>
                                            <div className="p-3">عملیات</div>
                                        </div>
                                        <div className="divide-y divide-borderL dark:divide-borderD bg-white dark:bg-backgroundD">
                                            {slots.map((slot) => (
                                                <div key={slot.id} className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] items-stretch hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <ScheduleSlotRow slot={slot} shiftScheduleId={initialSchedule.id} availablePatterns={availablePatterns} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <GeneratedShiftsList shiftScheduleId={initialSchedule.id} />
                </div>

                {/* --- ستون راست (فرم ویرایش + شناوری) --- */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-lg">
                        <div className="flex items-center gap-2 border-b border-borderL pb-3 text-primaryL dark:text-primaryD">
                            <FilePenLine className="h-5 w-5" strokeWidth={2.5} />
                            <h2 className="text-lg font-bold">تنظیمات پایه</h2>
                        </div>

                        {generalApiError && !generalApiError.includes("بارگذاری") && (
                            <Alert variant="destructive" className="py-2"><AlertDescription>{generalApiError}</AlertDescription></Alert>
                        )}

                        <div className="space-y-4">
                            <Input label="نام برنامه" {...register('name')} error={formErrors.name?.message} disabled={isPending} placeholder="عنوان برنامه..." />

                            <Controller
                                name="cycle_start_date"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <PersianDatePickerInput
                                        label="شروع چرخه"
                                        error={error?.message}
                                        value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                        onChange={(d) => field.onChange(d ? d.convert(gregorian, gregorian_en).format("YYYY-MM-DD") : "")}
                                    />
                                )}
                            />

                            {/* باکس وضعیت تعطیلات */}
                            <div className={clsx(
                                "flex items-center gap-3 rounded-lg p-3 text-sm font-medium border transition-colors",
                                initialSchedule.ignore_holidays
                                    ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                                    : "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            )}>
                                {initialSchedule.ignore_holidays
                                    ? <AlertTriangle className="h-5 w-5 shrink-0" />
                                    : <CheckCircle2 className="h-5 w-5 shrink-0" />
                                }
                                <div className="flex flex-col">
                                    <span className="font-bold mb-0.5">{initialSchedule.ignore_holidays ? "نادیده گرفتن تعطیلات" : "رعایت تعطیلات رسمی"}</span>
                                    <span className="text-xs opacity-80">{initialSchedule.ignore_holidays ? "شیفت‌ها در روزهای تعطیل هم برقرار هستند." : "روزهای تعطیل تقویم، آف در نظر گرفته می‌شوند."}</span>
                                </div>
                            </div>
                        </div>

                        {/* ✅ بخش تنظیمات شناوری - بازنویسی شده */}
                        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-800/50 pb-2">
                                <TimerReset className="w-5 h-5" />
                                <span className="text-sm font-bold">تنظیمات شناوری (آستانه)</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-1.5 block text-center">شناوری ورود</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            {...register('floating_start')}
                                            error={formErrors.floating_start?.message}
                                            disabled={isPending}
                                            className="text-center font-bold text-lg bg-white dark:bg-black/20 h-10"
                                            min={0}
                                        />
                                        <span className="absolute left-2 top-2.5 text-[10px] text-muted-foregroundL pointer-events-none">دقیقه</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-1.5 block text-center">شناوری خروج</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            {...register('floating_end')}
                                            error={formErrors.floating_end?.message}
                                            disabled={isPending}
                                            className="text-center font-bold text-lg bg-white dark:bg-black/20 h-10"
                                            min={0}
                                        />
                                        <span className="absolute left-2 top-2.5 text-[10px] text-muted-foregroundL pointer-events-none">دقیقه</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed bg-white/60 dark:bg-black/20 p-2 rounded-lg text-center">
                                تردد خارج از بازه {toPersianDigits(0)} تا {toPersianDigits(240)} دقیقه مشمول کسر کار خواهد شد.
                            </div>
                        </div>

                        {/* نمایش طول چرخه (فقط خواندنی) */}
                        <div className="bg-secondaryL/20 dark:bg-secondaryD/20 p-3 rounded-lg border border-borderL flex justify-between items-center">
                            <span className="text-sm text-muted-foregroundL">طول کل چرخه:</span>
                            <span className="font-bold text-lg text-foregroundL dark:text-foregroundD flex items-center gap-1">
                                {toPersianDigits(initialSchedule.cycle_length_days)}
                                <span className="text-xs font-normal text-muted-foregroundL">روز</span>
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-borderL">
                            <Button type="submit" size="lg" className="w-full font-bold shadow-md shadow-primaryL/20" disabled={!isDirty || isPending}>
                                {isPending ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                                ذخیره تغییرات
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                                <ArrowLeft className="ml-2 h-4 w-4" /> بازگشت
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};