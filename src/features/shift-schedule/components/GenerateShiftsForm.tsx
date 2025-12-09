import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// ✅ استفاده از کامپوننت‌های Modal خودتان
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { type GenerateShiftsFormData, generateShiftsSchema } from '../schema/GenerateShiftsSchema';
import { useGenerateShifts } from '../hooks/useCreateShiftSchedule';
import { AxiosError } from 'axios';
import { type ApiValidationError } from '@/features/work-pattern/types';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface GenerateShiftsFormProps {
    isOpen: boolean; // ✅ پراپ جدید برای کنترل نمایش مودال
    shiftScheduleId: number | string;
    shiftScheduleName: string;
    onClose: () => void;
}

export const GenerateShiftsForm: React.FC<GenerateShiftsFormProps> = ({
    isOpen, shiftScheduleId, shiftScheduleName, onClose,
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [validFormData, setValidFormData] = useState<GenerateShiftsFormData | null>(null);
    const { mutate, isPending, error: mutationError } = useGenerateShifts();

    const { control, handleSubmit, setError: setFormError } = useForm<GenerateShiftsFormData>({
        resolver: zodResolver(generateShiftsSchema),
        defaultValues: { start_date: '', end_date: '' },
        mode: 'onTouched',
    });

    const onFormSubmit = (data: GenerateShiftsFormData) => {
        setValidFormData(data);
        setShowConfirmation(true);
    };

    const handleFinalConfirm = () => {
        if (!validFormData) return;
        const payload = { start_date: validFormData.start_date, end_date: validFormData.end_date };

        mutate({ id: shiftScheduleId, payload }, {
            onSuccess: () => { setShowConfirmation(false); onClose(); },
            onError: (error: any) => {
                setShowConfirmation(false);
                if (error instanceof AxiosError && error.response?.status === 422) {
                    const apiErrors = (error as AxiosError<ApiValidationError>).response?.data.errors;
                    if (apiErrors) {
                        Object.entries(apiErrors).forEach(([field, messages]) => {
                            try {
                                setFormError(field as keyof GenerateShiftsFormData, { type: 'server', message: messages[0] });
                            } catch (e) { console.error('Error setting form error:', field, e); }
                        });
                    }
                }
            },
        });
    };

    const generalApiError = mutationError && (mutationError as AxiosError)?.response?.status !== 422
        ? (mutationError as AxiosError<{ message: string }>)?.response?.data?.message || 'خطای ناشناخته ای رخ داد.'
        : null;

    return (
        <>
            {/* ✅ استفاده از کامپوننت Modal اختصاصی پروژه */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalHeader onClose={onClose}>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                            <CalendarClock className="w-5 h-5 text-primaryL dark:text-primaryD" />
                            <span className="font-bold text-lg">تولید تقویم کاری</span>
                        </div>
                        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD font-normal mt-1">
                            انتخاب بازه برای الگوی <span className="font-bold text-primaryL dark:text-primaryD">«{shiftScheduleName}»</span>
                        </p>
                    </div>
                </ModalHeader>

                <ModalBody>
                    {generalApiError && (
                        <Alert variant="destructive" className="mb-6 text-xs shadow-sm bg-destructiveL-background dark:bg-destructiveD-background text-destructiveL-foreground"><AlertDescription>{generalApiError}</AlertDescription></Alert>
                    )}

                    <form onSubmit={handleSubmit(onFormSubmit)} noValidate dir="rtl" className="space-y-6">

                        {/* گرید برای اینپوت‌های تاریخ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                            <div className="space-y-1">
                                <Controller
                                    name="start_date"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <PersianDatePickerInput
                                            label="از تاریخ"
                                            placeholder="شروع..."
                                            disabled={isPending}
                                            error={error?.message}
                                            value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                            onChange={(d) => field.onChange(d ? d.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : '')}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <Controller
                                    name="end_date"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <PersianDatePickerInput
                                            label="تا تاریخ"
                                            placeholder="پایان..."
                                            disabled={isPending}
                                            error={error?.message}
                                            value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}
                                            onChange={(d) => field.onChange(d ? d.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : '')}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* باکس راهنما */}
                        <div className="bg-infoL-background dark:bg-infoD-background border border-infoL-foreground/20 dark:border-infoD-foreground/20 p-4 rounded-xl flex gap-3 items-start text-xs text-infoL-foreground dark:text-infoD-foreground shadow-sm">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="leading-6 opacity-90">
                                سیستم به صورت هوشمند روزهای تعطیل و استراحت را بر اساس تنظیمات الگو محاسبه کرده و برای <strong>تمام پرسنل متصل</strong> شیفت ایجاد می‌کند.
                            </p>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t border-borderL dark:border-borderD">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                variant="primary"
                                className="w-full sm:w-auto shadow-lg shadow-primaryL/20 dark:shadow-none"
                            >
                                {isPending ? 'در حال بررسی...' : 'بررسی و تولید'}
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>

            {/* مودال تایید نهایی */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleFinalConfirm}
                title="تایید نهایی تولید شیفت"
                variant="danger"
                confirmText={isPending ? 'در حال پردازش...' : 'تایید و تولید'}
                cancelText="بازگشت"
                icon={<AlertTriangle className="h-10 w-10 text-warningL-foreground" />}
                message={
                    <div className="space-y-3 text-sm leading-relaxed">
                        <p className="font-bold text-foregroundL dark:text-foregroundD">آیا از تولید شیفت برای بازه انتخابی اطمینان دارید؟</p>
                        <ul className="list-disc list-inside text-muted-foregroundL dark:text-muted-foregroundD space-y-1 bg-secondaryL/30 dark:bg-secondaryD/20 p-3 rounded-lg border border-borderL dark:border-borderD">
                            <li>شیفت‌های قبلی در این بازه <strong>بازنویسی</strong> خواهند شد.</li>
                            <li>این عملیات ممکن است چند لحظه زمان ببرد.</li>
                        </ul>
                    </div>
                }
            />
        </>
    );
};