import { useState, useMemo, useEffect } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, X, Edit } from 'lucide-react';

// مسیرهایی که در تلاش قبلی برای رفع خطا استفاده کردیم
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import { useUpdateScheduleSlot } from '../hooks/hook';
import {

    type ScheduleSlotResource,
    type WorkPatternBase,
    type SlotUpdatePayload
} from '../types';
import clsx from 'clsx';

// --- Schema (بدون تغییر) ---
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const slotSchema = z.object({
    work_pattern_id: z.number().nullable(),
    override_start_time: z.string().nullable().optional(),
    override_end_time: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    const start = data.override_start_time;
    const end = data.override_end_time;
    if (start && end) {
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "فرمت نامعتبر", path: ['override_end_time'] });
            return;
        }
    }
    else if (start && !end) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ساعت پایان الزامی است", path: ['override_end_time'] });
    } else if (!start && end) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ساعت شروع الزامی است", path: ['override_start_time'] });
    }
});
type SlotFormData = z.infer<typeof slotSchema>;


interface ScheduleSlotRowProps {
    slot: ScheduleSlotResource;
    shiftScheduleId: number | string;
    availablePatterns: WorkPatternBase[];
}

export const ScheduleSlotRow: React.FC<ScheduleSlotRowProps> = ({
    slot,
    shiftScheduleId,
    availablePatterns,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateSlotMutation = useUpdateScheduleSlot();

    // --- SelectBox Options (بدون تغییر) ---
    const patternOptions: SelectOption[] = useMemo(() =>
        availablePatterns.map(p => ({ id: p.id, name: p.name })),
        [availablePatterns]
    );
    const allOptions: SelectOption[] = useMemo(() => [
        { id: null as any, name: 'روز استراحت (Off)' },
        ...patternOptions
    ], [patternOptions]);


    // --- مدیریت فرم داخلی ---
    const defaultValues: SlotFormData = useMemo(() => ({
        work_pattern_id: slot.work_pattern_id,
        override_start_time: slot.override_start_time,
        override_end_time: slot.override_end_time,
    }), [slot]);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<SlotFormData>({
        resolver: zodResolver(slotSchema),
        defaultValues,
    });

    const isSubmitting = updateSlotMutation.isPending;

    useEffect(() => {
        if (isSubmitting) {
            return;
        }
        reset(defaultValues);

    }, [defaultValues, reset, isSubmitting]);


    // --- منطق فرم ---
    const watchedPatternId = watch('work_pattern_id');
    const isRestDay = watchedPatternId === null;

    useEffect(() => {
        if (isEditing && isRestDay) {
            setValue('override_start_time', null, { shouldDirty: true });
            setValue('override_end_time', null, { shouldDirty: true });
        }
    }, [isEditing, isRestDay, setValue]);


    // --- onSubmit (بدون تغییر، منطق await صحیح است) ---
    const onSubmit = async (formData: SlotFormData) => {
        const payload: SlotUpdatePayload = {
            work_pattern_id: formData.work_pattern_id,
            override_start_time: formData.override_start_time,
            override_end_time: formData.override_end_time,
        };

        if (isRestDay) {
            payload.override_start_time = null;
            payload.override_end_time = null;
        }

        try {
            await updateSlotMutation.mutateAsync({
                shiftScheduleId,
                scheduleSlotId: slot.id,
                payload,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("خطا در هنگام آپدیت اسلات:", error);
        }
    };

    const handleCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    const dayInCycle = slot.day_in_cycle;

    // --- مقادیر نمایشی (منطق رفع باگ شده قبلی، بدون تغییر) ---
    const displayPatternName = slot.work_pattern ? slot.work_pattern.name : 'استراحت';
    const displayStartTime = slot.override_start_time || (slot.work_pattern ? slot.work_pattern.start_time : null);
    const displayEndTime = slot.override_end_time || (slot.work_pattern ? slot.work_pattern.end_time : null);
    console.log(displayStartTime,displayEndTime);
    

    const placeholderStartTime = slot.work_pattern ? slot.work_pattern.start_time : undefined;
    const placeholderEndTime = slot.work_pattern ? slot.work_pattern.end_time : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="contents" noValidate>
            <div className="contents text-sm text-center">

                {/* ستون ۱: روز */}
                <div className="p-3 border-r border-borderL dark:border-borderD flex justify-center items-center font-medium text-foregroundL dark:text-foregroundD">
                    {dayInCycle}
                </div>

                {/* ستون ۲: الگوی کاری (SelectBox) */}
                <div className="p-2 border-r border-borderL dark:border-borderD text-right">
                    {isEditing ? (
                        <div>
                            <Controller
                                name="work_pattern_id"
                                control={control}
                                render={({ field }) => (
                                    <SelectBox
                                        label=""
                                        placeholder="انتخاب الگو"
                                        options={allOptions}
                                        value={allOptions.find(opt => opt.id === field.value) || null}
                                        onChange={(option) => field.onChange(option ? (option.id as number | null) : null)}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.work_pattern_id?.message && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {errors.work_pattern_id.message}
                                </p>
                            )}
                        </div>
                    ) : (
                        <span className={clsx(
                            "font-medium",
                            slot.work_pattern_id === null ? 'text-red-500 dark:text-red-400' : 'text-foregroundL dark:text-foregroundD'
                        )}>
                            {displayPatternName}
                        </span>
                    )}
                </div>

                {/* ستون ۳: شروع Override (CustomTimeInput) */}
                <div className="p-2 border-r border-borderL dark:border-borderD">
                    {isEditing ? (
                        <Controller
                            name="override_start_time"
                            control={control}
                            render={({ field }) => (
                                <CustomTimeInput
                                    // ✅✅✅ رفع خطای TS(2322) ✅✅✅
                                    // خطای "Type 'undefined' is not assignable to 'string | null'"
                                    // به این دلیل بود که field.value از react-hook-form می‌تواند undefined باشد.
                                    // کامپوننت CustomTimeInput شما به صراحت 'string | null' می‌خواهد.
                                    // با `?? null` ما تضمین می‌کنیم که undefined هرگز پاس داده نمی‌شود.
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    placeholder={placeholderStartTime}
                                    disabled={isSubmitting || isRestDay}
                                    className={clsx(isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800")}
                                />
                            )}
                        />
                    ) : (
                        <span className={clsx(!displayStartTime && "text-muted-foregroundL dark:text-muted-foregroundD")}>
                            {displayStartTime || '---'}
                        </span>
                    )}
                </div>

                {/* ستون ۴: پایان Override (CustomTimeInput) */}
                <div className="p-2 border-r border-borderL dark:border-borderD">
                    {isEditing ? (
                        <Controller
                            name="override_end_time"
                            control={control}
                            render={({ field }) => (
                                <CustomTimeInput
                                    // ✅✅✅ رفع خطای TS(2322) ✅✅✅
                                    // همان اصلاح را برای فیلد زمان پایان نیز اعمال می‌کنیم.
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    placeholder={placeholderEndTime}
                                    disabled={isSubmitting || isRestDay}
                                    className={clsx(isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800")}
                                />
                            )}
                        />
                    ) : (
                        <span className={clsx(!displayEndTime && "text-muted-foregroundL dark:text-muted-foregroundD")}>
                            {displayEndTime || '---'}
                        </span>
                    )}
                </div>

                {/* ستون ۵: عملیات */}
                <div className="p-2 flex gap-2 justify-center border-borderL dark:border-borderD">
                    {isEditing ? (
                        <>
                            <Button type="submit" size="icon" variant="primary" disabled={!isDirty || isSubmitting} title="ذخیره">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={handleCancel} disabled={isSubmitting} title="لغو">
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </>
                    ) : (
                        <Button type="button" size="icon" variant="outline" onClick={() => setIsEditing(true)} title="ویرایش">
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};