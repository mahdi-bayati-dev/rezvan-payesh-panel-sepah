import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import {
    type GenerateShiftsFormData,
    generateShiftsSchema,
} from '../schema/GenerateShiftsSchema'; // ✅ استفاده از مسیر نسبی
import { useGenerateShifts } from '../hooks/hook'; // ✅ استفاده از مسیر نسبی
import { AxiosError } from 'axios';
import { type ApiValidationError } from '@/features/work-pattern/types';
import { Loader2 } from 'lucide-react';

// --- ابزارهای تقویم ---
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';

interface GenerateShiftsFormProps {
    shiftScheduleId: number | string;
    onClose: () => void;
}

export const GenerateShiftsForm: React.FC<GenerateShiftsFormProps> = ({
    shiftScheduleId,
    onClose,
}) => {
    // ۱. هوک Mutation برای ارسال درخواست
    const {
        mutate,
        isPending,
        error: mutationError,
    } = useGenerateShifts();

    // ۲. راه‌اندازی React Hook Form
    // ✅✅✅ رفع خطای TS6133: متغیر formErrors حذف شد چون استفاده نمی‌شد
    const {
        control,
        handleSubmit,
        setError: setFormError,
    } = useForm<GenerateShiftsFormData>({
        resolver: zodResolver(generateShiftsSchema),
        defaultValues: {
            start_date: '',
            end_date: '',
        },
        mode: 'onTouched',
    });

    // ۳. تابع onSubmit
    const onSubmit: (data: GenerateShiftsFormData) => void = (data) => {

        // پِی‌لود بر اساس مستندات API آماده می‌شود
        const payload = {
            start_date: data.start_date,
            end_date: data.end_date,
        };

        mutate(
            { id: shiftScheduleId, payload },
            {
                onSuccess: () => {
                    // در صورت موفقیت (جاب در صف قرار گرفت)، مودال را می‌بندیم
                    onClose();
                    // پیغام toast موفقیت توسط خود هوک (useGenerateShifts) نمایش داده می‌شود
                },
                onError: (error) => {
                    // مدیریت خطاهای اعتبarsنجی 422 از سمت سرور
                    if (error instanceof AxiosError && error.response?.status === 422) {
                        const apiErrors = (error as AxiosError<ApiValidationError>).response
                            ?.data.errors;
                        if (apiErrors) {
                            Object.entries(apiErrors).forEach(([field, messages]) => {
                                const fieldName = field as keyof GenerateShiftsFormData;
                                try {
                                    setFormError(fieldName, {
                                        type: 'server',
                                        message: messages[0],
                                    });
                                } catch (e) {
                                    console.error('Error setting form error:', field, e);
                                }
                            });
                        }
                    }
                    // سایر خطاها توسط هوک مدیریت می‌شوند (toast.error)
                },
            }
        );
    };

    // مدیریت خطای عمومی (غیر از 422)
    const generalApiError =
        mutationError &&
            (mutationError as AxiosError)?.response?.status !== 422
            ? (mutationError as AxiosError<{ message: string }>)?.response?.data
                ?.message || 'خطای ناشناخته ای رخ داد.'
            : null;

    return (
        <DialogContent
            // --- ✅✅✅ اصلاح کلیدی برای رفع مشکل جا نشدن تقویم ---
            // ۱. عرض مودال رو کمی بیشتر کردم (lg -> xl)
            // ۲. مهم‌تر: overflow-visible رو اضافه کردم تا پاپ‌آپ تقویم بریده نشه
            className="max-w-xl overflow-visible"
            onClose={onClose} // ✅ پراپ onClose برای دکمه 'X' پاس داده شد
        >
            <DialogHeader>
                <DialogTitle>تولید و تخصیص شیفت‌ها</DialogTitle>
                <DialogDescription>
                    بازه زمانی مورد نظر برای تولید شیفت‌های کارمندان بر اساس این الگو را
                    انتخاب کنید.
                    <br />
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                        توجه: این عملیات ممکن است چند دقیقه طول بکشد.
                    </span>
                </DialogDescription>
            </DialogHeader>

            {generalApiError && (
                <Alert variant="destructive" className="mx-6">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{generalApiError}</AlertDescription>
                </Alert>
            )}

            {/* ✅✅✅ پراپ dir="rtl" به تگ فرم منتقل شد */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">
                <div className="space-y-4 py-4 px-6">
                    <Controller
                        name="start_date"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <PersianDatePickerInput
                                label="تاریخ شروع بازه"
                                placeholder="یک تاریخ انتخاب کنید..."
                                disabled={isPending}
                                error={error?.message}
                                // --- ✅✅✅ رفع خطای Syntax Error (...) ---
                                // کد ناقص تکمیل شد
                                value={
                                    field.value
                                        ? new DateObject({ date: field.value, calendar: gregorian })
                                        : null
                                }
                                onChange={(dateObject) => {
                                    const formattedString = dateObject
                                        ? dateObject.convert(gregorian, gregorian_en).format('YYYY-MM-DD')
                                        : '';
                                    field.onChange(formattedString);
                                }}
                            // --- پایان اصلاح ---
                            />
                        )}
                    />

                    <Controller
                        name="end_date"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <PersianDatePickerInput
                                label="تاریخ پایان بازه"
                                placeholder="یک تاریخ انتخاب کنید..."
                                disabled={isPending}
                                error={error?.message}
                                value={
                                    field.value
                                        ? new DateObject({ date: field.value, calendar: gregorian })
                                        : null
                                }
                                onChange={(dateObject) => {
                                    const formattedString = dateObject
                                        ? dateObject.convert(gregorian, gregorian_en).format('YYYY-MM-DD')
                                        : '';
                                    field.onChange(formattedString);
                                }}
                            />
                        )}
                    />
                </div>

                <DialogFooter className="flex gap-2 ">
                    <Button type="submit" disabled={isPending}>
                        {isPending && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                        {isPending ? 'در حال ارسال درخواست...' : 'شروع عملیات تولید'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={onClose}
                    >
                        لغو
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};