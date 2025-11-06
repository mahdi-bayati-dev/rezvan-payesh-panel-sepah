import { useState, useMemo } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    newReportSchema,
    type NewReportFormData,
} from '@/features/reports/Schema/newReportSchema'; // مسیر alias

// 1. ایمپورت Combobox
import { Combobox } from '@headlessui/react';

// 2. ایمپورت کامپوننت‌ها و آیکون‌های لازم
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox'; // مسیر alias
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput'; // مسیر alias
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';

// گزینه‌های نوع فعالیت (برمی‌گردانیم به check-in/check-out چون سرور فقط از timestamp ایراد گرفت)
const activityTypeOptions: SelectOption[] = [
    { id: 'check_in', name: 'ورود ' },
    { id: 'check_out', name: 'خروج ' },
];

interface NewReportFormProps {
    onSubmit: (data: NewReportFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    employeeOptions: SelectOption[];
    isLoadingEmployees: boolean;
}

export const NewReportForm = ({
    onSubmit,
    onCancel,
    isSubmitting,
    employeeOptions,
    isLoadingEmployees,
}: NewReportFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NewReportFormData>({
        resolver: zodResolver(newReportSchema),
        // [اصلاحیه] برای رفع هشدار Uncontrolled
        defaultValues: {
            employee: null,
            // [رفع خطا ۱ و ۲] - حذف event_type: ''
            // با حذف این فیلد، react-hook-form به طور پیش‌فرض
            // مقدار 'undefined' را برای آن در نظر می‌گیرد.
            // این کار تضاد تایپ ('' در مقابل "check_in") را حل می‌کند.
            date: null,
            time: '',
            remarks: '',
        },
    });

    const onFormSubmit: SubmitHandler<NewReportFormData> = (data) => {
        console.log("====> ", data); // لاگ برای بررسی دیتای فرم
        onSubmit(data);
    };

    // ... (کد Combobox کارمندان بدون تغییر) ...
    const [employeeQuery, setEmployeeQuery] = useState('');
    const filteredEmployees = useMemo(() => {
        const query = employeeQuery.toLowerCase().trim();
        if (query === '') {
            return employeeOptions;
        }
        return employeeOptions.filter((employee) =>
            employee.name.toLowerCase().includes(query)
        );
    }, [employeeOptions, employeeQuery]);


    return (
        // [رفع خطا ۲] - با اصلاح defaultValues، این handleSubmit دیگر خطا نمی‌دهد
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* --- Combobox کارمند (بدون تغییر) --- */}
                <div className="md:col-span-2">
                    <Controller
                        name="employee"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Combobox
                                as="div"
                                className="relative" // <-- افزودن relative به کانتینر
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isLoadingEmployees || isSubmitting}
                            >
                                <Combobox.Label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
                                    کارمند (جستجو کنید...)
                                </Combobox.Label>
                                <div className="relative">
                                    <Combobox.Input
                                        className={`w-full p-3 pr-10 border rounded-xl bg-backgroundL-DEFAULT dark:bg-backgroundD-800 transition-colors
                                        ${fieldState.error
                                                ? 'border-destructiveL dark:border-destructiveD focus:ring-destructiveL'
                                                : 'border-borderL dark:border-borderD focus:ring-primaryL'
                                            }
                                        focus:outline-none focus:ring-2`}
                                        onChange={(event) => setEmployeeQuery(event.target.value)}
                                        displayValue={(employee: SelectOption) => employee?.name || ''}
                                        placeholder={isLoadingEmployees ? "در حال بارگذاری لیست..." : "شروع به تایپ نام کارمند..."}
                                        autoComplete="off"
                                    />
                                    <Combobox.Button className="absolute inset-y-0 left-0 flex items-center px-3 text-muted-foregroundL dark:text-muted-foregroundD">
                                        {isLoadingEmployees ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ChevronsUpDown className="w-5 h-5" />
                                        )}
                                    </Combobox.Button>
                                </div>

                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl
                                    bg-backgroundL-500 dark:bg-backgroundD-900 py-1 shadow-lg ring-1
                                    ring-black/5 dark:ring-white/10 focus:outline-none">
                                    {isLoadingEmployees ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                                            در حال بارگذاری...
                                        </div>
                                    ) : filteredEmployees.length === 0 && employeeQuery !== '' ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                                            کارمندی یافت نشد.
                                        </div>
                                    ) : (
                                        filteredEmployees.map((employee) => (
                                            <Combobox.Option
                                                key={employee.id}
                                                value={employee}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4
                                                    ${active ? 'bg-primaryL/10 text-primaryL dark:bg-primaryD/10 dark:text-primaryD' : 'text-foregroundL dark:text-foregroundD'}`
                                                }
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                }`}
                                                        >
                                                            {employee.name}
                                                        </span>
                                                        {selected ? (
                                                            <span
                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3
                                                                ${active ? 'text-primaryL dark:text-primaryD' : 'text-primaryL dark:text-primaryD'
                                                                    }`}
                                                            >
                                                                <Check className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Combobox.Option>
                                        ))
                                    )}
                                </Combobox.Options>
                                {fieldState.error && (
                                    <p className="text-xs text-destructiveL dark:text-destructiveD mt-1">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </Combobox>
                        )}
                    />
                </div>

                {/* --- فیلد نوع فعالیت) --- */}
                <div className="md:col-span-1">
                    <Controller
                        name="event_type"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SelectBox
                                label="نوع فعالیت"
                                options={activityTypeOptions}
                                value={activityTypeOptions.find(opt => opt.id === field.value) || null}
                                // [رفع خطا ۱ و ۲] - ارسال undefined بجای ''
                                // اگر '' ارسال شود، اعتبارسنجی z.enum (که '' را قبول ندارد) فیلد را نامعتبر می‌داند
                                onChange={(option) => field.onChange(option ? option.id : undefined)}
                                placeholder="انتخاب کنید..."
                                error={fieldState.error?.message}
                                disabled={isSubmitting}
                            />
                        )}
                    />
                </div>

                {/* --- فیلد تاریخ ا) --- */}
                <div className="md:col-span-1">
                    <Controller
                        name="date"
                        control={control}
                        render={({ field, fieldState }) => (
                            <PersianDatePickerInput
                                label="تاریخ"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                error={fieldState.error?.message}
                                placeholder="انتخاب تاریخ..."
                            />
                        )}
                    />
                </div>

                {/* --- فیلد ساعت ) --- */}
                <div className="md:col-span-1">
                    <label htmlFor="time" className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">ساعت (HH:mm)</label>
                    <Input
                        label=''
                        id="time"
                        type="time"
                        {...register('time')}
                        disabled={isSubmitting}
                        className={`w-full p-3 border rounded-xl bg-backgroundL-DEFAULT dark:bg-backgroundD-800
                        ${errors.time ? 'border-destructiveL dark:border-destructiveD focus:ring-destructiveL' : 'border-borderL dark:border-borderD focus:ring-primaryL'}
                        focus:outline-none focus:ring-2 transition-colors`}
                    />
                    {errors.time && <p className="text-xs text-destructiveL dark:text-destructiveD mt-1">{errors.time.message}</p>}
                </div>

                {/* --- فیلد ملاحظات ) --- */}
                <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">ملاحظات (دلیل ثبت دستی)</label>
                    <Textarea
                        label=''
                        id="remarks"
                        {...register('remarks')}
                        rows={3}
                        disabled={isSubmitting}
                        className={`w-full p-3 border rounded-xl bg-backgroundL-DEFAULT dark:bg-backgroundD-800
                        ${errors.remarks ? 'border-destructiveL dark:border-destructiveD focus:ring-destructiveL' : 'border-borderL dark:border-borderD focus:ring-primaryL'}
                        focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="مثال: فراموشی ثبت ورود در زمان مقرر"
                    />
                    {errors.remarks && <p className="text-xs text-destructiveL dark:text-destructiveD mt-1">{errors.remarks.message}</p>}
                </div>
            </div>

            {/* --- دکمه‌ها (بدون تغییر) --- */}
            <div className="flex justify-start gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
                <Button
                    variant='primary'
                    type="submit"
                    disabled={isSubmitting || isLoadingEmployees}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-md
                     bg-primaryL text-primary-foregroundL
                     dark:bg-primaryD dark:text-primary-foregroundD
                     hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? 'در حال ارسال...' : 'تایید'}
                </Button>
                <Button
                    variant='secondary'
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || isLoadingEmployees}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium
                     bg-backgroundL-700 text-foregroundL
                     dark:bg-backgroundD-700 dark:text-foregroundD
                     hover:bg-backgroundL-800 dark:hover:bg-backgroundD-800
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    لغو
                </Button>
            </div>
        </form>
    );
};