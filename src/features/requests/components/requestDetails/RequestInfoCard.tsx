// features/requests/components/requestDetails/RequestInfoCard.tsx

import { useState, useMemo, useEffect } from 'react';
import type { LeaveRequest, LeaveType } from "../../types";
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Save, X } from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { format, parseISO } from 'date-fns-jalali';
import gregorian from "react-date-object/calendars/gregorian";

import {
    useUpdateLeaveRequest,
    LEAVE_REQUESTS_QUERY_KEY
} from '../../hook/useLeaveRequests';
import { useLeaveTypes } from '../../hook/useLeaveTypes';
import { useQueryClient } from '@tanstack/react-query';

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import Checkbox from '@/components/ui/Checkbox';
import {
    requestInfoSchema,
    type RequestInfoFormData,
} from '../../schemas/requestInfoSchema';
import { toast } from 'react-toastify';
// ✅ ایمپورت تابع تبدیل اعداد
import { toPersianNumbers } from "@/features/requests/components/mainRequests/RequestsColumnDefs";

interface RequestInfoCardProps {
    request: LeaveRequest;
}

const mapLeaveTypesToOptions = (types: LeaveType[], prefix = ''): SelectOption[] => {
    let options: SelectOption[] = [];
    for (const type of types) {
        options.push({
            id: type.id,
            name: `${prefix} ${type.name}`,
        });
        if (type.children && type.children.length > 0) {
            options = options.concat(mapLeaveTypesToOptions(type.children, prefix + '—'));
        }
    }
    return options;
};

const isRequestFullDay = (startTime: string, endTime: string): boolean => {
    try {
        const startHour = parseISO(startTime).getHours();
        const endHour = parseISO(endTime).getHours();
        return startHour === 0 && endHour === 23;
    } catch {
        return false;
    }
};

// ✅ کامپوننت ReadOnlyInput اصلاح شده برای پشتیبانی از اعداد فارسی
const ReadOnlyInput = ({ label, value, containerClassName = 'opacity-90' }: { label: string; value: string; containerClassName?: string }) => (
    <Input
        label={label}
        // تبدیل اعداد ولیو به فارسی
        value={toPersianNumbers(value)}
        readOnly
        disabled
        containerClassName={containerClassName}
    />
);


