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
    AlertTriangle, CheckCircle2, TimerReset
} from 'lucide-react';
import clsx from 'clsx';
// ✅ ایمپورت تایپ داده
import type { EditShiftScheduleFormData } from '../schema/EditShiftScheduleSchema';

type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;

// ✅ اصلاح: تعریف صریح پراپ‌ها بر اساس UseFormReturn برای اطمینان از سازگاری
interface EditShiftScheduleFormProps extends Omit<EditFormHookReturn, 'handleSubmit' | 'onSubmit'> {
    onCancel: () => void;
    availablePatterns: WorkPatternBase[];
    // ✅ تعریف صریح برای جلوگیری از تداخل تایپ‌های استنتاجی
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
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD">
                            مدیریت برنامه شیفتی: <span className="text-primaryL dark:text-primaryD">{initialSchedule.name}</span>
                        </h1>
                    </div>

                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                        <div className="p-5 space-y-4">
                            <h2 className="text-xl font-semibold">ساختار چرخه ({initialSchedule.cycle_length_days} روز)</h2>
                            {slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[100px] p-4 bg-secondaryL rounded-lg border border-dashed"><CalendarOff className="h-8 w-8 mb-2 opacity-50" /><span>اسلاتی تعریف نشده است.</span></div>
                            ) : (
                                <div className="w-full overflow-x-auto border border-borderL rounded-lg pb-10">
                                    <div className="min-w-[800px]">
                                        <div className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] font-medium text-sm text-center bg-gray-100 dark:bg-gray-800 border-b border-borderL">
                                            <div className="p-3">روز</div><div className="p-3 text-right">الگو</div><div className="p-3">شروع</div><div className="p-3">پایان</div><div className="p-3">مدت</div><div className="p-3">عملیات</div>
                                        </div>
                                        <div className="divide-y divide-borderL">
                                            {slots.map((slot) => (
                                                <div key={slot.id} className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_2fr_100px] items-start hover:bg-secondaryL/40">
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
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                        <div className="flex items-center gap-3 border-b border-borderL pb-3">
                            <FilePenLine className="h-6 w-6 text-primaryL" strokeWidth={2.5} />
                            <h2 className="text-xl font-bold">تنظیمات پایه</h2>
                        </div>

                        {generalApiError && !generalApiError.includes("بارگذاری") && (<Alert variant="destructive"><AlertDescription>{generalApiError}</AlertDescription></Alert>)}

                        <Input label="نام برنامه" {...register('name')} error={formErrors.name?.message} disabled={isPending} />

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

                        {/* ✅ بخش تنظیمات شناوری در ویرایش */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                <TimerReset className="w-4 h-4" />
                                <span className="text-sm font-bold">ساعات شناور</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input type="number" label="ورود (دقیقه)" {...register('floating_start')} error={formErrors.floating_start?.message} disabled={isPending} className="text-center bg-white dark:bg-black/20" min={0} />
                                <Input type="number" label="خروج (دقیقه)" {...register('floating_end')} error={formErrors.floating_end?.message} disabled={isPending} className="text-center bg-white dark:bg-black/20" min={0} />
                            </div>
                            <p className="text-[10px] text-muted-foregroundL leading-4 bg-white/50 dark:bg-black/20 p-2 rounded border border-indigo-200/50 dark:border-indigo-700/30">
                                <strong>توجه:</strong> شناوری با "منطق آستانه" اعمال می‌شود.
                            </p>
                        </div>

                        <Input
                            label="طول چرخه (روز)"
                            value={initialSchedule.cycle_length_days}
                            disabled readOnly
                            className="bg-secondaryL/40 text-muted-foregroundL"
                            icon={<RefreshCw className="h-4 w-4" />}
                        />

                        <div className={clsx("flex items-center rounded-lg p-3 text-sm font-semibold border", initialSchedule.ignore_holidays ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-green-50 text-green-800 border-green-200")}>
                            {initialSchedule.ignore_holidays ? <><AlertTriangle className="ml-2 h-5 w-5" />تعطیلات نادیده گرفته می‌شود</> : <><CheckCircle2 className="ml-2 h-5 w-5" />طبق تقویم تعطیلات</>}
                        </div>

                        <div className="flex flex-col gap-2 pt-4 border-t border-borderL">
                            <Button type="submit" disabled={!isDirty || isPending}>{isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} ذخیره تغییرات</Button>
                            <Button type="button" variant="ghost" onClick={onCancel}><ArrowLeft className="ml-2 h-4 w-4" /> بازگشت</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};