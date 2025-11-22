import React, { useState } from 'react';
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
} from '../schema/GenerateShiftsSchema';
// ✅ ایمپورت حالا صحیح کار می‌کند چون هوک در فایل بالا اکسپورت شده است
import { useGenerateShifts } from '../hooks/useCreateShiftSchedule'; 
import { AxiosError } from 'axios';
import { type ApiValidationError } from '@/features/work-pattern/types';
import { AlertTriangle, CalendarRange, CheckCircle2 } from 'lucide-react';

import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface GenerateShiftsFormProps {
    shiftScheduleId: number | string;
    shiftScheduleName: string;
    onClose: () => void;
}

export const GenerateShiftsForm: React.FC<GenerateShiftsFormProps> = ({
    shiftScheduleId,
    shiftScheduleName,
    onClose,
}) => {
    // استیت برای نمایش مودال تایید نهایی (Danger Modal)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [validFormData, setValidFormData] = useState<GenerateShiftsFormData | null>(null);

    // استفاده از هوک جدید
    const { mutate, isPending, error: mutationError } = useGenerateShifts();

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

    // مرحله ۱: سابمیت اولیه فرم (فقط اعتبارسنجی کلاینت)
    const onFormSubmit = (data: GenerateShiftsFormData) => {
        setValidFormData(data);
        setShowConfirmation(true); // باز کردن مدال خطر
    };

    // مرحله ۲: تایید نهایی و ارسال به سرور
    const handleFinalConfirm = () => {
        if (!validFormData) return;

        const payload = {
            start_date: validFormData.start_date,
            end_date: validFormData.end_date,
        };

        mutate(
            { id: shiftScheduleId, payload },
            {
                onSuccess: () => {
                    setShowConfirmation(false);
                    onClose();
                },
                onError: (error: any) => {
                    setShowConfirmation(false);
                    
                    // مدیریت خطای ۴۲۲ (Validation) سمت سرور
                    if (error instanceof AxiosError && error.response?.status === 422) {
                        const apiErrors = (error as AxiosError<ApiValidationError>).response?.data.errors;
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
                },
            }
        );
    };

    // پیام خطای عمومی (غیر از ۴۲۲)
    const generalApiError =
        mutationError &&
        (mutationError as AxiosError)?.response?.status !== 422
            ? (mutationError as AxiosError<{ message: string }>)?.response?.data?.message || 'خطای ناشناخته ای رخ داد.'
            : null;

    return (
        <>
            {/* --- فرم اصلی (انتخاب تاریخ) --- */}
            <DialogContent className="max-w-lg overflow-visible" onClose={onClose}>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primaryL dark:text-primaryD mb-2">
                        <CalendarRange className="w-6 h-6" />
                        <DialogTitle>تولید و تخصیص خودکار شیفت‌ها</DialogTitle>
                    </div>
                    <DialogDescription>
                        لطفاً بازه زمانی مورد نظر برای تولید شیفت را مشخص کنید.
                        <br />
                        این عملیات برای برنامه 
                        <span className="font-bold text-foregroundL dark:text-foregroundD mx-1">«{shiftScheduleName}»</span>
                        اجرا خواهد شد.
                    </DialogDescription>
                </DialogHeader>

                {generalApiError && (
                    <Alert variant="destructive" className="mx-1 mt-2">
                        <AlertTitle>خطا در پردازش</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} noValidate dir="rtl" className="space-y-6 py-4">
                    <div className="space-y-4 px-1">
                        <Controller
                            name="start_date"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <PersianDatePickerInput
                                    label="تاریخ شروع بازه"
                                    placeholder="انتخاب تاریخ..."
                                    disabled={isPending}
                                    error={error?.message}
                                    value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                    onChange={(dateObject) => {
                                        const val = dateObject ? dateObject.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : '';
                                        field.onChange(val);
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="end_date"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <PersianDatePickerInput
                                    label="تاریخ پایان بازه"
                                    placeholder="انتخاب تاریخ..."
                                    disabled={isPending}
                                    error={error?.message}
                                    value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                    onChange={(dateObject) => {
                                        const val = dateObject ? dateObject.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : '';
                                        field.onChange(val);
                                    }}
                                />
                            )}
                        />
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg flex gap-3 items-start text-sm text-blue-700 dark:text-blue-300">
                           <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                           <p>
                               سیستم به صورت هوشمند روزهای تعطیل و استراحت را بر اساس تنظیمات الگوی «{shiftScheduleName}» محاسبه خواهد کرد.
                           </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            انصراف
                        </Button>
                        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                            بررسی و ادامه
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* --- مدال هشدار و تایید نهایی (Danger Modal) --- */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleFinalConfirm}
                title="هشدار جدی: تولید انبوه شیفت"
                variant="danger"
                confirmText={isPending ? 'در حال پردازش...' : 'بله، مطمئن هستم و تولید کن'}
                cancelText="بازگشت و ویرایش"
                icon={<AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />}
                message={
                    <div className="space-y-3 leading-relaxed">
                        <p className="font-bold text-foregroundL dark:text-foregroundD">
                            آیا از تولید شیفت برای این بازه زمانی مطمئن هستید؟
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foregroundL dark:text-muted-foregroundD bg-secondaryL/30 dark:bg-secondaryD/30 p-3 rounded-md border border-borderL dark:border-borderD">
                            <li>این عملیات برای <strong>همه کارمندان</strong> متصل به این الگو اعمال می‌شود.</li>
                            <li>شیفت‌های قبلی در این بازه زمانی ممکن است <strong>بازنویسی</strong> شوند.</li>
                            <li>عملیات در پس‌زمینه انجام شده و ممکن است چند دقیقه طول بکشد (نتیجه از طریق نوتیفیکیشن اعلام می‌شود).</li>
                        </ul>
                    </div>
                }
            />
        </>
    );
};