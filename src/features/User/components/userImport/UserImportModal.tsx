import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, FileSpreadsheet, Download, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Imports from your structure
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import SelectBox from '@/components/ui/SelectBox';
import Checkbox from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';

// Hooks & Types
import { useImportUsers } from '@/features/User/hooks/useUserImport';
import { importUserSchema, type ImportUserFormData } from '@/features/User/Schema/importSchema';
import { downloadSampleExcel } from '@/features/User/api/api';
import { useWorkGroups, useShiftSchedulesList } from '@/features/work-group/hooks/hook';

interface UserImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: number;
    organizationName?: string;
}

export const UserImportModal: React.FC<UserImportModalProps> = ({
    isOpen,
    onClose,
    organizationId,
    organizationName
}) => {
    // 1. هوک‌های داده
    const { data: workGroups } = useWorkGroups(1, 100);
    const { data: shiftSchedules } = useShiftSchedulesList();
    const importMutation = useImportUsers();

    // استیت برای نمایش راهنما
    const [showGuide, setShowGuide] = useState(false);

    // 2. تنظیمات فرم
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ImportUserFormData>({
        resolver: zodResolver(importUserSchema),
        defaultValues: {
            organization_id: organizationId,
            default_password: true,
            work_group_id: null,
            shift_schedule_id: null,
            file: undefined,
        }
    });

    const selectedFile = watch('file');

    // 3. هندلر آپلود فایل
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setValue('file', e.target.files[0], { shouldValidate: true });
        }
    };

    // 4. سابمیت فرم
    const onSubmit = (data: ImportUserFormData) => {
        importMutation.mutate(
            {
                ...data,
                organization_id: organizationId
            },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            }
        );
    };

    const workGroupOptions = workGroups?.data?.map(wg => ({ id: wg.id, name: wg.name })) || [];
    const shiftOptions = shiftSchedules?.map(sh => ({ id: sh.id, name: sh.name })) || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-bold">وارد کردن گروهی کاربران (Excel)</h3>
                </div>
            </ModalHeader>

            <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* --- بخش دانلود نمونه و راهنما --- */}
                    <div className="space-y-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center border border-blue-100 dark:border-blue-800">
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">فایل نمونه را دانلود کنید</p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">برای جلوگیری از خطا، از قالب استاندارد استفاده کنید.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={downloadSampleExcel} className="gap-2">
                                <Download className="h-4 w-4" />
                                دانلود قالب
                            </Button>
                        </div>

                        {/* ✅ راهنمای تعاملی ستون‌ها (اضافه شده) */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowGuide(!showGuide)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primaryL" />
                                    راهنمای نام ستون‌های اکسل (Header Rows)
                                </span>
                                {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>

                            {showGuide && (
                                <div className="p-3 bg-white dark:bg-gray-900 text-xs space-y-3 animate-in slide-in-from-top-2">
                                    <div>
                                        <p className="font-bold text-red-600 dark:text-red-400 mb-1">ستون‌های اجباری (باید حتماً باشند):</p>
                                        <div className="flex flex-wrap gap-1  text-gray-600 dark:text-gray-400" dir="ltr">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">email</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">first_name</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">last_name</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">personnel_code</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">nationality_code</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-600 dark:text-green-400 mb-1">ستون‌های اختیاری:</p>
                                        <div className="flex flex-wrap gap-1  text-gray-600 dark:text-gray-400" dir="ltr">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">user_name</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">password</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">phone_number</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">gender</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">is_married</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">birth_date</span>
                                            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">starting_job</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- بخش آپلود فایل --- */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foregroundL dark:text-foregroundD">
                            انتخاب فایل اکسل *
                        </label>
                        <label className={`
                            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                            ${errors.file ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 hover:border-primaryL bg-gray-50 dark:bg-gray-800 dark:border-gray-600'}
                        `}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {selectedFile ? (
                                    <>
                                        <FileSpreadsheet className="w-8 h-8 text-green-500 mb-2" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">برای آپلود کلیک کنید</span> یا فایل را اینجا رها کنید
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">XLSX, CSV (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                        </label>
                        {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file.message as string}</p>}
                    </div>

                    {/* --- تنظیمات عمومی --- */}
                    <div className="border-t border-borderL dark:border-borderD pt-4">
                        <h4 className="text-sm font-bold mb-4 text-foregroundL dark:text-foregroundD">تنظیمات پیش‌فرض (اعمال روی همه کاربران)</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* سازمان */}
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">سازمان مقصد</label>
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {organizationName || `Organization #${organizationId}`}
                                </div>
                            </div>

                            {/* رمز عبور */}
                            <div className="flex items-center h-full pt-4">
                                <Controller
                                    name="default_password"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            label="رمز عبور پیش‌فرض = کد ملی"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* گروه کاری */}
                            <Controller
                                name="work_group_id"
                                control={control}
                                render={({ field }) => (
                                    <SelectBox
                                        label="گروه کاری (اختیاری)"
                                        options={workGroupOptions}
                                        value={workGroupOptions.find(opt => opt.id === field.value) || null}
                                        onChange={(opt) => field.onChange(opt?.id)}
                                        placeholder="بدون گروه کاری"
                                    />
                                )}
                            />

                            {/* برنامه شیفتی */}
                            <Controller
                                name="shift_schedule_id"
                                control={control}
                                render={({ field }) => (
                                    <SelectBox
                                        label="برنامه شیفتی (اختیاری)"
                                        options={shiftOptions}
                                        value={shiftOptions.find(opt => opt.id === field.value) || null}
                                        onChange={(opt) => field.onChange(opt?.id)}
                                        placeholder="بدون برنامه شیفتی"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* --- دکمه‌ها --- */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-borderL dark:border-borderD">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={importMutation.isPending}>
                            انصراف
                        </Button>
                        <Button type="submit" variant="primary" disabled={importMutation.isPending}>
                            {importMutation.isPending ? 'در حال پردازش...' : 'شروع عملیات ایمپورت'}
                        </Button>
                    </div>

                    {/* پیام هشدار عملیات پس‌زمینه */}
                    <Alert variant="info" className="mt-2 text-xs">
                        <AlertDescription>
                            این عملیات ممکن است زمان‌بر باشد و در پس‌زمینه سرور (Queue) انجام می‌شود.
                        </AlertDescription>
                    </Alert>
                </form>
            </ModalBody>
        </Modal>
    );
};