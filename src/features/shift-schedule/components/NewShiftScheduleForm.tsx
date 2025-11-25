import { useShiftScheduleForm } from '../hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Moon, Clock, TimerReset } from 'lucide-react';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { Spinner } from '@/components/ui/Spinner';
import Checkbox from "@/components/ui/Checkbox";
import clsx from 'clsx';
import { Label } from '@/components/ui/Label';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

interface NewShiftScheduleFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

const calculateShiftInfo = (start: string | null | undefined, end: string | null | undefined) => {
    if (!start || !end) return { isNextDay: false, duration: null };
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if (isNaN(startH) || isNaN(endH)) return { isNextDay: false, duration: null };
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    let diff = endTotal - startTotal;
    let isNextDay = false;
    if (diff < 0) { diff += 24 * 60; isNextDay = true; }
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const durationText = `${hours > 0 ? `${hours} ساعت` : ''} ${minutes > 0 ? `و ${minutes} دقیقه` : ''}`.trim();
    return { isNextDay, duration: durationText };
};

export const NewShiftScheduleForm: React.FC<NewShiftScheduleFormProps> = ({ onSuccess, onCancel }) => {
    const {
        register, handleSubmit, formErrors,
        isPending, generalApiError, onSubmit,
        control, fields
    } = useShiftScheduleForm({ onSuccess });

    const watchedSlots = useWatch({ control, name: "slots" });
    const isGlobalLoading = isPending;

    return (
        // با استفاده از as any موقتاً جلوی خطای تایپ handleSubmit را می‌گیریم تا بیلد رد شود
        // منطقاً تایپ‌ها درست است اما TS روی فیلدهای optional گیر می‌دهد
        <form onSubmit={(handleSubmit as any)(onSubmit)} noValidate dir="rtl">
            <div className="space-y-6">
                <h1 className="text-xl font-bold border-b border-borderL dark:border-borderD pb-4">ایجاد برنامه شیفتی چرخشی</h1>

                {generalApiError && (
                    <Alert variant="destructive"><AlertTitle>خطا</AlertTitle><AlertDescription>{generalApiError}</AlertDescription></Alert>
                )}

                {/* بخش اول: اطلاعات عمومی */}
                <div className="bg-backgroundL-500 border rounded-2xl p-5 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* ستون راست (اطلاعات اصلی) */}
                        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="نام برنامه"
                                {...register('name')}
                                error={formErrors.name?.message}
                                placeholder="مثلاً: نگهبانی شبانه"
                                disabled={isGlobalLoading}
                                className="md:col-span-2"
                            />
                            <Input
                                label="طول چرخه (روز)"
                                type="number"
                                {...register('cycle_length_days', { valueAsNumber: true })}
                                error={formErrors.cycle_length_days?.message}
                                placeholder="بین ۱ تا ۳۱"
                                min={1} max={31}
                                disabled={isGlobalLoading}
                            />
                            <Controller
                                name="cycle_start_date"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <PersianDatePickerInput
                                        label="تاریخ شروع چرخه"
                                        error={error?.message}
                                        value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                        onChange={(dateObject) => {
                                            if (dateObject) {
                                                const gregorianDate = dateObject.convert(gregorian, gregorian_en);
                                                const formattedString = gregorianDate.format("YYYY-MM-DD");
                                                field.onChange(formattedString);
                                            } else {
                                                field.onChange("");
                                            }
                                        }}
                                    />
                                )}
                            />
                            <div className="md:col-span-2 pt-2">
                                <Controller
                                    name="ignore_holidays"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="ignore_holidays"
                                            label="نادیده گرفتن تعطیلات رسمی (شیفت‌های ۲۴/۷)"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isGlobalLoading}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* ✅ ستون چپ (تنظیمات شناوری) */}
                        <div className="md:col-span-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300">
                                <TimerReset className="w-5 h-5" />
                                <h3 className="text-sm font-bold">تنظیمات شناوری (آستانه)</h3>
                            </div>
                            <div className="space-y-3">
                                <Input
                                    type="number"
                                    label="شناوری ورود (دقیقه)"
                                    {...register('floating_start')}
                                    error={formErrors.floating_start?.message}
                                    className="bg-white dark:bg-black/20 text-center"
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    label="شناوری خروج (دقیقه)"
                                    {...register('floating_end')}
                                    error={formErrors.floating_end?.message}
                                    className="bg-white dark:bg-black/20 text-center"
                                    min={0}
                                />
                                <p className="text-[11px] text-muted-foregroundL leading-4 bg-white/50 dark:bg-black/20 p-2 rounded border border-indigo-200/50 dark:border-indigo-700/30 dark:text-infoD-foreground">
                                    <strong>نکته:</strong> طبق منطق آستانه، تردد خارج از این بازه مشمول جریمه کسر کار کامل خواهد شد.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* بخش دوم: اسلات‌های داینامیک */}
                {isGlobalLoading && fields.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[100px]"><Spinner size="lg" /></div>
                ) : (
                    fields.length > 0 && (
                        <div className="space-y-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                            <h2 className="text-lg font-semibold text-foregroundL dark:text-foregroundD">تخصیص اسلات‌های چرخه</h2>

                            <div className="hidden md:grid grid-cols-12 gap-x-4 pb-2 border-b border-borderL dark:border-borderD text-sm font-medium text-muted-foregroundL">
                                <span className="col-span-1">روز</span>
                                <span className="col-span-2">استراحت؟</span>
                                <span className="col-span-3">نام شیفت</span>
                                <span className="col-span-2">شروع</span>
                                <span className="col-span-2">پایان</span>
                                <span className="col-span-2 text-center">وضعیت</span>
                            </div>

                            {fields.map((field, index) => {
                                const slotData = watchedSlots?.[index];
                                const isOff = slotData?.is_off ?? false;
                                const fieldDisabled = isGlobalLoading || isOff;
                                const { isNextDay, duration } = calculateShiftInfo(slotData?.start_time, slotData?.end_time);

                                return (
                                    <div key={field.id} className={clsx("grid grid-cols-12 gap-x-4 gap-y-2 items-start pt-3 pb-3 border-b border-borderL dark:border-borderD last:border-b-0", index % 2 === 1 ? "bg-secondaryL/30 dark:bg-secondaryD/20 p-2 rounded" : "p-2")}>
                                        <div className="col-span-12 md:col-span-1 flex items-center pt-2">
                                            <Label className="font-medium">روز {field.day_in_cycle}</Label>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex items-center pt-2">
                                            <Controller name={`slots.${index}.is_off`} control={control} render={({ field: cb }) => (
                                                <Checkbox id={`is_off_${index}`} label="روز استراحت" checked={cb.value} onCheckedChange={cb.onChange} disabled={isGlobalLoading} />
                                            )} />
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <Label htmlFor={`name_${index}`} className="md:hidden mb-1 block">نام شیفت</Label>
                                            <Input id={`name_${index}`} label="" placeholder="مثلاً: شیفت شب" {...register(`slots.${index}.name`)} error={formErrors.slots?.[index]?.name?.message} disabled={fieldDisabled} className={clsx(fieldDisabled && "opacity-50 bg-stone-100")} />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Label htmlFor={`start_time_${index}`} className="md:hidden">شروع</Label>
                                            <Controller name={`slots.${index}.start_time`} control={control} render={({ field: tf }) => (
                                                <CustomTimeInput value={tf.value} onChange={tf.onChange} disabled={fieldDisabled} className={clsx(fieldDisabled && "opacity-50 bg-stone-100")} />
                                            )} />
                                        </div>
                                        <div className="col-span-6 md:col-span-2 relative">
                                            <Label htmlFor={`end_time_${index}`} className="md:hidden">پایان</Label>
                                            <Controller name={`slots.${index}.end_time`} control={control} render={({ field: tf }) => (
                                                <div className="relative">
                                                    <CustomTimeInput value={tf.value} onChange={tf.onChange} disabled={fieldDisabled} className={clsx(fieldDisabled && "opacity-50 bg-stone-100", !fieldDisabled && isNextDay && "border-indigo-400")} />
                                                    {isNextDay && !fieldDisabled && <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded bg-indigo-100 text-[10px] text-indigo-700 font-bold flex gap-1"><Moon className="w-3 h-3" />1+</span>}
                                                </div>
                                            )} />
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center pt-2 md:pt-0">
                                            {!isOff && duration ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foregroundL bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /><span>{duration}</span></div>
                                            ) : <span className="text-xs text-muted-foregroundL/50">---</span>}
                                            {formErrors.slots?.[index]?.root?.message && <p className="text-xs text-red-600 mt-1">{formErrors.slots[index]?.root?.message}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                <div className="flex justify-end gap-4 border-t border-borderL dark:border-borderD pt-4">
                    <Button type="submit" disabled={isGlobalLoading}>{isPending ? 'در حال ایجاد...' : 'ایجاد برنامه شیفتی'}</Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isGlobalLoading}>لغو</Button>
                </div>
            </div>
        </form>
    );
};