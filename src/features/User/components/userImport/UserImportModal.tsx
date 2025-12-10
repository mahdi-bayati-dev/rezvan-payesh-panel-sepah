import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, FileSpreadsheet, Download, Info, ChevronDown, ChevronUp } from 'lucide-react';

import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import SelectBox from '@/components/ui/SelectBox';
import Checkbox from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';

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
    const { data: workGroups } = useWorkGroups(1, 100);
    const { data: shiftSchedules } = useShiftSchedulesList();
    const importMutation = useImportUsers();
    const [showGuide, setShowGuide] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setValue('file', e.target.files[0], { shouldValidate: true });
        }
    };

    const onSubmit = (data: ImportUserFormData) => {
        importMutation.mutate(
            { ...data, organization_id: organizationId },
            {
                onSuccess: () => { reset(); onClose(); }
            }
        );
    };

    const workGroupOptions = workGroups?.data?.map(wg => ({ id: wg.id, name: wg.name })) || [];
    const shiftOptions = shiftSchedules?.map(sh => ({ id: sh.id, name: sh.name })) || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-successL-foreground" />
                    <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD">وارد کردن گروهی کاربران (Excel)</h3>
                </div>
            </ModalHeader>

            <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <div className="bg-infoL-background dark:bg-infoD-background p-4 rounded-lg flex justify-between items-center border border-infoL-foreground/20 dark:border-infoD-foreground/20">
                            <div>
                                <p className="text-sm font-medium text-infoL-foreground dark:text-infoD-foreground">فایل نمونه را دانلود کنید</p>
                                <p className="text-xs text-infoL-foreground/80 dark:text-infoD-foreground/80 mt-1">برای جلوگیری از خطا، از قالب استاندارد استفاده کنید.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={downloadSampleExcel} className="gap-2">
                                <Download className="h-4 w-4" />
                                دانلود قالب
                            </Button>
                        </div>

                        <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowGuide(!showGuide)}
                                className="w-full flex items-center justify-between p-3 bg-secondaryL/20 dark:bg-secondaryD/20 text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD hover:bg-secondaryL/40 dark:hover:bg-secondaryD/40 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primaryL" />
                                    راهنمای نام ستون‌های اکسل (Header Rows)
                                </span>
                                {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>

                            {showGuide && (
                                <div className="p-3 bg-backgroundL-500 dark:bg-backgroundD text-xs space-y-3 animate-in slide-in-from-top-2">
                                    <div>
                                        <p className="font-bold text-destructiveL dark:text-destructiveD mb-1">ستون‌های اجباری (باید حتماً باشند):</p>
                                        <div className="flex flex-wrap gap-1 text-muted-foregroundL dark:text-muted-foregroundD" dir="ltr">
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">email</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">first_name</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">last_name</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">personnel_code</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">nationality_code</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-successL-foreground dark:text-successD-foreground mb-1">ستون‌های اختیاری:</p>
                                        <div className="flex flex-wrap gap-1 text-muted-foregroundL dark:text-muted-foregroundD" dir="ltr">
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">user_name</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">password</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">phone_number</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">gender</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">is_married</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">birth_date</span>
                                            <span className="bg-secondaryL/20 dark:bg-secondaryD/20 px-1.5 py-0.5 rounded border border-borderL dark:border-borderD">starting_job</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foregroundL dark:text-foregroundD">
                            انتخاب فایل اکسل *
                        </label>
                        <label className={`
                            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                            ${errors.file ? 'border-destructiveL bg-destructiveL-background' : 'border-borderL hover:border-primaryL bg-secondaryL/5 dark:bg-secondaryD/5'}
                        `}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {selectedFile ? (
                                    <>
                                        <FileSpreadsheet className="w-8 h-8 text-successL-foreground mb-2" />
                                        <p className="text-sm text-foregroundL dark:text-foregroundD font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-muted-foregroundL dark:text-muted-foregroundD mb-2" />
                                        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                            <span className="font-semibold">برای آپلود کلیک کنید</span> یا فایل را اینجا رها کنید
                                        </p>
                                        <p className="text-xs text-muted-foregroundL/70 dark:text-muted-foregroundD/70 mt-1">XLSX, CSV (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                        </label>
                        {errors.file && <p className="text-xs text-destructiveL mt-1">{errors.file.message as string}</p>}
                    </div>

                    <div className="border-t border-borderL dark:border-borderD pt-4">
                        <h4 className="text-sm font-bold mb-4 text-foregroundL dark:text-foregroundD">تنظیمات پیش‌فرض (اعمال روی همه کاربران)</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mb-1 block">سازمان مقصد</label>
                                <div className="p-2 bg-secondaryL/20 dark:bg-secondaryD/20 rounded border border-borderL dark:border-borderD text-sm font-medium text-foregroundL dark:text-foregroundD">
                                    {organizationName || `Organization #${organizationId}`}
                                </div>
                            </div>

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

                            <Controller name="work_group_id" control={control} render={({ field }) => (
                                <SelectBox label="گروه کاری (اختیاری)" options={workGroupOptions} value={workGroupOptions.find(opt => opt.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} placeholder="بدون گروه کاری" />
                            )} />

                            <Controller name="shift_schedule_id" control={control} render={({ field }) => (
                                <SelectBox label="برنامه شیفتی (اختیاری)" options={shiftOptions} value={shiftOptions.find(opt => opt.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} placeholder="بدون برنامه شیفتی" />
                            )} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-borderL dark:border-borderD">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={importMutation.isPending}>
                            انصراف
                        </Button>
                        <Button type="submit" variant="primary" disabled={importMutation.isPending}>
                            {importMutation.isPending ? 'در حال پردازش...' : 'شروع عملیات ایمپورت'}
                        </Button>
                    </div>

                    <Alert variant="info" className="mt-2 text-xs bg-infoL-background dark:bg-infoD-background text-infoL-foreground dark:text-infoD-foreground">
                        <AlertDescription>
                            این عملیات ممکن است زمان‌بر باشد و در پس‌زمینه سرور (Queue) انجام می‌شود.
                        </AlertDescription>
                    </Alert>
                </form>
            </ModalBody>
        </Modal>
    );
};