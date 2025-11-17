import { useShiftScheduleForm } from '../hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import React from 'react';
// --- ✅ ۱. ایمپورت Controller و ابزارهای تاریخ ---
import { Controller, useWatch } from 'react-hook-form';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput'; // ✅ فرض می‌کنیم این مسیر کامپوننت شماست
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
// --- پایان ایمپورت‌ها ---
import { Spinner } from '@/components/ui/Spinner';
import Checkbox from "@/components/ui/Checkbox";
import clsx from 'clsx';
import { Label } from '@/components/ui/Label';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

interface NewShiftScheduleFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

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
                        placeholder="مثلاً: چرخش ۴ روز کار، ۲ روز استراحت"
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

                    {/* --- ✅ ۲. جایگزینی Input type="date" با Controller --- */}
                    <Controller
                        name="cycle_start_date" // نام فیلد در react-hook-form
                        control={control}      // اتصال به control فرم
                        render={({ field, fieldState: { error } }) => (
                            <PersianDatePickerInput
                                label="تاریخ شروع محاسبه چرخه"
                                placeholder="یک تاریخ انتخاب کنید..."
                                disabled={isGlobalLoading}
                                error={error?.message} // نمایش خطا از react-hook-form

                                // تبدیل مقدار فرم (رشته YYYY-MM-DD) به DateObject برای کامپوننت
                                value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}

                                // (dateObject: DateObject | null) => void
                                onChange={(dateObject) => {
                                    if (dateObject) {
                                        // اگر تاریخی انتخاب شد، آن را به میلادی تبدیل می‌کنیم
                                        // تا فرمت YYYY-MM-DD تضمین شود (مطابق اسکیمای Zod)
                                        const gregorianDate = dateObject.convert(gregorian, gregorian_en);
                                        const formattedString = gregorianDate.format("YYYY-MM-DD");
                                        field.onChange(formattedString); // ارسال رشته به react-hook-form
                                    } else {
                                        // اگر کاربر تاریخ را پاک کرد، رشته خالی می‌فرستیم
                                        // اسکیمای Zod (که min(1) دارد) این خطا را مدیریت می‌کند
                                        field.onChange("");
                                    }
                                }}
                            />
                        )}
                    />
                    {/* --- پایان جایگزینی --- */}

                    {/* ✅✅✅ فیلد جدید: چک‌باکس نادیده گرفتن تعطیلات ✅✅✅ */}
                    <div className="md:col-span-3 flex items-center pt-2">
                        <Controller
                            name="ignore_holidays"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="ignore_holidays"
                                    // لیبل اصلی خود کامپوننت چک‌باکس
                                    label="نادیده گرفتن تعطیلات رسمی؟"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isGlobalLoading}
                                />
                            )}
                        />
                        {/* لیبل کمکی در کنار چک‌باکس */}
                        <Label htmlFor="ignore_holidays" className="mr-2 text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                            (اگر تیک زده شود، این الگو بدون توجه به تعطیلات رسمی اجرا می‌شود)
                        </Label>
                    </div>
                    {/* --- پایان فیلد جدید --- */}

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
                            {/* هدر جدول اسلات‌ها */}
                            <div className="hidden md:grid grid-cols-12 gap-x-4 pb-2 border-b border-borderL dark:border-borderD text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                                <span className="col-span-1">روز</span>
                                <span className="col-span-2">استراحت؟</span>
                                <span className="col-span-4">نام شیفت</span>
                                <span className="col-span-2">شروع</span>
                                <span className="col-span-2">پایان</span>
                                <span className="col-span-1"></span>
                            </div>

                            {/* رندر ردیف‌های اسلات */}
                            {fields.map((field, index) => {
                                const isOff = watchedSlots?.[index]?.is_off ?? false;
                                const fieldDisabled = isGlobalLoading || isOff;

                                return (
                                    <div
                                        key={field.id}
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
                                                        label="روز استراحت (Off)"
                                                        checked={checkboxField.value}
                                                        onCheckedChange={checkboxField.onChange}
                                                        disabled={isGlobalLoading}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* 3. نام شیفت */}
                                        <div className="col-span-12 md:col-span-4">
                                            <Input
                                                label="نام شیفت"
                                                placeholder="مثلاً: شیفت صبح"
                                                {...register(`slots.${index}.name`)}
                                                error={formErrors.slots?.[index]?.name?.message}
                                                disabled={fieldDisabled}
                                                className={clsx(fieldDisabled && "opacity-50 bg-stone-100 dark:bg-stone-700")}
                                            />
                                        </div>

                                        {/* 4. زمان شروع */}
                                        <div className="col-span-6 md:col-span-2">
                                            <Label htmlFor={`start_time_${index}`}>زمان شروع</Label>
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
                                        <div className="col-span-6 md:col-span-2">
                                            <Label htmlFor={`end_time_${index}`}>زمان پایان</Label>
                                            <Controller
                                                name={`slots.${index}.end_time`}
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
                                            {formErrors.slots?.[index]?.end_time?.message && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    {formErrors.slots?.[index]?.end_time?.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* 6. خطای Cross-field */}
                                        {formErrors.slots?.[index]?.root?.message && (
                                            <p className="col-span-12 text-xs text-red-600 dark:text-red-400 mt-1">
                                                {formErrors.slots[index]?.root?.message}
                                            </p>
                                        )}
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


                {/* دکمه‌ها */}
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