export const RequestInfoCard = ({ request }: RequestInfoCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const {
        data: leaveTypesTree,
        isLoading: isLoadingLeaveTypes,
        isError: isErrorLeaveTypes,
    } = useLeaveTypes();


    const { leaveTypeOptions, categoryOptions } = useMemo(() => {
        const allTypes = leaveTypesTree ? mapLeaveTypesToOptions(leaveTypesTree) : [];
        const categories = leaveTypesTree
            ? leaveTypesTree.filter(lt => !lt.parent_id).map(lt => ({ id: lt.id, name: lt.name }))
            : [];
        return { leaveTypeOptions: allTypes, categoryOptions: categories };
    }, [leaveTypesTree]);


    const defaultValues = useMemo<RequestInfoFormData | undefined>(() => {
        if (!leaveTypesTree || leaveTypeOptions.length === 0) return undefined;

        const currentType = leaveTypeOptions.find(opt => opt.id === request.leave_type.id) || null;
        const currentCategory = categoryOptions.find(opt => opt.id === request.leave_type.parent_id) || null;

        const isoStartDate = parseISO(request.start_time);
        const isoEndDate = parseISO(request.end_time);

        const isFullDay = isRequestFullDay(request.start_time, request.end_time);

        const startTimePart = isFullDay ? '08:00' : format(isoStartDate, 'HH:mm');
        const endTimePart = isFullDay ? '17:00' : format(isoEndDate, 'HH:mm');

        return {
            requestType: currentType,
            category: currentCategory,
            startDate: new DateObject({ date: isoStartDate, calendar: persian, locale: persian_fa }),
            endDate: new DateObject({ date: isoEndDate, calendar: persian, locale: persian_fa }),
            isFullDay: isFullDay,
            startTime: startTimePart,
            endTime: endTimePart,
            description: request.reason || '',
        };
    }, [request, leaveTypesTree, leaveTypeOptions, categoryOptions]);


    const readOnlyCategoryName = useMemo(() => {
        if (!leaveTypesTree || !request.leave_type.parent_id) {
            return '---';
        }
        const category = categoryOptions.find(opt => opt.id === request.leave_type.parent_id);
        return category?.name || '---';

    }, [request.leave_type.parent_id, leaveTypesTree, categoryOptions]);


    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<RequestInfoFormData>({
        resolver: zodResolver(requestInfoSchema),
        defaultValues: defaultValues,
    });

    const isFullDayWatch = watch('isFullDay');

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);


    const updateMutation = useUpdateLeaveRequest();
    const isSubmitting = updateMutation.isPending;

    const formatToAPIPayload = (dateObj: DateObject, timeStr: string): string => {
        const gDate = dateObj.convert(gregorian);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const localDate = new Date(
            gDate.year,
            gDate.month.number - 1,
            gDate.day,
            hours,
            minutes,
            0
        );
        return localDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    const onSave: SubmitHandler<RequestInfoFormData> = async (data) => {
        if (!data.startDate || !data.endDate) {
            toast.error("تاریخ شروع و پایان الزامی است.");
            return;
        }

        let startTimePart = '00:00';
        let endTimePart = '23:59';

        if (!data.isFullDay) {
            startTimePart = data.startTime || '08:00';
            endTimePart = data.endTime || '17:00';
        }

        const payload = {
            leave_type_id: data.requestType!.id as number,
            start_time: formatToAPIPayload(data.startDate, startTimePart),
            end_time: formatToAPIPayload(data.endDate, endTimePart),
            reason: data.description || undefined,
        };

        updateMutation.mutate(
            { id: request.id, payload },
            {
                onSuccess: (updatedData) => {
                    setIsEditing(false);
                    queryClient.setQueryData(
                        [LEAVE_REQUESTS_QUERY_KEY, "detail", updatedData.data.id],
                        updatedData
                    );
                },
                onError: (error) => {
                    console.error(error);
                }
            }
        );
    };

    const onCancel = () => {
        if (defaultValues) {
            reset(defaultValues);
        }
        setIsEditing(false);
    };

    if (isLoadingLeaveTypes) {
        return <div className="flex justify-center items-center h-40"><Spinner text="در حال بارگذاری فرم..." /></div>;
    }
    if (isErrorLeaveTypes) {
        return <Alert variant="destructive"><AlertDescription>خطا در بارگذاری انواع مرخصی.</AlertDescription></Alert>;
    }
    if (!defaultValues) {
        return <div className="flex justify-center items-center h-40"><Spinner text="در حال آماده‌سازی اطلاعات..." /></div>;
    }

    const RenderField = ({ name, label, options, placeholder }: { name: keyof RequestInfoFormData, label: string, options?: SelectOption[], placeholder?: string }) => {
        if (isEditing) {
            return (
                <Controller
                    name={name as 'category' | 'requestType'}
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label={label}
                            options={options || []}
                            value={field.value || null}
                            onChange={field.onChange}
                            placeholder={placeholder || "انتخاب کنید"}
                            disabled={isSubmitting}
                            error={errors[name as 'category' | 'requestType']?.message}
                        />
                    )}
                />
            );
        } else {
            let value;
            if (name === 'category') {
                value = readOnlyCategoryName;
            } else if (name === 'requestType') {
                value = request.leave_type.name || '---';
            } else {
                value = '---';
            }

            return <ReadOnlyInput label={label} value={value} />;
        }
    };

    const formatReadOnlyDate = (isoString: string) => {
        try {
            const date = parseISO(isoString);
            return format(date, "yyyy/MM/dd");
        } catch {
            return '---';
        }
    }


    return (
        <div className="w-full">
            <form onSubmit={handleSubmit(onSave)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">

                    <RenderField
                        name="requestType"
                        label="نوع درخواست"
                        options={leaveTypeOptions}
                    />
                    <RenderField
                        name="category"
                        label="دسته بندی"
                        options={categoryOptions}
                    />

                    {isEditing ? (
                        <>
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <PersianDatePickerInput
                                        label="تاریخ شروع"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="انتخاب کنید"
                                        disabled={isSubmitting}
                                        error={errors.startDate?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <PersianDatePickerInput
                                        label="تاریخ پایان"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="انتخاب کنید"
                                        disabled={isSubmitting}
                                        error={errors.endDate?.message}
                                    />
                                )}
                            />
                        </>
                    ) : (
                        <>
                            <ReadOnlyInput
                                label="تاریخ شروع"
                                value={formatReadOnlyDate(request.start_time)}
                            />
                            <ReadOnlyInput
                                label="تاریخ پایان"
                                value={formatReadOnlyDate(request.end_time)}
                            />
                        </>
                    )}


                    <Controller
                        name="isFullDay"
                        control={control}
                        render={({ field }) => (
                            <div className="md:col-span-2">
                                {isEditing ? (
                                    <div className="pt-2">
                                        <Checkbox
                                            id="isFullDayCheckboxEdit"
                                            label="مرخصی تمام وقت (Full Day)"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                ) : (
                                    <ReadOnlyInput
                                        label="تمام وقت"
                                        value={defaultValues.isFullDay ? "بله" : "خیر (پاره وقت)"}
                                    />
                                )}
                            </div>
                        )}
                    />

                    {isEditing && !isFullDayWatch && (
                        <>
                            <Controller
                                name="startTime"
                                control={control}
                                render={({ field }) => (
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">ساعت شروع</label>
                                        <CustomTimeInput
                                            value={field.value || null}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                        {errors.startTime && <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">{errors.startTime.message}</p>}
                                    </div>
                                )}
                            />
                            <Controller
                                name="endTime"
                                control={control}
                                render={({ field }) => (
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">ساعت پایان</label>
                                        <CustomTimeInput
                                            value={field.value || null}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                        {errors.endTime && <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">{errors.endTime.message}</p>}
                                    </div>
                                )}
                            />
                        </>
                    )}

                    {!isEditing && !defaultValues.isFullDay && (
                        <>
                            <ReadOnlyInput label="ساعت شروع" value={format(parseISO(request.start_time), 'HH:mm')} />
                            <ReadOnlyInput label="ساعت پایان" value={format(parseISO(request.end_time), 'HH:mm')} />
                        </>
                    )}

                    <div className="md:col-span-2">
                        <Textarea
                            label="توضیحات"
                            {...register('description')}
                            rows={6}
                            disabled={!isEditing || isSubmitting}
                            error={errors.description?.message}
                            placeholder="توضیحات را وارد کنید..."
                        />
                    </div>
                </div>

                {request.status !== 'pending' && (
                    <div className="mt-8 pt-6 border-t border-borderL dark:border-borderD">
                        <h4 className="font-bold text-right mb-5 text-foregroundL dark:text-foregroundD flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded-full bg-primaryL dark:bg-primaryD block"></span>
                            نتیجه بررسی درخواست
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                            <ReadOnlyInput
                                label="وضعیت نهایی"
                                value={request.status === 'approved' ? 'تایید شده' : 'رد شده'}
                                containerClassName={request.status === 'approved' ? 'border-l-4 border-green-500 bg-green-50/30 dark:bg-green-900/20' : 'border-l-4 border-red-500 bg-red-50/30 dark:bg-red-900/20'}
                            />
                            <ReadOnlyInput
                                label="بررسی شده توسط"
                                value={`${request.processor?.first_name || ''} ${request.processor?.last_name || ''}`.trim() || '---'}
                            />
                            {request.status === 'rejected' && request.rejection_reason && (
                                <div className="md:col-span-2">
                                    <Textarea
                                        label="دلیل رد درخواست"
                                        value={request.rejection_reason}
                                        readOnly
                                        disabled
                                        rows={4}
                                        className={`bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300 focus:ring-0`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-8 pt-4 border-t border-borderL dark:border-borderD">
                    {isEditing ? (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="flex justify-center hover:bg-secondaryL dark:hover:bg-secondaryD cursor-pointer items-center gap-2 bg-transparent text-foregroundL dark:text-foregroundD px-5 py-2 rounded-xl text-sm font-medium border border-borderL dark:border-borderD disabled:opacity-50 transition-colors"
                            >
                                <X size={18} />
                                لغو
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex justify-center items-center hover:bg-primaryL/90 cursor-pointer gap-2 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50 shadow-sm shadow-primaryL/20 transition-all"
                            >
                                {isSubmitting ? <Spinner size="sm" className="text-white" /> : <Save size={18} />}
                                {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            disabled={request.status !== 'pending'}
                            className="bg-primaryL hover:bg-primaryL/90 cursor-pointer dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                            title={request.status !== 'pending' ? "امکان ویرایش درخواست پردازش شده وجود ندارد" : "ویرایش درخواست"}
                        >
                            <Pencil size={18} />
                            ویرایش درخواست
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};