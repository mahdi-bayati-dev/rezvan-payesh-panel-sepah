import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, X, Edit, Moon, Clock } from 'lucide-react';

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

// --- تابع کمکی برای محاسبه وضعیت شیفت (مشترک با فرم ایجاد) ---
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

    const durationText = `${hours > 0 ? `${hours} ساعت` : ''} ${minutes > 0 ? `و ${minutes} دقیقه` : ''}`.trim();

    return { isNextDay, duration: durationText };
};

// --- Schema ---
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

    const patternOptions: SelectOption[] = useMemo(() =>
        availablePatterns.map(p => ({ id: p.id, name: p.name })),
        [availablePatterns]
    );
    const allOptions: SelectOption[] = useMemo(() => [
        { id: null as any, name: 'روز استراحت (Off)' },
        ...patternOptions
    ], [patternOptions]);

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
        formState: { isDirty },
    } = useForm<SlotFormData>({
        resolver: zodResolver(slotSchema),
        defaultValues,
    });

    const isSubmitting = updateSlotMutation.isPending;

    useEffect(() => {
        if (!isSubmitting) {
            reset(defaultValues);
        }
    }, [defaultValues, reset, isSubmitting]);

    const watchedPatternId = watch('work_pattern_id');
    const watchedStartTime = watch('override_start_time');
    const watchedEndTime = watch('override_end_time');

    const isRestDay = watchedPatternId === null;

    useEffect(() => {
        if (isEditing && isRestDay) {
            setValue('override_start_time', null, { shouldDirty: true });
            setValue('override_end_time', null, { shouldDirty: true });
        }
    }, [isEditing, isRestDay, setValue]);

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
            console.error("خطا در آپدیت اسلات:", error);
        }
    };

    const handleCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    // --- منطق نمایش ---
    const selectedPattern = availablePatterns.find(p => p.id === watchedPatternId);

    const calcStart = isEditing
        ? (watchedStartTime || (selectedPattern ? '08:00' : null))
        : (slot.override_start_time || (slot.work_pattern ? slot.work_pattern.start_time : null));

    const calcEnd = isEditing
        ? (watchedEndTime || (selectedPattern ? '16:00' : null))
        : (slot.override_end_time || (slot.work_pattern ? slot.work_pattern.end_time : null));

    // محاسبه وضعیت شیفت
    const { isNextDay, duration } = calculateShiftInfo(calcStart, calcEnd);

    // مقادیر نمایشی برای View Mode
    const displayPatternName = slot.work_pattern ? slot.work_pattern.name : 'استراحت';
    const displayStartTime = slot.override_start_time || (slot.work_pattern ? slot.work_pattern.start_time : null);
    const displayEndTime = slot.override_end_time || (slot.work_pattern ? slot.work_pattern.end_time : null);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="contents" noValidate>
            <div className="contents text-sm text-center">

                {/* ستون ۱: روز */}
                <div className="p-3 border-r border-borderL dark:border-borderD flex justify-center items-center font-medium text-foregroundL dark:text-foregroundD">
                    {slot.day_in_cycle}
                </div>

                {/* ستون ۲: الگو */}
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

                {/* ستون ۳: شروع */}
                <div className="p-2 border-r border-borderL dark:border-borderD">
                    {isEditing ? (
                        <Controller
                            name="override_start_time"
                            control={control}
                            render={({ field }) => (
                                <CustomTimeInput
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    disabled={isSubmitting || isRestDay}
                                    className={clsx(isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800")}
                                />
                            )}
                        />
                    ) : (
                        <span className={clsx(!displayStartTime && "text-muted-foregroundL")}>
                            {displayStartTime || '---'}
                        </span>
                    )}
                </div>

                {/* ستون ۴: پایان (با نشانگر روز بعد) */}
                <div className="p-2 border-r border-borderL dark:border-borderD relative">
                    {isEditing ? (
                        <div className="relative">
                            <Controller
                                name="override_end_time"
                                control={control}
                                render={({ field }) => (
                                    <CustomTimeInput
                                        value={field.value ?? null}
                                        onChange={field.onChange}
                                        disabled={isSubmitting || isRestDay}
                                        className={clsx(
                                            isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800",
                                            !isRestDay && isNextDay && "border-indigo-400 focus:border-indigo-500 dark:border-indigo-500"
                                        )}
                                    />
                                )}
                            />
                            {/* بج روز بعد در حالت ویرایش */}
                            {isNextDay && !isRestDay && (
                                <span className="absolute -top-3 left-0 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-[9px] font-bold shadow-sm border border-indigo-200 dark:border-indigo-700 flex items-center gap-0.5 z-10 pointer-events-none">
                                    <Moon className="w-2.5 h-2.5" />
                                    1+ روز
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 relative">
                            <span className={clsx(!displayEndTime && "text-muted-foregroundL")}>
                                {displayEndTime || '---'}
                            </span>
                            {/* بج روز بعد در حالت نمایش */}
                            {isNextDay && !isRestDay && (
                                <span title="پایان شیفت در روز بعد" className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                    <Moon className="w-3 h-3" />
                                    <span className="hidden xl:inline">+1</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ستون ۵: وضعیت/مدت (ستون جدید) */}
                <div className="p-2 border-r border-borderL dark:border-borderD flex justify-center items-center">
                    {!isRestDay && duration ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            <span>{duration}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foregroundL/30">---</span>
                    )}
                </div>

                {/* ستون ۶: عملیات */}
                <div className="p-2 flex gap-2 justify-center">
                    {isEditing ? (
                        <>
                            <Button type="submit" size="icon" variant="primary" disabled={!isDirty || isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={handleCancel} disabled={isSubmitting}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </>
                    ) : (
                        <Button type="button" size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};