import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, X, Edit } from 'lucide-react'; // ✅ ایمپورت آیکون Edit

import SelectBox, { type SelectOption } from '@/components/ui/SelectBox'; // ✅ G: 'SelectBox' -> 'selectBox'
import Input from '@/components/ui/Input'; // ✅ G: 'Input' -> 'input'
import { Button } from '@/components/ui/Button'; // ✅ G: 'Button' -> 'button'
import { useUpdateScheduleSlot } from '../hooks/hook'; // ✅ G: Relative path
import {
    type ScheduleSlotResource,
    type WorkPatternBase,
    type SlotUpdatePayload
} from '../types'; // ✅ G: Relative path
import clsx from 'clsx'; // ✅ ایمپورت clsx

// --- ۱. Schema برای اعتبارسنجی فیلدهای یک اسلات ---
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const slotSchema = z.object({
    work_pattern_id: z.number().nullable().optional(),
    override_start_time: z.string().nullable().optional(),
    override_end_time: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    const start = data.override_start_time;
    const end = data.override_end_time;

    // کامنت: فقط اگر هر دو مقدار وجود داشتند، اعتبارسنجی کن
    if (start && end) {
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "فرمت نامعتبر", path: ['override_end_time'] });
            return;
        }

        const [startHours, startMinutes] = start.split(":").map(Number);
        const [endHours, endMinutes] = end.split(":").map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        let endTimeInMinutes = endHours * 60 + endMinutes;

        // کامنت: برای شیفت‌های شبانه
        if (endTimeInMinutes < startTimeInMinutes) {
            endTimeInMinutes += 24 * 60;
        }

        if (endTimeInMinutes <= startTimeInMinutes) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "پایان باید بعد از شروع باشد", path: ['override_end_time'] });
        }
    }
    // کامنت: اگر یکی بود و دیگری نبود (اختیاری)
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

/**
 * کامپوننت یک ردیف در جدول اسلات‌های برنامه شیفتی (قابلیت ویرایش Inline)
 */
export const ScheduleSlotRow: React.FC<ScheduleSlotRowProps> = ({
    slot,
    shiftScheduleId,
    availablePatterns,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateSlotMutation = useUpdateScheduleSlot();

    // تبدیل لیست الگوهای اتمی به SelectOption
    const patternOptions: SelectOption[] = useMemo(() =>
        availablePatterns.map(p => ({ id: p.id, name: p.name })),
        [availablePatterns]
    );

    // افزودن گزینه 'روز استراحت' (null)
    const allOptions: SelectOption[] = useMemo(() => [
        { id: null as any, name: 'روز استراحت (Off)' },
        ...patternOptions
    ], [patternOptions]);


    // --- مقادیر پیش‌فرض ---
    const defaultValues: SlotFormData = useMemo(() => ({
        work_pattern_id: slot.work_pattern_id,
        override_start_time: slot.override_start_time,
        override_end_time: slot.override_end_time,
    }), [slot]);

    // --- راه‌اندازی React Hook Form ---
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<SlotFormData>({
        resolver: zodResolver(slotSchema),
        defaultValues,
    });

    // --- مشاهده فیلدها ---
    const watchedPatternId = watch('work_pattern_id');
    const isRestDay = watchedPatternId === null;

    // ✅ بهبود منطقی/UX:
    // هرگاه کاربر "روز استراحت" را انتخاب کرد، فیلدهای override را بلافاصله پاک کن
    useEffect(() => {
        if (isRestDay) {
            setValue('override_start_time', null, { shouldDirty: true });
            setValue('override_end_time', null, { shouldDirty: true });
        }
    }, [isRestDay, setValue]);


    // --- مدیریت Submit ---
    const onSubmit = (formData: SlotFormData) => {
        const payload: SlotUpdatePayload = {
            work_pattern_id: formData.work_pattern_id, // قبلاً null شده
            override_start_time: formData.override_start_time,
            override_end_time: formData.override_end_time,
        };

        // کامنت: اگر روز استراحت باشد، مقادیر override باید null ارسال شوند (این کار در useEffect هم انجام شد)
        if (isRestDay) {
            payload.override_start_time = null;
            payload.override_end_time = null;
        }

        updateSlotMutation.mutate(
            {
                shiftScheduleId,
                scheduleSlotId: slot.id,
                payload,
            },
            {
                onSuccess: (updatedSlot) => {
                    // کامنت: پس از آپدیت موفقیت‌آمیز، فرم را ریست می‌کنیم تا isDirty از بین برود
                    reset({
                        work_pattern_id: updatedSlot.work_pattern_id,
                        override_start_time: updatedSlot.override_start_time,
                        override_end_time: updatedSlot.override_end_time,
                    });
                    setIsEditing(false);
                },
                // کامنت: مدیریت خطا در هوک useUpdateScheduleSlot انجام می‌شود
            }
        );
    };

    // --- مدیریت لغو ---
    const handleCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    const isSubmitting = updateSlotMutation.isPending;
    const dayInCycle = slot.day_in_cycle;

    // --- مقادیر نمایشی (برای حالت غیر ویرایش) ---
    const displayPatternName = slot.work_pattern_name || 'استراحت';
    const displayStartTime = slot.override_start_time;
    const displayEndTime = slot.override_end_time;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="contents" noValidate>
            <div className="contents text-sm text-center">
                {/* ستون ۱: روز در چرخه */}
                <div className="p-3 border-r border-borderL dark:border-borderD flex justify-center items-center font-medium text-foregroundL dark:text-foregroundD">
                    {dayInCycle}
                </div>

                {/* ستون ۲: الگوی کاری */}
                <div className="p-2 border-r border-borderL dark:border-borderD text-right">
                    {isEditing ? (
                        <div>
                            <SelectBox
                                label=""
                                placeholder="انتخاب الگو"
                                options={allOptions}
                                value={allOptions.find(opt => opt.id === watchedPatternId) || null}
                                onChange={(option) => setValue('work_pattern_id', option ? (option.id as number | null) : null, { shouldDirty: true })}
                                disabled={isSubmitting}
                            />
                            {/* ✅ نمایش خطا برای SelectBox */}
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

                {/* ستون ۳: شروع Override */}
                <div className="p-2 border-r border-borderL dark:border-borderD">
                    {isEditing ? (
                        <Input
                            label=""
                            type="time"
                            dir='ltr' // ✅ برای تایم بهتر است ltr باشد
                            {...register('override_start_time')}
                            error={errors.override_start_time?.message}
                            disabled={isSubmitting || isRestDay}
                            className={clsx("w-full", isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800")} // ✅ حذف text-xs
                        />
                    ) : (
                        <span className={clsx(!displayStartTime && "text-muted-foregroundL dark:text-muted-foregroundD")}>
                            {displayStartTime || '---'}
                        </span>
                    )}
                </div>

                {/* ستون ۴: پایان Override */}
                <div className="p-2 border-r border-borderL dark:border-borderD">
                    {isEditing ? (
                        <Input
                            label=""
                            type="time"
                            dir='ltr' // ✅
                            {...register('override_end_time')}
                            error={errors.override_end_time?.message}
                            disabled={isSubmitting || isRestDay}
                            className={clsx("w-full", isRestDay && "opacity-50 bg-stone-100 dark:bg-stone-800")} // ✅ حذف text-xs
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
                        // ✅ بهبود UI دکمه ویرایش
                        <Button type="button" size="icon" variant="outline" onClick={() => setIsEditing(true)} title="ویرایش">
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};

