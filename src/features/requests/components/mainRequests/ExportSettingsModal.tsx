import React, { Fragment, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Download, X, Calendar, FileSpreadsheet, Check, Filter } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";

import Input from '@/components/ui/Input';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

// --- Hooks & API ---
import { useExportLeaveRequests } from '../../hook/useLeaveRequests';
import { useLeaveTypes } from '../../hook/useLeaveTypes';
import { useOrganizations } from '@/features/Organization/hooks/useOrganizations';
import type { ExportLeaveRequestsParams } from '../../api/api-requests';
import type { Organization } from '@/features/Organization/types';
import type { LeaveType } from '../../api/api-type';

interface ExportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- گزینه‌ها ---
const statusOptions: SelectOption[] = [
    { id: 'pending', name: 'در انتظار بررسی' },
    { id: 'approved', name: 'تایید شده' },
    { id: 'rejected', name: 'رد شده' },
];

const flattenOrganizations = (orgs: Organization[], level = 0): SelectOption[] => {
    let options: SelectOption[] = [];
    for (const org of orgs) {
        options.push({
            id: org.id,
            name: `${'— '.repeat(level)} ${org.name}`,
        });
        if (org.children && org.children.length > 0) {
            options = options.concat(flattenOrganizations(org.children, level + 1));
        }
    }
    return options;
};

const flattenLeaveTypes = (types: LeaveType[], prefix = ''): SelectOption[] => {
    let options: SelectOption[] = [];
    for (const type of types) {
        options.push({
            id: type.id,
            name: `${prefix} ${type.name}`,
        });
        if (type.children && type.children.length > 0) {
            options = options.concat(flattenLeaveTypes(type.children, prefix + '— '));
        }
    }
    return options;
};

