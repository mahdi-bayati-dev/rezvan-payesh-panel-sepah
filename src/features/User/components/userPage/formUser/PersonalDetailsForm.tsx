import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import {
    UploadCloud, Trash, ImageIcon, X,
    Clock, CheckCircle2,
} from 'lucide-react';

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

    const [existingImages, setExistingImages] = useState<EmployeeImage[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [pendingImages, setPendingImages] = useState<string[]>([]);

    const defaultValues = useMemo((): PersonalDetailsFormData => {
        if (!user.employee) return { employee: null };
        return {
            employee: {
                first_name: user.employee.first_name,
                last_name: user.employee.last_name,
                father_name: user.employee.father_name || "",
                nationality_code: user.employee.nationality_code || "",
                birth_date: user.employee.birth_date || "",
                gender: user.employee.gender,
                is_married: user.employee.is_married,
                education_level: user.employee.education_level || "diploma",
                images: [],
                delete_images: [],
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
        setPendingImages([]);
        newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setNewImagePreviews([]);
    }, [user, defaultValues, reset, isEditing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const currentFiles = watch('employee.images') || [];
            setValue('employee.images', [...currentFiles, ...files], { shouldValidate: true, shouldDirty: true });
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
        const currentDeletedIds = watch('employee.delete_images') || [];
        setValue('employee.delete_images', [...currentDeletedIds, imageId], { shouldDirty: true });
    };

    const onSubmit = (formData: PersonalDetailsFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => {
                    toast.success("اطلاعات ذخیره شد.");
                    setPendingImages(prev => [...prev, ...newImagePreviews]);
                    setIsEditing(false);
                    setNewImagePreviews([]);
                },
                onError: (err) => {
                    toast.error(`خطا: ${(err as Error).message}`);
                }
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

    if (!user.employee) return null;

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
            <div className="mb-8 p-5 rounded-2xl border border-borderL bg-backgroundL-500 dark:bg-backgroundD dark:border-borderD shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-borderL dark:border-borderD pb-4">
                    <div className="p-2 rounded-xl bg-primaryL/10 dark:bg-primaryD/10 text-primaryL dark:text-primaryD">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foregroundL dark:text-foregroundD">گالری تصاویر پروفایل</h4>
                        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-0.5">وضعیت تصاویر خود را در اینجا مشاهده کنید</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isEditing && (
                        <label className="relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-primaryL/30 dark:border-primaryD/30 bg-primaryL/5 hover:bg-primaryL/10 dark:bg-primaryD/5 dark:hover:bg-primaryD/10 cursor-pointer transition-all group overflow-hidden">
                            <div className="p-3 rounded-full bg-backgroundL-500 dark:bg-backgroundD shadow-sm group-hover:scale-110 transition-transform mb-2">
                                <UploadCloud className="w-6 h-6 text-primaryL dark:text-primaryD" />
                            </div>
                            <span className="text-xs font-bold text-primaryL dark:text-primaryD">آپلود عکس جدید</span>
                            <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD mt-1 opacity-80">JPG, PNG</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={!isEditing} />
                        </label>
                    )}

                    {existingImages.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-borderL dark:border-borderD bg-secondaryL/20 dark:bg-secondaryD/20 shadow-sm">
                            <img
                                src={getFullImageUrl(img.url)}
                                alt="Approved Profile"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="absolute top-2 left-2 bg-successL-background text-successL-foreground dark:bg-successD-background dark:text-successD-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10 backdrop-blur-md bg-opacity-90">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تایید شده</span>
                            </div>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img.id)}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-destructiveL hover:text-white text-destructiveL p-1.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0"
                                >
                                    <Trash className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}

                    {newImagePreviews.map((url, index) => (
                        <div key={`new-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-primaryL dark:border-primaryD shadow-md">
                            <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-primaryL dark:bg-primaryD text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                                <UploadCloud className="w-3 h-3" />
                                <span>جدید</span>
                            </div>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-destructiveL hover:text-white text-muted-foregroundL p-1.5 rounded-full shadow-sm transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}

                    {pendingImages.map((url, index) => (
                        <div key={`pending-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-warningL-foreground bg-warningL-background dark:bg-warningD-background/20">
                            <img src={url} alt="Pending" className="w-full h-full object-cover opacity-60 grayscale-[30%]" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-warningL-foreground/10 backdrop-blur-[1px]">
                                <div className="bg-warningL-foreground text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                                    <span>در حال بررسی</span>
                                </div>
                                <p className="text-[10px] text-white font-medium mt-2 drop-shadow-md">منتظر تایید ادمین</p>
                            </div>
                        </div>
                    ))}

                    {!isEditing && existingImages.length === 0 && pendingImages.length === 0 && (
                        <div className="col-span-full py-8 flex flex-col items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD border-2 border-dashed border-borderL dark:border-borderD rounded-xl bg-secondaryL/20 dark:bg-secondaryD/10">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-sm">هنوز تصویری بارگذاری نشده است</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="نام" {...register("employee.first_name")} error={errors.employee?.first_name?.message} disabled={!isEditing} />
                <Input label="نام خانوادگی" {...register("employee.last_name")} error={errors.employee?.last_name?.message} disabled={!isEditing} />
                <Input label="نام پدر" {...register("employee.father_name")} error={errors.employee?.father_name?.message} disabled={!isEditing} />
                <Input label="کد ملی" {...register("employee.nationality_code")} error={errors.employee?.nationality_code?.message} disabled={!isEditing} dir="ltr" className="text-left " />
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
                <Controller name="employee.gender" control={control} render={({ field }) => (
                    <SelectBox label="جنسیت" placeholder="انتخاب کنید" options={genderOptions} value={genderOptions.find(opt => opt.id === field.value) || null} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing} error={errors.employee?.gender?.message} />
                )} />
                <Controller name="employee.is_married" control={control} render={({ field }) => (
                    <SelectBox label="وضعیت تاهل" placeholder="انتخاب کنید" options={maritalStatusOptions} value={maritalStatusOptions.find(opt => opt.id === String(field.value)) || null} onChange={(option) => field.onChange(option ? option.id === 'true' : null)} disabled={!isEditing} error={errors.employee?.is_married?.message} />
                )} />
                <Controller name="employee.education_level" control={control} render={({ field }) => (
                    <SelectBox label="تحصیلات" placeholder="انتخاب کنید" options={educationLevelOptions} value={educationLevelOptions.find(opt => opt.id === field.value) || null} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing} error={errors.employee?.education_level?.message} />
                )} />
            </div>
        </FormSection>
    );
};

export default PersonalDetailsForm;