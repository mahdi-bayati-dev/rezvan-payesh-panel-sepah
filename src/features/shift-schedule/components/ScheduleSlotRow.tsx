import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, X, Edit2, Moon, Clock, Coffee } from 'lucide-react';

import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import { useUpdateScheduleSlot } from '../hooks/useUpdateScheduleSlot';
import {
    type ScheduleSlotResource,
    type AvailableWorkPattern,
    type SlotUpdatePayload
} from '../types';
import clsx from 'clsx';

// --- ابزارهای کمکی ---
const toPersianDigits = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return "";
    const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

const calculateShiftInfo = (start: string | null | undefined, end: string | null | undefined) => {
    if (!start || !end) return { isNextDay: false, duration: null };
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if (isNaN(startH) || isNaN(endH)) return { isNextDay: false, duration: null };

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    let diff = endTotal - startTotal;
    let isNextDay = false;

    if (diff < 0) {
        diff += 24 * 60;
        isNextDay = true;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const durationText = `${hours > 0 ? `${toPersianDigits(hours)} ساعت` : ''} ${minutes > 0 ? `و ${toPersianDigits(minutes)} دقیقه` : ''}`.trim();

    return { isNextDay, duration: durationText };
};

// --- اسکیمای اعتبارسنجی ---
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const nullableTimeSchema = z.string().nullable().transform(val => val === "" ? null : val);

const slotSchema = z.object({
    work_pattern_id: z.number().nullable(),
    override_start_time: nullableTimeSchema,
    override_end_time: nullableTimeSchema,
}).superRefine((data, ctx) => {
    if (data.work_pattern_id !== null) {
        if (data.override_start_time && !timeRegex.test(data.override_start_time)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "فرمت نامعتبر", path: ['override_start_time'] });
        }
        if (data.override_end_time && !timeRegex.test(data.override_end_time)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "فرمت نامعتبر", path: ['override_end_time'] });
        }
    }
});

type SlotFormData = z.infer<typeof slotSchema>;