const CheckboxItem = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label
        htmlFor={id}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none group h-full
      ${checked
                ? 'bg-primaryL/5 border-primaryL/50 dark:bg-primaryD/10 dark:border-primaryD/50'
                : 'bg-transparent border-borderL dark:border-zinc-700 hover:border-primaryL/30 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
    >
        <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-colors flex-shrink-0
            ${checked ? 'bg-primaryL border-primaryL dark:bg-primaryD dark:border-primaryD' : 'border-gray-400 group-hover:border-primaryL/50'}`}>
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={onChange}
                className="appearance-none absolute inset-0 w-full h-full cursor-pointer"
            />
            {checked && <Check size={14} className="text-white" />}
        </div>
        <span className="text-sm font-medium text-foregroundL dark:text-gray-200">
            {label}
        </span>
    </label>
);

const formatToApiDate = (date: DateObject | null): string | undefined => {
    if (!date) return undefined;
    const gDate = date.convert(gregorian);
    return `${gDate.year}-${String(gDate.month.number).padStart(2, '0')}-${String(gDate.day).padStart(2, '0')}`;
};

export const ExportSettingsModal = ({ isOpen, onClose }: ExportSettingsModalProps) => {
    const exportMutation = useExportLeaveRequests();

    const { data: organizationsData, isLoading: isLoadingOrgs } = useOrganizations({ enabled: isOpen });
    const { data: leaveTypesData, isLoading: isLoadingLeaveTypes } = useLeaveTypes({ enabled: isOpen });

    const organizationOptions = useMemo(() => {
        if (!organizationsData) return [];
        return flattenOrganizations(organizationsData);
    }, [organizationsData]);

    const leaveTypeOptions = useMemo(() => {
        if (!leaveTypesData) return [];
        return flattenLeaveTypes(leaveTypesData);
    }, [leaveTypesData]);

    // --- State ---
    const [reportTitle, setReportTitle] = useState('گزارش درخواست‌های مرخصی');
    const [dateFrom, setDateFrom] = useState<DateObject | null>(null);
    const [dateTo, setDateTo] = useState<DateObject | null>(null);

    // ✅ استیت جدید برای خطاها
    const [errors, setErrors] = useState<{ dateFrom?: string; dateTo?: string }>({});

    const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<SelectOption | null>(null);
    const [selectedLeaveType, setSelectedLeaveType] = useState<SelectOption | null>(null);

    const [columnsToShow, setColumnsToShow] = useState({
        details: true,
        organization: true,
        category: true,
        logo: false,
    });

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = event.target;
        setColumnsToShow(prev => ({ ...prev, [id]: checked }));
    };

    const handleExport = () => {
        // ✅ 1. پاک کردن خطاهای قبلی
        setErrors({});
        let hasError = false;
        const newErrors: { dateFrom?: string; dateTo?: string } = {};

        // ✅ 2. اعتبارسنجی دستی
        if (!dateFrom) {
            newErrors.dateFrom = "تاریخ شروع الزامی است";
            hasError = true;
        }
        if (!dateTo) {
            newErrors.dateTo = "تاریخ پایان الزامی است";
            hasError = true;
        }

        // اگر بازه نامعتبر بود (پایان قبل از شروع)
        if (dateFrom && dateTo && dateFrom.toUnix() > dateTo.toUnix()) {
            newErrors.dateTo = "تاریخ پایان نمی‌تواند قبل از شروع باشد";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return; // توقف ارسال
        }

        // ✅ 3. ادامه ارسال در صورت نبود خطا
        const payload: ExportLeaveRequestsParams = {
            title: reportTitle,
            from_date: formatToApiDate(dateFrom),
            to_date: formatToApiDate(dateTo),

            status: selectedStatus?.id as any,
            organization_id: selectedOrg?.id ? Number(selectedOrg.id) : undefined,
            leave_type_id: selectedLeaveType?.id ? Number(selectedLeaveType.id) : undefined,

            with_details: columnsToShow.details,
            with_organization: columnsToShow.organization,
            with_category: columnsToShow.category,
        };

        exportMutation.mutate(payload, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const handleClose = () => {
        if (!exportMutation.isPending) {
            onClose();
            // پاک کردن استیت‌ها هنگام بستن (اختیاری)
            setErrors({});
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-backgroundL-500 dark:bg-backgroundD p-0 text-right align-middle shadow-2xl transition-all border border-borderL dark:border-zinc-800">

                                {/* Header */}
                                <div className="flex justify-between items-center p-5 border-b border-borderL dark:border-zinc-800 bg-secondaryL/30 dark:bg-secondaryD/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primaryL/10 text-primaryL dark:bg-primaryD/20 dark:text-primaryD">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                                                درخواست خروجی اکسل
                                            </Dialog.Title>
                                            <p className="text-xs text-muted-foregroundL dark:text-gray-400">
                                                فیلترها و ستون‌های مورد نیاز را انتخاب کنید
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-muted-foregroundL hover:text-foregroundL dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-8">

                                    {/* ۱. عنوان و تاریخ */}
                                    <div className="space-y-4">
                                        <Input
                                            label="عنوان گزارش (اختیاری)"
                                            value={reportTitle}
                                            onChange={(e) => setReportTitle(e.target.value)}
                                            placeholder="مثال: گزارش مرخصی‌های مرداد ماه"
                                            disabled={exportMutation.isPending}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <PersianDatePickerInput
                                                label="از تاریخ (الزامی)"
                                                value={dateFrom}
                                                onChange={(date) => {
                                                    setDateFrom(date);
                                                    if (date) setErrors(prev => ({ ...prev, dateFrom: undefined }));
                                                }}
                                                placeholder="انتخاب کنید"
                                                containerClassName="w-full"
                                                error={errors.dateFrom} // ✅ نمایش خطا
                                            />
                                            <PersianDatePickerInput
                                                label="تا تاریخ (الزامی)"
                                                value={dateTo}
                                                onChange={(date) => {
                                                    setDateTo(date);
                                                    if (date) setErrors(prev => ({ ...prev, dateTo: undefined }));
                                                }}
                                                placeholder="انتخاب کنید"
                                                containerClassName="w-full"
                                                error={errors.dateTo} // ✅ نمایش خطا
                                            />
                                        </div>
                                    </div>

                                    {/* ۲. فیلترهای پیشرفته */}
                                    <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-borderL dark:border-zinc-800">
                                        <h4 className="text-sm font-bold text-foregroundL dark:text-foregroundD mb-4 flex items-center gap-2">
                                            <Filter size={16} className="text-primaryL dark:text-primaryD" />
                                            فیلترهای پیشرفته
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <SelectBox
                                                label="سازمان (واحد)"
                                                options={organizationOptions}
                                                value={selectedOrg}
                                                onChange={setSelectedOrg}
                                                placeholder={isLoadingOrgs ? "درحال بارگذاری..." : "همه سازمان‌ها"}
                                                disabled={isLoadingOrgs || exportMutation.isPending}

                                            />

                                            <SelectBox
                                                label="نوع مرخصی"
                                                options={leaveTypeOptions}
                                                value={selectedLeaveType}
                                                onChange={setSelectedLeaveType}
                                                placeholder={isLoadingLeaveTypes ? "درحال بارگذاری..." : "همه انواع"}
                                                disabled={isLoadingLeaveTypes || exportMutation.isPending}

                                            />

                                            <SelectBox
                                                label="وضعیت درخواست"
                                                options={statusOptions}
                                                value={selectedStatus}
                                                onChange={setSelectedStatus}
                                                placeholder="همه وضعیت‌ها"
                                                disabled={exportMutation.isPending}

                                            />
                                        </div>
                                    </div>

                                    {/* ۳. انتخاب ستون‌ها */}
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-borderL dark:border-zinc-800">
                                        <label className="text-sm font-bold text-foregroundL dark:text-foregroundD mb-3 block">
                                            ستون‌های خروجی:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <CheckboxItem
                                                id="details"
                                                label="شامل توضیحات و جزئیات"
                                                checked={columnsToShow.details}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                id="organization"
                                                label="نام سازمان/واحد"
                                                checked={columnsToShow.organization}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                id="category"
                                                label="نوع و دسته‌بندی مرخصی"
                                                checked={columnsToShow.category}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                id="logo"
                                                label="هدر رسمی (لوگو)"
                                                checked={columnsToShow.logo}
                                                onChange={handleCheckboxChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 items-start text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <Calendar size={16} className="mt-0.5 flex-shrink-0" />
                                        <p>
                                            فایل خروجی در پس‌زمینه تولید می‌شود. پس از تکمیل، لینک دانلود از طریق اعلان (Notification) برای شما ارسال خواهد شد.
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-3 p-5 border-t border-borderL dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
                                    <Button
                                        variant="ghost"
                                        onClick={handleClose}
                                        disabled={exportMutation.isPending}
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleExport}
                                        disabled={exportMutation.isPending}
                                        className="min-w-[140px] shadow-lg shadow-primaryL/20"
                                    >
                                        {exportMutation.isPending ? (
                                            <>
                                                <Spinner size="sm" className="text-white ml-2" />
                                                <span>در حال ثبت...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} className="ml-2" />
                                                <span>دریافت اکسل</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};