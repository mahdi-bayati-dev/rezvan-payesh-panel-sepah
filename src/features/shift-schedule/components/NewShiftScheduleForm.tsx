import { useShiftScheduleForm } from '../hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Moon, Clock, TimerReset, PlusCircle } from 'lucide-react';
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

// --- تابع تبدیل اعداد به فارسی ---
const toPersianDigits = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return "";
    return n.toString().replace(/\d/g, (x) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(x)]);
};

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
    const durationText = `${hours > 0 ? `${toPersianDigits(hours)} ساعت` : ''} ${minutes > 0 ? `و ${toPersianDigits(minutes)} دقیقه` : ''}`.trim();
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
        <form onSubmit={(handleSubmit as any)(onSubmit)} noValidate dir="rtl">
            <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-borderL dark:border-borderD">
                    <div className="bg-primaryL/10 dark:bg-primaryD/10 p-2 rounded-lg">
                        <PlusCircle className="w-6 h-6 text-primaryL dark:text-primaryD" />
                    </div>
                    <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">ایجاد برنامه شیفتی جدید</h1>
                </div>

                {generalApiError && (
                    <Alert variant="destructive" className="bg-destructiveL-background dark:bg-destructiveD-background border-destructiveL-foreground/10 text-destructiveL-foreground"><AlertTitle>خطا</AlertTitle><AlertDescription>{generalApiError}</AlertDescription></Alert>
                )}

                {/* بخش اول: اطلاعات عمومی */}
                <div className="bg-backgroundL-500 border rounded-2xl p-6 border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                        <span className="w-1.5 h-6 bg-primaryL dark:bg-primaryD rounded-full"></span>
                        اطلاعات پایه و پیکربندی
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* ستون راست (اطلاعات اصلی) */}
                        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="نام برنامه (عنوان نمایشی)"
                                {...register('name')}
                                error={formErrors.name?.message}
                                placeholder="مثلاً: نگهبانی شبانه - گروه الف"
                                disabled={isGlobalLoading}
                                className="md:col-span-2"
                            />
                            <div className="relative">
                                <Input
                                    label="طول چرخه (روز)"
                                    type="number"
                                    {...register('cycle_length_days', { valueAsNumber: true })}
                                    error={formErrors.cycle_length_days?.message}
                                    placeholder="۱ تا ۳۱"
                                    min={1} max={31}
                                    disabled={isGlobalLoading}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-[34px] text-xs text-muted-foregroundL dark:text-muted-foregroundD">روز</span>
                            </div>

                            <Controller
                                name="cycle_start_date"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <PersianDatePickerInput
                                        label="تاریخ شروع اولین چرخه"
                                        error={error?.message}
                                        value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                        onChange={(dateObject) => {
                                            if (dateObject) {
                                                field.onChange(dateObject.convert(gregorian, gregorian_en).format("YYYY-MM-DD"));
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
                                        <div className="flex items-start gap-2 p-3 rounded-lg border border-borderL dark:border-borderD bg-secondaryL/10 dark:bg-secondaryD/10 hover:bg-secondaryL/20 dark:hover:bg-secondaryD/20 transition-colors cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            <Checkbox
                                                label=''
                                                id="ignore_holidays"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isGlobalLoading}
                                                className={clsx(field.value ? "text-warningL-foreground" : "")}
                                            />
                                            <div className="flex flex-col">
                                                <Label htmlFor="ignore_holidays" className="cursor-pointer font-bold mb-1 text-foregroundL dark:text-foregroundD">نادیده گرفتن تعطیلات رسمی (شیفت‌های ۲۴/۷)</Label>
                                                <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">در صورت فعال‌سازی، روزهای تعطیل تقویم نادیده گرفته شده و شیفت طبق چرخه اعمال می‌شود.</span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* ستون چپ (تنظیمات شناوری) */}
                        <div className="md:col-span-4 bg-primaryL/5 dark:bg-primaryD/5 border border-primaryL/10 dark:border-primaryD/10 rounded-2xl p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-primaryL dark:text-primaryD border-b border-primaryL/20 dark:border-primaryD/20 pb-2">
                                    <TimerReset className="w-5 h-5" />
                                    <h3 className="text-sm font-bold">تنظیمات شناوری (آستانه)</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-primaryL dark:text-primaryD mb-1 block">شناوری مجاز ورود (دقیقه)</label>
                                        <Input
                                            type="number"
                                            {...register('floating_start')}
                                            error={formErrors.floating_start?.message}
                                            className="bg-backgroundL-500 dark:bg-backgroundD text-center font-bold text-lg"
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-primaryL dark:text-primaryD mb-1 block">شناوری مجاز خروج (دقیقه)</label>
                                        <Input
                                            type="number"
                                            {...register('floating_end')}
                                            error={formErrors.floating_end?.message}
                                            className="bg-backgroundL-500 dark:bg-backgroundD text-center font-bold text-lg"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 text-[11px] text-primaryL/80 dark:text-primaryD/80 leading-5 bg-backgroundL-500/60 dark:bg-backgroundD/60 p-3 rounded-xl border border-primaryL/20 dark:border-primaryD/20 text-justify">
                                <strong>نکته مهم:</strong> این مقادیر به عنوان "آستانه" (Threshold) عمل می‌کنند. اگر تاخیر یا تعجیل بیشتر از این مقدار باشد، کل زمان به عنوان کسر کار محاسبه می‌شود.
                            </p>
                        </div>
                    </div>
                </div>

                {/* بخش دوم: اسلات‌های داینامیک */}
                {isGlobalLoading && fields.length === 0 ? (
                    <div className="flex flex-col gap-2 justify-center items-center min-h-[200px] border rounded-2xl bg-secondaryL/5 dark:bg-secondaryD/5"><Spinner size="lg" /><span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">در حال آماده‌سازی فرم...</span></div>
                ) : (
                    fields.length > 0 && (
                        <div className="space-y-4 bg-backgroundL-500 dark:bg-backgroundD border rounded-2xl overflow-hidden border-borderL dark:border-borderD transition-colors duration-300 shadow-sm">
                            <div className="p-4 bg-secondaryL/20 dark:bg-secondaryD/20 border-b border-borderL dark:border-borderD flex justify-between items-center">
                                <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-primaryL dark:bg-primaryD rounded-full"></span>
                                    تخصیص اسلات‌های چرخه
                                </h2>
                                <span className="text-xs font-medium bg-backgroundL-500 dark:bg-backgroundD px-3 py-1 rounded-full border border-borderL dark:border-borderD shadow-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    تعداد روز: {toPersianDigits(fields.length)}
                                </span>
                            </div>

                            <div className="hidden md:grid grid-cols-12 gap-x-4 px-4 py-3 bg-secondaryL/10 dark:bg-secondaryD/10 border-b border-borderL dark:border-borderD text-sm font-bold text-muted-foregroundL dark:text-muted-foregroundD">
                                <span className="col-span-1 text-center">روز</span>
                                <span className="col-span-2">نوع روز</span>
                                <span className="col-span-3">نام نمایشی شیفت</span>
                                <span className="col-span-2 text-center">ساعت شروع</span>
                                <span className="col-span-2 text-center">ساعت پایان</span>
                                <span className="col-span-2 text-center">مدت زمان</span>
                            </div>

                            <div className="divide-y divide-borderL dark:divide-borderD">
                                {fields.map((field, index) => {
                                    const slotData = watchedSlots?.[index];
                                    const isOff = slotData?.is_off ?? false;
                                    const fieldDisabled = isGlobalLoading || isOff;
                                    const { isNextDay, duration } = calculateShiftInfo(slotData?.start_time, slotData?.end_time);

                                    return (
                                        <div key={field.id} className={clsx("grid grid-cols-12 gap-x-4 gap-y-4 items-center p-4 hover:bg-secondaryL/5 dark:hover:bg-secondaryD/5 transition-colors", isOff ? "bg-secondaryL/10 dark:bg-secondaryD/10" : "")}>
                                            <div className="col-span-12 md:col-span-1 flex items-center justify-center md:justify-center gap-2">
                                                <Label className="md:hidden">روز:</Label>
                                                <div className="w-8 h-8 rounded-full bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {toPersianDigits(field.day_in_cycle)}
                                                </div>
                                            </div>

                                            <div className="col-span-12 md:col-span-2 flex items-center">
                                                <Controller name={`slots.${index}.is_off`} control={control} render={({ field: cb }) => (
                                                    <Checkbox
                                                        id={`is_off_${index}`}
                                                        label="روز استراحت (OFF)"
                                                        checked={cb.value}
                                                        onCheckedChange={cb.onChange}
                                                        disabled={isGlobalLoading}
                                                        className={clsx(cb.value ? "text-warningL-foreground" : "")}
                                                    />
                                                )} />
                                            </div>

                                            <div className="col-span-12 md:col-span-3">
                                                <Label htmlFor={`name_${index}`} className="md:hidden mb-1 block text-xs">نام شیفت</Label>
                                                <Input
                                                    id={`name_${index}`}
                                                    placeholder={isOff ? "---" : "مثلاً: شیفت صبح"}
                                                    {...register(`slots.${index}.name`)}
                                                    error={formErrors.slots?.[index]?.name?.message}
                                                    disabled={fieldDisabled}
                                                    className={clsx("transition-all", fieldDisabled && "opacity-50 bg-transparent border-dashed")}
                                                />
                                            </div>

                                            <div className="col-span-6 md:col-span-2">
                                                <Label htmlFor={`start_time_${index}`} className="md:hidden mb-1 block text-xs">شروع</Label>
                                                <Controller name={`slots.${index}.start_time`} control={control} render={({ field: tf }) => (
                                                    <CustomTimeInput
                                                        value={tf.value}
                                                        onChange={tf.onChange}
                                                        disabled={fieldDisabled}
                                                        className={clsx("text-center dir-ltr ", fieldDisabled && "opacity-30 bg-transparent border-none shadow-none")}
                                                        placeholder="--:--"
                                                    />
                                                )} />
                                            </div>

                                            <div className="col-span-6 md:col-span-2 relative">
                                                <Label htmlFor={`end_time_${index}`} className="md:hidden mb-1 block text-xs">پایان</Label>
                                                <Controller name={`slots.${index}.end_time`} control={control} render={({ field: tf }) => (
                                                    <div className="relative">
                                                        <CustomTimeInput
                                                            value={tf.value}
                                                            onChange={tf.onChange}
                                                            disabled={fieldDisabled}
                                                            className={clsx("text-center dir-ltr ", fieldDisabled && "opacity-30 bg-transparent border-none shadow-none", !fieldDisabled && isNextDay && "border-primaryL ring-1 ring-primaryL/30")}
                                                            placeholder="--:--"
                                                        />
                                                        {isNextDay && !fieldDisabled && (
                                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-primaryL/10 dark:bg-primaryD/10 text-[9px] text-primaryL dark:text-primaryD font-bold flex gap-1 items-center border border-primaryL/20 dark:border-primaryD/20 shadow-sm z-10 whitespace-nowrap">
                                                                <Moon className="w-2.5 h-2.5" />
                                                                ۱+ روز
                                                            </span>
                                                        )}
                                                    </div>
                                                )} />
                                            </div>

                                            <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center pt-2 md:pt-0">
                                                {!isOff && duration ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-successL-foreground dark:text-successD-foreground bg-successL-background dark:bg-successD-background px-3 py-1.5 rounded-full border border-successL-foreground/20">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{duration}</span>
                                                    </div>
                                                ) : <span className="text-xs font-medium text-muted-foregroundL/40 dark:text-muted-foregroundD/40 border-b-2 border-dotted w-12 text-center pb-0.5">---</span>}
                                                {formErrors.slots?.[index]?.root?.message && <p className="text-[10px] text-destructiveL-foreground mt-1 font-medium bg-destructiveL-background px-2 py-0.5 rounded">{formErrors.slots[index]?.root?.message}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}

                <div className="flex justify-end gap-4 border-t border-borderL dark:border-borderD pt-6">
                    <Button type="submit" size="lg" disabled={isGlobalLoading} className="px-8 font-bold shadow-lg shadow-primaryL/20 bg-primaryL hover:bg-primaryL/90 dark:bg-primaryD dark:hover:bg-primaryD/90">{isPending ? 'در حال ایجاد...' : 'ثبت و ایجاد برنامه'}</Button>
                    <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isGlobalLoading}>انصراف</Button>
                </div>
            </div>
        </form>
    );
};