interface ScheduleSlotRowProps {
    slot: ScheduleSlotResource;
    shiftScheduleId: number | string;
    availablePatterns: AvailableWorkPattern[];
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
    }), [slot.work_pattern_id, slot.override_start_time, slot.override_end_time]);

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
        mode: 'onChange'
    });

    useEffect(() => {
        if (!isEditing) reset(defaultValues);
    }, [defaultValues, reset, isEditing]);

    const watchedPatternId = watch('work_pattern_id');
    const watchedStartTime = watch('override_start_time');
    const watchedEndTime = watch('override_end_time');

    const isRestDaySelected = watchedPatternId === null;

    const onSubmit = async (formData: SlotFormData) => {
        const payload: SlotUpdatePayload = {
            work_pattern_id: formData.work_pattern_id,
            override_start_time: formData.work_pattern_id === null ? null : formData.override_start_time,
            override_end_time: formData.work_pattern_id === null ? null : formData.override_end_time,
        };
        try {
            await updateSlotMutation.mutateAsync({ shiftScheduleId, scheduleSlotId: slot.id, payload });
            setIsEditing(false);
        } catch (error) { console.error("Update failed:", error); }
    };

    const handleCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    const selectedPattern = availablePatterns.find(p => p.id === watchedPatternId);

    // مقادیر نمایشی
    const displayStart = isEditing
        ? (watchedStartTime || selectedPattern?.start_time)
        : (slot.override_start_time || slot.work_pattern?.start_time);

    const displayEnd = isEditing
        ? (watchedEndTime || selectedPattern?.end_time)
        : (slot.override_end_time || slot.work_pattern?.end_time);

    const { isNextDay, duration } = calculateShiftInfo(displayStart, displayEnd);
    const readOnlyPatternName = slot.work_pattern ? slot.work_pattern.name : 'استراحت';
    const isSubmitting = updateSlotMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={clsx(
            "contents text-sm",
            isEditing ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
        )} noValidate>

            {/* ستون ۱: روز چرخه */}
            <div className="p-4 flex items-center justify-center border-l border-borderL/50 dark:border-borderD/50">
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-foregroundL dark:text-foregroundD font-bold border border-borderL dark:border-borderD">
                        {toPersianDigits(slot.day_in_cycle)}
                    </span>
                </div>
            </div>

            {/* ستون ۲: الگوی کاری */}
            <div className="p-3 flex items-center border-l border-borderL/50 dark:border-borderD/50">
                {isEditing ? (
                    <div className="w-full">
                        <Controller
                            name="work_pattern_id"
                            control={control}
                            render={({ field }) => (
                                <SelectBox
                                    label=""
                                    placeholder="انتخاب الگو"
                                    options={allOptions}
                                    value={allOptions.find(opt => opt.id === field.value) || null}
                                    onChange={(option) => {
                                        const newVal = option ? (option.id as number | null) : null;
                                        field.onChange(newVal);
                                        if (newVal === null) {
                                            setValue('override_start_time', null, { shouldDirty: true });
                                            setValue('override_end_time', null, { shouldDirty: true });
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
                            slot.work_pattern_id === null ? "bg-amber-400 ring-amber-200" : "bg-indigo-500 ring-indigo-200"
                        )} />
                        <span className={clsx(
                            "font-medium",
                            slot.work_pattern_id === null ? 'text-amber-700 dark:text-amber-500' : 'text-foregroundL dark:text-foregroundD'
                        )}>
                            {readOnlyPatternName}
                        </span>
                    </div>
                )}
            </div>

            {/* ستون ۳: شروع */}
            <div className="p-3 flex items-center justify-center border-l border-borderL/50 dark:border-borderD/50">
                {isEditing ? (
                    <Controller name="override_start_time" control={control} render={({ field }) => (
                        <CustomTimeInput
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={isSubmitting || isRestDaySelected}
                            className={clsx(
                                "text-center dir-ltr transition-all h-9 bg-white dark:bg-black/20",
                                isRestDaySelected && "opacity-40 cursor-not-allowed"
                            )}
                            placeholder={selectedPattern?.start_time?.slice(0, 5) || "--:--"}
                        />
                    )} />
                ) : (
                    <span className={clsx(" text-base dark:text-backgroundL-500", !displayStart && "text-muted-foregroundL opacity-30")}>
                        {displayStart ? toPersianDigits(displayStart.slice(0, 5)) : '---'}
                    </span>
                )}
            </div>

            {/* ستون ۴: پایان */}
            <div className="p-3 flex items-center justify-center border-l border-borderL/50 dark:border-borderD/50 relative">
                {isEditing ? (
                    <div className="relative w-full">
                        <Controller name="override_end_time" control={control} render={({ field }) => (
                            <CustomTimeInput
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                disabled={isSubmitting || isRestDaySelected}
                                className={clsx(
                                    "text-center dir-ltr transition-all h-9 bg-white dark:bg-black/20",
                                    isRestDaySelected && "opacity-40 cursor-not-allowed",
                                    !isRestDaySelected && isNextDay && "border-indigo-400 ring-1 ring-indigo-100"
                                )}
                                placeholder={selectedPattern?.end_time?.slice(0, 5) || "--:--"}
                            />
                        )} />
                        {isNextDay && !isRestDaySelected && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 z-10 whitespace-nowrap">
                                <Moon className="w-2.5 h-2.5" /> فردای کاری
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 relative">
                        <span className={clsx(" text-base dark:text-backgroundL-500", !displayEnd && "text-muted-foregroundL opacity-30")}>
                            {displayEnd ? toPersianDigits(displayEnd.slice(0, 5)) : '---'}
                        </span>
                        {isNextDay && !isRestDaySelected && (
                            <span title="پایان در روز بعد" className="flex items-center justify-center w-5 h-5 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-700 dark:text-indigo-300">
                                <Moon className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ستون ۵: وضعیت/مدت */}
            <div className="p-3 flex items-center justify-center border-l border-borderL/50 dark:border-borderD/50">
                {!isRestDaySelected && duration ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{duration}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200/50 dark:border-amber-800/30">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>استراحت</span>
                    </div>
                )}
            </div>

            {/* ستون ۶: عملیات */}
            <div className="p-3 flex items-center justify-center gap-2">
                {isEditing ? (
                    <>
                        <Button type="submit" size="icon" className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-md" disabled={!isDirty || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700" onClick={handleCancel} disabled={isSubmitting}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-muted-foregroundL dark:text-backgroundL-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all "
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </form>
    );
};