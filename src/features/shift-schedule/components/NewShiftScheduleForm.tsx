import { useShiftScheduleForm } from '../hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, Moon, Clock } from 'lucide-react';
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

// --- تابع کمکی برای محاسبه وضعیت شیفت ---
const calculateShiftInfo = (start: string | null | undefined, end: string | null | undefined) => {
    if (!start || !end) return { isNextDay: false, duration: null };

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    if (isNaN(startH) || isNaN(endH)) return { isNextDay: false, duration: null };

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    let diff = endTotal - startTotal;
    let isNextDay = false;

    // اگر پایان کوچکتر از شروع باشد (مثلاً ۲۰:۰۰ تا ۰۶:۰۰)، یعنی شیفت شب است
    if (diff < 0) {
        diff += 24 * 60; // اضافه کردن ۲۴ ساعت به پایان
        isNextDay = true;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    // فرمت کردن متن مدت زمان (مثلاً: ۱۰ ساعت و ۳۰ دقیقه)
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">
            <div className="space-y-6">

                <h1 className="text-xl font-bold border-b border-borderL dark:border-borderD pb-4">ایجاد برنامه شیفتی چرخشی</h1>

                {generalApiError && (
                    <Alert variant="destructive">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                {/* بخش اول: اطلاعات عمومی */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">

                    <Input
                        label="نام برنامه"
                        {...register('name')}
                        error={formErrors.name?.message}
                        placeholder="مثلاً: نگهبانی شبانه (۴ روز کار، ۲ آف)"
                        disabled={isGlobalLoading}
                        className="md:col-span-3"
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
                                label="تاریخ شروع محاسبه چرخه"
                                placeholder="یک تاریخ انتخاب کنید..."
                                disabled={isGlobalLoading}
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

                    <div className="md:col-span-3 flex items-center pt-2">
                        <Controller
                            name="ignore_holidays"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="ignore_holidays"
                                    label="نادیده گرفتن تعطیلات رسمی؟"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isGlobalLoading}
                                />
                            )}
                        />
                        <Label htmlFor="ignore_holidays" className="mr-2 text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                            (برای شیفت‌های نگهبانی معمولاً تیک زده می‌شود)
                        </Label>
                    </div>

                </div>

                {/* بخش دوم: اسلات‌های داینامیک */}
                {isGlobalLoading && fields.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[100px]">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    fields.length > 0 && (
                        <div className="space-y-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                            <h2 className="text-lg font-semibold text-foregroundL dark:text-foregroundD">
                                تخصیص اسلات‌های چرخه
                            </h2>

                            <div className="hidden md:grid grid-cols-12 gap-x-4 pb-2 border-b border-borderL dark:border-borderD text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                                <span className="col-span-1">روز</span>
                                <span className="col-span-2">استراحت؟</span>
                                <span className="col-span-3">نام شیفت</span>
                                <span className="col-span-2">شروع</span>
                                <span className="col-span-2">پایان</span>
                                <span className="col-span-2 text-center">وضعیت</span>
                            </div>

                            {fields.map((field, index) => {
                                // دریافت مقادیر لحظه‌ای برای محاسبه
                                const slotData = watchedSlots?.[index];
                                const isOff = slotData?.is_off ?? false;
                                const startTime = slotData?.start_time;
                                const endTime = slotData?.end_time;
                                const fieldDisabled = isGlobalLoading || isOff;

                                // محاسبه اطلاعات شیفت (گذر از نیمه‌شب و مدت زمان)
                                const { isNextDay, duration } = calculateShiftInfo(startTime, endTime);

                                return (
                                    <div
                                        key={field.id}
                                        // ✅ آیتم‌ها رو items-start نگه می‌داریم تا اگر ارور زیر فیلد اومد، بهم نریزه
                                        // اما چون لیبل‌ها رو یکسان کردیم، اینپوت‌ها هم‌تراز میشن
                                        className={clsx(
                                            "grid grid-cols-12 gap-x-4 gap-y-2 items-start pt-3 pb-3 border-b border-borderL dark:border-borderD last:border-b-0",
                                            index % 2 === 1 ? "bg-secondaryL/30 dark:bg-secondaryD/20 p-2 rounded" : "p-2"
                                        )}
                                    >
                                        {/* 1. روز در چرخه */}
                                        <div className="col-span-12 md:col-span-1 flex items-center pt-2">
                                            <Label className="font-medium text-foregroundL dark:text-foregroundD md:pt-2">
                                                روز {field.day_in_cycle}
                                            </Label>
                                        </div>

                                        {/* 2. چکباکس Is Off */}
                                        <div className="col-span-12 md:col-span-2 flex items-center pt-2">
                                            <Controller
                                                name={`slots.${index}.is_off`}
                                                control={control}
                                                render={({ field: checkboxField }) => (
                                                    <Checkbox
                                                        id={`is_off_${index}`}
                                                        label="روز استراحت"
                                                        checked={checkboxField.value}
                                                        onCheckedChange={checkboxField.onChange}
                                                        disabled={isGlobalLoading}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* 3. نام شیفت */}
                                        <div className="col-span-12 md:col-span-3">
                                            {/* ✅ اصلاح مهم: لیبل دستی اضافه شد که در دسکتاپ مخفی است (md:hidden) */}
                                            {/* این باعث میشه ساختار دقیقاً مثل فیلدهای زمان بشه */}
                                            <Label htmlFor={`name_${index}`} className="md:hidden mb-1 block">نام شیفت</Label>

                                            <Input
                                                id={`name_${index}`}
                                                // ✅ اصلاح مهم: لیبل داخلی حذف شد تا فضای اضافه نگیرد
                                                label=""
                                                placeholder="مثلاً: شیفت شب"
                                                {...register(`slots.${index}.name`)}
                                                error={formErrors.slots?.[index]?.name?.message}
                                                disabled={fieldDisabled}
                                                className={clsx(fieldDisabled && "opacity-50 bg-stone-100 dark:bg-stone-700")}
                                            />
                                        </div>

                                        {/* 4. زمان شروع */}
                                        <div className="col-span-6 md:col-span-2">
                                            <Label htmlFor={`start_time_${index}`} className="md:hidden">زمان شروع</Label>
                                            <Controller
                                                name={`slots.${index}.start_time`}
                                                control={control}
                                                render={({ field: timeField }) => (
                                                    <CustomTimeInput
                                                        value={timeField.value}
                                                        onChange={timeField.onChange}
                                                        disabled={fieldDisabled}
                                                        className={clsx(fieldDisabled && "opacity-50 bg-stone-100 dark:bg-stone-700")}
                                                    />
                                                )}
                                            />
                                            {formErrors.slots?.[index]?.start_time?.message && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    {formErrors.slots?.[index]?.start_time?.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* 5. زمان پایان */}
                                        <div className="col-span-6 md:col-span-2 relative">
                                            <Label htmlFor={`end_time_${index}`} className="md:hidden">زمان پایان</Label>
                                            <Controller
                                                name={`slots.${index}.end_time`}
                                                control={control}
                                                render={({ field: timeField }) => (
                                                    <div className="relative">
                                                        <CustomTimeInput
                                                            value={timeField.value}
                                                            onChange={timeField.onChange}
                                                            disabled={fieldDisabled}
                                                            className={clsx(
                                                                fieldDisabled && "opacity-50 bg-stone-100 dark:bg-stone-700",
                                                                !fieldDisabled && isNextDay && "border-indigo-400 focus:border-indigo-500 dark:border-indigo-500"
                                                            )}
                                                        />
                                                        {isNextDay && !fieldDisabled && (
                                                            <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-[10px] font-bold shadow-sm border border-indigo-200 dark:border-indigo-700 flex items-center gap-1">
                                                                <Moon className="w-3 h-3" />
                                                                1+ روز
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {formErrors.slots?.[index]?.end_time?.message && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    {formErrors.slots?.[index]?.end_time?.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* 6. نمایش وضعیت */}
                                        <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center h-full pt-2 md:pt-0">
                                            {!isOff && duration ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{duration}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foregroundL/50 dark:text-muted-foregroundD/50">---</span>
                                            )}

                                            {formErrors.slots?.[index]?.root?.message && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center">
                                                    {formErrors.slots[index]?.root?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {formErrors.slots?.root?.message && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    {formErrors.slots.root.message}
                                </p>
                            )}
                        </div>
                    )
                )}

                <div className="flex justify-end gap-4 border-t border-borderL dark:border-borderD pt-4">
                    <Button type="submit" disabled={isGlobalLoading}>
                        {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {isPending ? 'در حال ایجاد...' : 'ایجاد برنامه شیفتی'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isGlobalLoading}>
                        لغو
                    </Button>
                </div>
            </div>
        </form>
    );
};