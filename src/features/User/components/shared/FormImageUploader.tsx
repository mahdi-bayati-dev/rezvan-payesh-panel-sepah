import React, { useCallback, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { UploadCloud, Trash, AlertCircle } from "lucide-react";

interface FormImageUploaderProps {
    name: string;
    label?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    multiple?: boolean;
}

/**
 * کامپوننت آپلودر تصویر با پشتیبانی از React Hook Form و نمایش خطاها
 */
export const FormImageUploader: React.FC<FormImageUploaderProps> = ({
    name,
    label = "تصویر پروفایل",
    maxSizeMB = 5,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    multiple = true,
}) => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // استخراج خطا بر اساس مسیر فیلد (مثلاً employee.images)
    const error = name.split('.').reduce((obj, key) => obj && obj[key], errors as any);
    const errorMessage = error?.message as string | undefined;

    const currentFiles = watch(name) || [];

    // مدیریت آزادسازی حافظه برای URLهای پیش‌نمایش
    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files);
                
                /**
                 * تغییر مهم مهدی جان:
                 * قبلاً اینجا فایل‌های بزرگ فیلتر می‌شدند و کلاً وارد استیت نمی‌شدند،
                 * به همین خاطر Zod اصلاً نمی‌فهمید که فایلی با حجم زیاد انتخاب شده.
                 * حالا اجازه می‌دهیم فایل‌ها وارد شوند تا اعتبارسنجی فرم خطا را نشان دهد.
                 */
                const updatedFiles = multiple ? [...currentFiles, ...newFiles] : newFiles;
                
                // مقداردهی در فرم
                setValue(name, updatedFiles, { 
                    shouldValidate: true, 
                    shouldDirty: true,
                    shouldTouch: true 
                });

                // ایجاد پیش‌نمایش برای فایل‌های جدید
                const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
                setPreviewUrls((prev) => multiple ? [...prev, ...newPreviews] : newPreviews);
                
                // ریست کردن اینپوت برای انتخاب مجدد همان فایل در صورت نیاز
                e.target.value = "";
            }
        },
        [currentFiles, multiple, name, setValue]
    );

    const removeImage = useCallback(
        (index: number) => {
            const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
            setValue(name, updatedFiles, { shouldValidate: true, shouldDirty: true });
            
            // پاکسازی URL پیش‌نمایش
            if (previewUrls[index]) {
                URL.revokeObjectURL(previewUrls[index]);
            }
            setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
        },
        [currentFiles, name, previewUrls, setValue]
    );

    return (
        <div className="mb-4 w-full">
            {label && (
                <label className="block text-sm font-bold mb-2 text-foregroundL dark:text-foregroundD">
                    {label}
                </label>
            )}

            <div className={`
                group relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center 
                transition-all duration-200 cursor-pointer overflow-hidden
                ${errorMessage 
                    ? 'border-destructiveL bg-destructiveL/5 dark:border-destructiveD dark:bg-destructiveD/5' 
                    : 'border-borderL dark:border-borderD bg-secondaryL/5 dark:bg-secondaryD/5 hover:border-primaryL dark:hover:border-primaryD'}
            `}>
                <UploadCloud className={`w-12 h-12 mb-3 transition-colors ${errorMessage ? 'text-destructiveL' : 'text-muted-foregroundL group-hover:text-primaryL'}`} />
                
                <p className="text-sm font-semibold text-foregroundL dark:text-foregroundD mb-1">
                    برای آپلود کلیک کنید یا فایل را اینجا رها کنید
                </p>
                <p className="text-xs text-muted-foregroundL/70 dark:text-muted-foregroundD/70">
                    حداکثر {maxSizeMB}MB (فرمت‌های: JPG, PNG, WEBP)
                </p>
                
                <input
                    type="file"
                    accept={acceptedTypes.join(",")}
                    multiple={multiple}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>

            {/* نمایش خطای حجم یا فرمت به صورت متحرک */}
            {errorMessage && (
                <div className="flex items-center gap-2 text-destructiveL dark:text-destructiveD text-xs mt-3 font-bold animate-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* پیش‌نمایش تصاویر */}
            {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6 animate-in fade-in zoom-in-95 duration-300">
                    {previewUrls.map((url, index) => (
                        <div
                            key={index}
                            className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-borderL dark:border-borderD shadow-md group/item"
                        >
                            <img
                                src={url}
                                alt={`پیش‌نمایش ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover/item:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-destructiveL text-white p-2 rounded-full hover:bg-destructiveL/80 transform scale-75 group-hover/item:scale-100 transition-all"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};