// features/requests/components/TableSettingsPage/LeaveTypeForm.tsx
import { useEffect, useMemo } from 'react'; // ✅ ۱. ایمپورت useMemo برای رفع باگ حلقه بی‌نهایت
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ✅ ۲. اصلاح مسیرهای ایمپورت (حذف /features/ )
import {
    leaveTypeSchema,
    type LeaveTypeFormData,
} from '@/features/requests/schemas/leaveTypeSchema';
import { type LeaveType, type LeaveTypePayload } from '@/features/requests/api/api';
import {
    useCreateLeaveType,
    useUpdateLeaveType,
} from '@/features/requests/hook/useLeaveTypes';

// ایمپورت کامپوننت‌های UI
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface LeaveTypeFormProps {
    /** نوع مرخصی انتخاب شده برای ویرایش (اگر null باشد، فرم در حالت "ایجاد" است) */
    selectedLeaveType: LeaveType | null;
    /** لیست تمام انواع مرخصی برای نمایش در دراپ‌داون "والد" */
    allLeaveTypes: LeaveType[];
    /** تابعی برای پاک کردن انتخاب و بازگشت به حالت "ایجاد" */
    onClearSelection: () => void;
}

/**
 * یک تابع کمکی برای تبدیل ساختار درختی به لیست مسطح (Flat)
 * برای استفاده در SelectBox.
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
}: LeaveTypeFormProps) => {

    // ۱. دریافت هوک‌های Mutation
    const createMutation = useCreateLeaveType();
    const updateMutation = useUpdateLeaveType();
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // ۲. آماده‌سازی گزینه‌های دراپ‌داون والد
    // ✅✅✅ ۳. (اصلاحیه باگ حلقه بی‌نهایت)
    // متغیر parentOptions با useMemo ساخته شد تا در هر رندر مجدد
    // یک آرایه جدید ساخته نشود و باعث اجرای مجدد useEffect نشود.
    const parentOptions: SelectOption[] = useMemo(() => [
        { id: 0, name: '— بدون والد (ریشه) —' }, // از 0 یا null استفاده می‌کنیم
        ...flattenLeaveTypes(allLeaveTypes),
    ], [allLeaveTypes]); // این فقط زمانی اجرا می‌شود که allLeaveTypes تغییر کند

    // ۳. راه‌اندازی React Hook Form
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

    // ۴. افکت: هرگاه `selectedLeaveType` تغییر کرد، فرم را ریست کن
    useEffect(() => {
        if (selectedLeaveType) {
            // حالت ویرایش: فرم را با داده‌های موجود پر کن
            reset({
                name: selectedLeaveType.name,
                description: selectedLeaveType.description,
                // پیدا کردن آبجکت والد در لیست گزینه‌ها
                parent: parentOptions.find(opt => opt.id === selectedLeaveType.parent_id) || null,
            });
        } else {
            // حالت ایجاد: فرم را خالی کن
            reset({
                name: '',
                description: '',
                parent: null,
            });
        }
    }, [selectedLeaveType, reset, parentOptions]); // ✅ حالا parentOptions پایدار است (خط ۹۸)

    // ۵. تابع ارسال فرم (بدون تغییر)
    const onSubmit: SubmitHandler<LeaveTypeFormData> = (data) => {
        // تبدیل داده‌های فرم به فرمت مورد نیاز API (Payload)
        const payload: LeaveTypePayload = {
            name: data.name,
            description: data.description || null,
            // اگر "بدون والد" انتخاب شده بود (id: 0) یا null بود، parent_id را null بفرست
            parent_id: data.parent && data.parent.id !== 0 ? (data.parent.id as number) : null,
        };

        if (selectedLeaveType) {
            // اگر در حالت ویرایش هستیم، آپدیت کن
            updateMutation.mutate(
                { id: selectedLeaveType.id, payload },
                {
                    onSuccess: () => {
                        onClearSelection(); // پاک کردن فرم پس از موفقیت
                    },
                }
            );
        } else {
            // اگر در حالت ایجاد هستیم، ایجاد کن
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onClearSelection(); // پاک کردن فرم پس از موفقیت
                },
            });
        }
    };

    // (بخش JSX بدون تغییر است)
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-5">
            <h3 className="font-bold text-right mb-2">
                {selectedLeaveType ? `ویرایش "${selectedLeaveType.name}"` : 'ایجاد نوع مرخصی جدید'}
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
                        // (جلوگیری از انتخاب خود آیتم به عنوان والد خودش)
                        // options={parentOptions.filter(opt => opt.id !== selectedLeaveType?.id)}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="انتخاب کنید"
                        disabled={isLoading}
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

            {/* دکمه‌های عملیاتی فرم */}
            <div className="flex justify-start gap-4 mt-4">
                <Button type="submit" disabled={isLoading} variant="primary" size="md">
                    {isLoading ? (
                        <Spinner size="sm" />
                    ) : selectedLeaveType ? (
                        'ذخیره تغییرات'
                    ) : (
                        'ایجاد'
                    )}
                </Button>
                {/* اگر در حالت ویرایش بودیم، دکمه "لغو ویرایش" نشان بده */}
                {selectedLeaveType && (
                    <Button
                        type="button"
                        onClick={onClearSelection}
                        disabled={isLoading}
                        variant="outline"
                        size="md"
                    >
                        لغو ویرایش
                    </Button>
                )}
            </div>
        </form>
    );
};