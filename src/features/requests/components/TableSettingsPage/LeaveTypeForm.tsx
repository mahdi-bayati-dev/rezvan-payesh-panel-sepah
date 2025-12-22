// features/requests/components/TableSettingsPage/LeaveTypeForm.tsx
import { useEffect, useMemo } from 'react'; 
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    leaveTypeSchema,
    type LeaveTypeFormData,
} from '@/features/requests/schemas/leaveTypeSchema';
import { type LeaveType, type LeaveTypePayload } from '@/features/requests/api/api-type';
import {
    useCreateLeaveType,
    useUpdateLeaveType,
} from '@/features/requests/hook/useLeaveTypes';

// ایمپورت کامپوننت‌های UI
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import { SpinnerButton } from '@/components/ui/SpinnerButton';

interface LeaveTypeFormProps {
    selectedLeaveType: LeaveType | null;
    allLeaveTypes: LeaveType[];
    // ✅ تغییر نام پراپ برای خوانایی بهتر (حالا onClearSelection به معنای بستن مودال است)
    onClearSelection: () => void; 
    // ✅ پراپ جدید: والد پیش‌فرض برای حالت ایجاد زیرمجموعه جدید
    defaultParent?: LeaveType | null;
}

/**
 * (تابع کمکی flattenLeaveTypes - بدون تغییر)
 */
const flattenLeaveTypes = (types: LeaveType[], prefix = ''): SelectOption[] => {
    let options: SelectOption[] = [];
    for (const type of types) {
        options.push({
            id: type.id,
            name: `${prefix} ${type.name}`,
        });
        if (type.children && type.children.length > 0) {
            options = options.concat(flattenLeaveTypes(type.children, prefix + '—'));
        }
    }
    return options;
};

export const LeaveTypeForm = ({
    selectedLeaveType,
    allLeaveTypes,
    onClearSelection,
    defaultParent = null,
}: LeaveTypeFormProps) => {

    // (هوک‌های Mutation - بدون تغییر)
    const createMutation = useCreateLeaveType();
    const updateMutation = useUpdateLeaveType();
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // (آماده‌سازی گزینه‌های دراپ‌داون والد با useMemo - بدون تغییر)
    const parentOptions: SelectOption[] = useMemo(() => [
        { id: 0, name: '— بدون والد (ریشه) —' }, 
        ...flattenLeaveTypes(allLeaveTypes),
    ], [allLeaveTypes]); 

    // (راه‌اندازی React Hook Form - بدون تغییر)
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LeaveTypeFormData>({
        resolver: zodResolver(leaveTypeSchema),
        defaultValues: {
            name: '',
            description: '',
            parent: null,
        },
    });

    // --- منطق ریست کردن فرم با توجه به انتخاب جدید ---
    useEffect(() => {
        let defaultParentOption: SelectOption | null = null;
        let defaultName = '';
        let defaultDescription = '';

        if (selectedLeaveType) {
            // حالت ویرایش: مقادیر فعلی آیتم
            defaultName = selectedLeaveType.name;
            defaultDescription = selectedLeaveType.description || '';
            defaultParentOption = parentOptions.find(opt => opt.id === selectedLeaveType.parent_id) || null;
        } else if (defaultParent) {
            // حالت ایجاد فرزند جدید: والد پیش‌فرض، بقیه خالی
            defaultParentOption = parentOptions.find(opt => opt.id === defaultParent.id) || null;
            defaultName = '';
            defaultDescription = '';
        } else {
            // حالت ایجاد ریشه جدید: همه خالی، والد روی 'بدون والد'
            defaultParentOption = parentOptions.find(opt => opt.id === 0) || null;
            defaultName = '';
            defaultDescription = '';
        }

        reset({
            name: defaultName,
            description: defaultDescription,
            parent: defaultParentOption,
        });

    }, [selectedLeaveType, defaultParent, reset, parentOptions]); 


    // (تابع ارسال فرم (onSubmit) - بدون تغییر)
    const onSubmit: SubmitHandler<LeaveTypeFormData> = (data) => {
        const payload: LeaveTypePayload = {
            name: data.name,
            description: data.description || null,
            // اگر id برابر 0 بود (بدون والد) یا والد انتخاب نشده بود، parent_id = null
            parent_id: data.parent && data.parent.id !== 0 ? (data.parent.id as number) : null,
        };

        if (selectedLeaveType && selectedLeaveType.id !== -1) {
            // حالت ویرایش (اگر selectedLeaveType معتبر باشد)
            updateMutation.mutate(
                { id: selectedLeaveType.id, payload },
                { onSuccess: onClearSelection }
            );
        } else {
            // حالت ایجاد (چه ریشه جدید، چه فرزند جدید)
            createMutation.mutate(payload, { onSuccess: onClearSelection });
        }
    };

    // --- تعیین عنوان فرم و وضعیت‌های بولین ---
    // ✅ رفع خطای TS6133: متغیر isCreatingRoot حذف شد چون استفاده نمی‌شود.
    // ✅ تعریف isCreatingChild به صورت صریح بولین برای رفع خطای TS2322
    const isCreatingChild: boolean = !!(!selectedLeaveType && defaultParent);

    const formTitle = selectedLeaveType && selectedLeaveType.id !== -1 
        ? `ویرایش "${selectedLeaveType.name}"` 
        : isCreatingChild 
            ? `ایجاد زیرمجموعه برای "${defaultParent!.name}"`
            : 'ایجاد دسته بندی (ریشه) جدید';


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">
            <h3 className="font-bold text-right text-lg pb-2 border-b border-borderL dark:border-borderD">
                {formTitle}
            </h3>

            <Input
                label="نام"
                {...register('name')}
                error={errors.name?.message}
                placeholder="مثال: مرخصی استحقاقی"
                disabled={isLoading}
            />

            <Controller
                name="parent"
                control={control}
                render={({ field }) => (
                    <SelectBox
                        label="والد (دسته‌بندی اصلی)"
                        options={parentOptions}
                        // ✅ [اصلاح وارنینگ]
                        value={field.value || null} 
                        onChange={field.onChange}
                        placeholder="انتخاب کنید"
                        // ✅ رفع خطای TS2322: حالا isCreatingChild به طور قطعی بولین است.
                        disabled={isLoading || isCreatingChild} 
                        error={errors.parent?.message}
                    />
                )}
            />

            <Textarea
                label="توضیحات (اختیاری)"
                {...register('description')}
                error={errors.description?.message}
                placeholder="توضیحات کوتاه در مورد این نوع مرخصی"
                rows={4}
                disabled={isLoading}
            />

            {/* (دکمه‌های عملیاتی فرم - بدون تغییر) */}
            <div className="flex justify-start gap-4 mt-4">
                <Button type="submit" disabled={isLoading} variant="primary" size="md">
                    {isLoading ? (
                        <SpinnerButton size="sm" />
                    ) : selectedLeaveType && selectedLeaveType.id !== -1 ? (
                        'ذخیره تغییرات'
                    ) : (
                        'ایجاد'
                    )}
                </Button>
                {/* دکمه لغو در هر دو حالت ویرایش یا ایجاد زیرمجموعه نمایش داده می‌شود */}
                {(selectedLeaveType || isCreatingChild) && (
                    <Button
                        type="button"
                        onClick={onClearSelection}
                        disabled={isLoading}
                        variant="outline"
                        size="md"
                    >
                        لغو
                    </Button>
                )}
            </div>
        </form>
    );
};