/* reports/components/NewActivityRegistration/NewReportForm.tsx */
import { useState, useMemo } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    newReportSchema,
    type NewReportFormData,
} from '@/features/reports/Schema/newReportSchema';
import { Combobox } from '@headlessui/react';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { useEmployeeOptionsSearch } from '@/features/reports/hooks/hook';

const activityTypeOptions: SelectOption[] = [
    { id: 'check_in', name: 'ورود ' },
    { id: 'check_out', name: 'خروج ' },
];

const hourOptions: SelectOption[] = Array.from({ length: 24 }, (_, i) => ({
    id: String(i).padStart(2, '0'),
    name: String(i).padStart(2, '0'),
}));

const minuteOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i * 5).padStart(2, '0'),
    name: String(i * 5).padStart(2, '0'),
}));

interface NewReportFormProps {
    onSubmit: (data: NewReportFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export const NewReportForm = ({
    onSubmit,
    onCancel,
    isSubmitting,
}: NewReportFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NewReportFormData>({
        resolver: zodResolver(newReportSchema),
        defaultValues: {
            employee: null,
            date: null,
            time: '',
            remarks: '',
        },
    });

    const onFormSubmit: SubmitHandler<NewReportFormData> = (data) => {
        onSubmit(data);
    };

    const [employeeQuery, setEmployeeQuery] = useState('');
    const {
        data: employeeOptions,
        isLoading: isLoadingEmployees
    } = useEmployeeOptionsSearch(employeeQuery);

    const filteredEmployees = useMemo(() => {
        return employeeOptions || [];
    }, [employeeOptions]);


    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* --- Combobox کارمند --- */}
                <div className="md:col-span-2">
                    <Controller
                        name="employee"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Combobox
                                as="div"
                                className="relative"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                            >
                                <Combobox.Label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
                                    کارمند (جستجو کنید...)
                                </Combobox.Label>
                                <div className="relative">
                                    <Combobox.Input
                                        className={`w-full p-3 pr-10 border rounded-xl bg-backgroundL-500 dark:bg-backgroundD transition-colors
                                        ${fieldState.error
                                                ? 'border-destructiveL-foreground dark:border-destructiveD-foreground focus:ring-destructiveL-foreground'
                                                : 'border-borderL dark:border-borderD focus:ring-primaryL'
                                            }
                                        focus:outline-none focus:ring-2`}
                                        onChange={(event) => setEmployeeQuery(event.target.value)}
                                        displayValue={(employee: SelectOption) => employee?.name || ''}
                                        placeholder={isLoadingEmployees ? "در حال جستجو..." : "شروع به تایپ نام کارمند..."}
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
                                    bg-backgroundL-500 dark:bg-backgroundD py-1 shadow-lg ring-1
                                    ring-borderL dark:ring-borderD focus:outline-none">
                                    {isLoadingEmployees && employeeQuery.length > 1 && (
                                        <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                                            در حال جستجو...
                                        </div>
                                    )}
                                    {filteredEmployees.length === 0 && employeeQuery.length > 1 && !isLoadingEmployees && (
                                        <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                                            کارمندی یافت نشد.
                                        </div>
                                    )}
                                    {filteredEmployees.length === 0 && employeeQuery.length === 0 && !isLoadingEmployees && (
                                        <div className="relative cursor-default select-none py-2 px-4 text-muted-foregroundL dark:text-muted-foregroundD">
                                            برای جستجو، شروع به تایپ کنید...
                                        </div>
                                    )}
                                    {filteredEmployees.map((employee) => (
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
                                    ))}
                                </Combobox.Options>
                                {fieldState.error && (
                                    <p className="text-xs text-destructiveL-foreground dark:text-destructiveD-foreground mt-1">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </Combobox>
                        )}
                    />
                </div>

                {/* --- فیلد نوع فعالیت --- */}
                <div className="md:col-span-1">
                    <Controller
                        name="event_type"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SelectBox
                                label="نوع فعالیت"
                                options={activityTypeOptions}
                                value={activityTypeOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : undefined)}
                                placeholder="انتخاب کنید..."
                                error={fieldState.error?.message}
                                disabled={isSubmitting}
                            />
                        )}
                    />
                </div>

                {/* --- فیلد تاریخ --- */}
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


                {/* --- فیلد ساعت --- */}
                <div className="md:col-span-1">
                    <Controller
                        name="time"
                        control={control}
                        render={({ field, fieldState }) => {

                            const [currentHour = '', currentMinute = ''] = field.value?.split(':') || [];

                            const handleTimeChange = (part: 'hour' | 'minute', value: string | undefined) => {
                                let newHour = currentHour;
                                let newMinute = currentMinute;

                                if (part === 'hour') {
                                    newHour = value || '';
                                } else {
                                    newMinute = value || '';
                                }

                                if (newHour || newMinute) {
                                    field.onChange(`${newHour || '00'}:${newMinute || '00'}`);
                                } else {
                                    field.onChange('');
                                }
                            };

                            return (
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
                                        ساعت
                                    </label>
                                    <div className="flex gap-2">
                                        <SelectBox
                                            label=""
                                            options={hourOptions}
                                            value={hourOptions.find(opt => opt.id === currentHour) || null}
                                            onChange={(option) => handleTimeChange('hour', option ? String(option.id) : undefined)}
                                            placeholder="ساعت"
                                            disabled={isSubmitting}
                                            className="w-1/2"
                                        />
                                        <SelectBox
                                            label=""
                                            options={minuteOptions}
                                            value={minuteOptions.find(opt => opt.id === currentMinute) || null}
                                            onChange={(option) => handleTimeChange('minute', option ? String(option.id) : undefined)}
                                            placeholder="دقیقه"
                                            disabled={isSubmitting}
                                            className="w-1/2"
                                        />
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-xs text-destructiveL-foreground dark:text-destructiveD-foreground mt-1">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>


                {/* --- فیلد ملاحظات --- */}
                <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">ملاحظات (دلیل ثبت دستی)</label>
                    <Textarea
                        label=''
                        id="remarks"
                        {...register('remarks')}
                        rows={3}
                        disabled={isSubmitting}
                        className={`w-full p-3 border rounded-xl bg-backgroundL-500 dark:bg-backgroundD
                        ${errors.remarks ? 'border-destructiveL-foreground dark:border-destructiveD-foreground focus:ring-destructiveL-foreground' : 'border-borderL dark:border-borderD focus:ring-primaryL'}
                        focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="مثال: فراموشی ثبت ورود در زمان مقرر"
                    />
                    {errors.remarks && <p className="text-xs text-destructiveL-foreground dark:text-destructiveD-foreground mt-1">{errors.remarks.message}</p>}
                </div>
            </div>

            {/* --- دکمه‌ها --- */}
            <div className="flex justify-start gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
                <Button
                    variant='primary'
                    type="submit"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium
                      bg-secondaryL text-secondary-foregroundL
                      dark:bg-secondaryD dark:text-secondary-foregroundD
                      hover:bg-secondaryL/80 dark:hover:bg-secondaryD/80
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    لغو
                </Button>
            </div>
        </form>
    );
};