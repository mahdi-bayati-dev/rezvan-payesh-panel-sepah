import React, { useCallback, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { UploadCloud, Trash, } from "lucide-react";

interface FormImageUploaderProps {
    name: string; // نام فیلد در react-hook-form (مثلا employee.images)
    label?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    multiple?: boolean;
}

export const FormImageUploader: React.FC<FormImageUploaderProps> = ({
    name,
    label = "تصویر پروفایل",
    maxSizeMB = 5,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    multiple = true,
}) => {
    const { setValue, watch, formState: { errors } } = useFormContext();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // دسترسی به ارورهای تودرتو
    const error = name.split('.').reduce((obj, key) => obj && obj[key], errors as any);
    const errorMessage = error?.message as string | undefined;

    const currentFiles = watch(name) || [];

    // پاکسازی URL ها هنگام آنموت شدن
    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files);

                // اعتبارسنجی ساده حجم (اختیاری، چون Zod هم انجام میده ولی برای UX خوبه)
                const validFiles = newFiles.filter(f => f.size <= maxSizeMB * 1024 * 1024);
                if (validFiles.length !== newFiles.length) {
                    // اینجا میشه Toast نمایش داد
                    console.warn("برخی فایل‌ها حجم بیش از حد مجاز داشتند.");
                }

                const updatedFiles = multiple ? [...currentFiles, ...validFiles] : validFiles;

                setValue(name, updatedFiles, { shouldValidate: true, shouldDirty: true });

                const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
                setPreviewUrls((prev) => multiple ? [...prev, ...newPreviews] : newPreviews);

                e.target.value = ""; // ریست اینپوت
            }
        },
        [currentFiles, maxSizeMB, multiple, name, setValue]
    );

    const removeImage = useCallback(
        (index: number) => {
            const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
            setValue(name, updatedFiles, { shouldValidate: true, shouldDirty: true });

            URL.revokeObjectURL(previewUrls[index]);
            setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
        },
        [currentFiles, name, previewUrls, setValue]
    );

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium mb-2 text-foreground dark:text-foregroundD">
                    {label}
                </label>
            )}

            <div className="group relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer overflow-hidden">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2 group-hover:text-primaryL transition-colors scale-100 group-hover:scale-110 duration-200" />
                <p className="text-sm text-gray-500 mb-1 font-medium">
                    برای آپلود کلیک کنید یا فایل را اینجا رها کنید
                </p>
                <p className="text-xs text-gray-400">
                    حداکثر {maxSizeMB}MB ({acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')})
                </p>
                <input
                    type="file"
                    accept={acceptedTypes.join(",")}
                    multiple={multiple}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>

            {errorMessage && (
                <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">
                    {errorMessage}
                </p>
            )}

            {/* بخش پیش‌نمایش */}
            {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                    {previewUrls.map((url, index) => (
                        <div
                            key={index}
                            className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group/item"
                        >
                            <img
                                src={url}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};