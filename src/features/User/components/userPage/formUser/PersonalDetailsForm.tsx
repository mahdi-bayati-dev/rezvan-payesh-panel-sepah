import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { UploadCloud, Trash, ImageIcon, X, Image as LucideImage } from 'lucide-react';

import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User, type EmployeeImage } from '@/features/User/types/index';
import {
    type PersonalDetailsFormData,
    personalDetailsFormSchema
} from '@/features/User/Schema/userProfileFormSchema';
import { getFullImageUrl } from '@/features/User/utils/imageHelper';

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';

const genderOptions: SelectOption[] = [
    { id: 'male', name: 'مرد' },
    { id: 'female', name: 'زن' },
];

const maritalStatusOptions: SelectOption[] = [
    { id: 'false', name: 'مجرد' },
    { id: 'true', name: 'متاهل' },
];

const educationLevelOptions: SelectOption[] = [
    { id: 'diploma', name: 'دیپلم' },
    { id: 'advanced_diploma', name: 'کاردانی' },
    { id: 'bachelor', name: 'لیسانس' },
    { id: 'master', name: 'فوق لیسانس' },
    { id: 'doctorate', name: 'دکترا' },
    { id: 'post_doctorate', name: 'فوق دکترا' },
];

const PersonalDetailsForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // --- State های مربوط به تصویر ---
    const [existingImages, setExistingImages] = useState<EmployeeImage[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    // مقادیر پیش‌فرض فرم
    const defaultValues = useMemo((): PersonalDetailsFormData => {
        if (!user.employee) return { employee: null };
        return {
            employee: {
                first_name: user.employee.first_name,
                last_name: user.employee.last_name,
                father_name: user.employee.father_name || null,
                nationality_code: user.employee.nationality_code || null,
                birth_date: user.employee.birth_date || "",
                gender: user.employee.gender,
                is_married: user.employee.is_married,
                education_level: user.employee.education_level || null,
                images: [],
                deleted_image_ids: [],
            }
        };
    }, [user]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<PersonalDetailsFormData>({
        resolver: zodResolver(personalDetailsFormSchema),
        defaultValues
    });

    useEffect(() => {
        if (isEditing) return;
        reset(defaultValues);

        if (user.employee?.images && Array.isArray(user.employee.images)) {
            setExistingImages(user.employee.images);
        } else {
            setExistingImages([]);
        }
        setNewImagePreviews([]);
    }, [user, defaultValues, reset, isEditing]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const currentFiles = watch('employee.images') || [];
            const updatedFiles = [...currentFiles, ...files];

            setValue('employee.images', updatedFiles, { shouldValidate: true, shouldDirty: true });

            const newUrls = files.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newUrls]);

            e.target.value = '';
        }
    };

    const removeNewImage = (index: number) => {
        const currentFiles = watch('employee.images') || [];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setValue('employee.images', updatedFiles, { shouldValidate: true, shouldDirty: true });

        URL.revokeObjectURL(newImagePreviews[index]);
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        const currentDeletedIds = watch('employee.deleted_image_ids') || [];
        setValue('employee.deleted_image_ids', [...currentDeletedIds, imageId], { shouldDirty: true });
    };

    const onSubmit = (formData: PersonalDetailsFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => {
                    toast.success("مشخصات فردی و تصاویر به‌روزرسانی شدند.");
                    setIsEditing(false);
                    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
                    setNewImagePreviews([]);
                },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    const handleCancel = () => {
        reset(defaultValues);
        setExistingImages(user.employee?.images || []);
        newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setNewImagePreviews([]);
        setIsEditing(false);
    };

    const handleDateChange = (date: DateObject | null, onChange: (val: string | null) => void) => {
        if (date) {
            onChange(date.convert(gregorian, gregorian_en).format("YYYY-MM-DD"));
        } else {
            onChange(null);
        }
    };

    if (!user.employee) {
        return (
            <div className="p-4 rounded-lg border border-warning-200 bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200">
                این کاربر فاقد پروفایل کارمندی است. مشخصات فردی قابل ویرایش نیست.
            </div>
        );
    }

    return (
        <FormSection
            title="مشخصات فردی و تصویر پروفایل"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateMutation.isPending}
        >
            {/* --- بخش مدیریت تصاویر (بهینه شده برای Dark Mode) --- */}
            <div className="mb-8 p-4 rounded-xl border border-borderL bg-secondaryL/20 dark:border-borderD dark:bg-backgroundD/50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-primaryL/10 dark:bg-primaryD/10 text-primaryL dark:text-primaryD">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-foregroundL dark:text-foregroundD">گالری تصاویر</h4>
                        <p className="text-[11px] text-muted-foregroundL dark:text-muted-foregroundD">اولین تصویر به عنوان پروفایل اصلی نمایش داده می‌شود</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

                    {/* ۱. دکمه آپلود */}
                    {isEditing && (
                        <label className="relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-primaryL/30 dark:border-primaryD/30 bg-backgroundL-500 hover:bg-primaryL/5 dark:bg-backgroundD dark:hover:bg-primaryD/10 cursor-pointer transition-all group overflow-hidden shadow-sm hover:shadow-md hover:border-primaryL dark:hover:border-primaryD">
                            <div className="p-3 rounded-full bg-secondaryL dark:bg-secondaryD group-hover:scale-110 transition-transform mb-2">
                                <UploadCloud className="w-6 h-6 text-primaryL dark:text-primaryD" />
                            </div>
                            <span className="text-xs font-medium text-foregroundL dark:text-foregroundD">افزودن تصویر</span>
                            <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD mt-1 font-mono">JPG, PNG (Max 5MB)</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={!isEditing}
                            />
                        </label>
                    )}

                    {/* ۲. تصاویر موجود */}
                    {existingImages.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                            <img
                                src={getFullImageUrl(img.url)}
                                alt="Existing"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                }}
                            />
                            {/* فال‌بک */}
                            <div className="hidden w-full h-full items-center justify-center bg-secondaryL dark:bg-secondaryD">
                                <LucideImage className="w-8 h-8 text-muted-foregroundL dark:text-muted-foregroundD/50" />
                            </div>

                            {/* دکمه حذف */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="bg-destructiveL hover:bg-destructiveL/90 text-white p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                        title="حذف تصویر"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* ۳. تصاویر جدید */}
                    {newImagePreviews.map((url, index) => (
                        <div key={`new-${index}`} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-primaryL/50 dark:border-primaryD/50 shadow-md bg-backgroundL-500 dark:bg-backgroundD">
                            <img src={url} alt="New Preview" className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />

                            <div className="absolute top-2 right-2 bg-primaryL dark:bg-primaryD text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                                جدید
                            </div>

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="bg-destructiveL hover:bg-destructiveL/90 text-white p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                        title="انصراف"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* پیام خالی بودن */}
                    {!isEditing && existingImages.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-borderL dark:border-white/10 rounded-xl text-muted-foregroundL dark:text-muted-foregroundD bg-secondaryL/30 dark:bg-white/5">
                            <div className="p-3 bg-backgroundL-500 dark:bg-gray-800 rounded-full mb-3 shadow-sm">
                                <ImageIcon className="w-8 h-8 opacity-50" />
                            </div>
                            <span className="text-sm font-medium">هیچ تصویری ثبت نشده است</span>
                        </div>
                    )}
                </div>

                {errors.employee?.images && (
                    <div className="mt-3 p-2 bg-destructiveL/10 dark:bg-destructiveD/10 border border-destructiveL/20 dark:border-destructiveD/20 rounded-lg">
                        <p className="text-destructiveL dark:text-destructiveD text-xs font-medium text-center">
                            {errors.employee.images.message}
                        </p>
                    </div>
                )}
            </div>

            {/* خط جداکننده */}
            <div className="h-px bg-gradient-to-r from-transparent via-borderL to-transparent dark:via-borderD mb-8 opacity-50" />

            {/* --- فیلدهای متنی --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="نام"
                    {...register("employee.first_name")}
                    error={errors.employee?.first_name?.message}
                    disabled={!isEditing}
                />
                <Input
                    label="نام خانوادگی"
                    {...register("employee.last_name")}
                    error={errors.employee?.last_name?.message}
                    disabled={!isEditing}
                />
                <Input
                    label="نام پدر"
                    {...register("employee.father_name")}
                    error={errors.employee?.father_name?.message}
                    disabled={!isEditing}
                />
                <Input
                    label="کد ملی"
                    {...register("employee.nationality_code")}
                    error={errors.employee?.nationality_code?.message}
                    dir="ltr"
                    className="text-right"
                    disabled={!isEditing}
                />

                <Controller
                    name="employee.birth_date"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="تاریخ تولد *"
                            value={field.value}
                            onChange={(date) => handleDateChange(date, field.onChange)}
                            error={errors.employee?.birth_date?.message}
                            disabled={!isEditing || updateMutation.isPending}
                        />
                    )}
                />

                <Controller
                    name="employee.gender"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="جنسیت"
                            placeholder="انتخاب کنید"
                            options={genderOptions}
                            value={genderOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.gender?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.is_married"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="وضعیت تاهل"
                            placeholder="انتخاب کنید"
                            options={maritalStatusOptions}
                            value={maritalStatusOptions.find(opt => opt.id === String(field.value)) || null}
                            onChange={(option) => field.onChange(option ? option.id === 'true' : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.is_married?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.education_level"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="تحصیلات"
                            placeholder="انتخاب کنید"
                            options={educationLevelOptions}
                            value={educationLevelOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.education_level?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default PersonalDetailsForm;