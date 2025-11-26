import  { Fragment, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, Transition } from "@headlessui/react";
import {
  Download,
  X,
  Calendar,
  FileSpreadsheet,
  Check,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { Spinner } from "@/components/ui/Spinner";
import { type DateObject } from 'react-multi-date-picker';

import { useOrganizations } from "@/features/Organization/hooks/useOrganizations";
import { type Organization } from "@/features/Organization/types";

import {
  ALLOWED_EXPORT_COLUMN_KEYS,
  EXPORT_COLUMN_MAP,
  type AllowedExportColumn,
} from "@/features/reports/types/index";
import {
  type LogFilters,
  type ReportExportPayload,
} from "@/features/reports/api/api";
import { useRequestExport } from "@/features/reports/hooks/hook";

// --- کامپوننت داخلی چک‌باکس (مشابه مدال درخواست‌ها) ---
const CheckboxItem = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
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
        onChange={(e) => onChange(e.target.checked)}
        className="appearance-none absolute inset-0 w-full h-full cursor-pointer"
      />
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span className="text-sm font-medium text-foregroundL dark:text-gray-200 truncate" title={label}>
      {label}
    </span>
  </label>
);

// --- گزینه‌ها ---
const columnOptions = ALLOWED_EXPORT_COLUMN_KEYS.map((key) => ({
  id: key,
  name: EXPORT_COLUMN_MAP[key],
}));

const sortOptions: SelectOption[] = [
  { id: "timestamp", name: "زمان ثبت (پیش‌فرض)" },
  { id: "employee_name", name: "نام کارمند" },
];

const eventTypeOptions: SelectOption[] = [
  { id: "all", name: "همه (پیش‌فرض)" },
  { id: "check_in", name: "فقط ورود" },
  { id: "check_out", name: "فقط خروج" },
];

// --- اسکیما ---
const exportFormSchema = z.object({
  date_from: z.any().nullable().refine((val) => val !== null, {
    message: "تاریخ شروع الزامی است",
  }),
  date_to: z.any().nullable().refine((val) => val !== null, {
    message: "تاریخ پایان الزامی است",
  }),
  columns: z.array(z.string()).min(1, "حداقل یک ستون باید انتخاب شود."),
  sort_by: z.enum(["timestamp", "employee_name"]),
  sort_direction: z.enum(["desc", "asc"]),
  organization_id: z.string().optional(),
  event_type: z.enum(["all", "check_in", "check_out"]),
  has_lateness: z.boolean(),
});

type ExportFormData = z.infer<typeof exportFormSchema>;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: LogFilters;
  onExportStarted: () => void;
  formatApiDate: (date: DateObject | null) => string | undefined;
}

const flattenOrganizationsForSelect = (
  orgs: Organization[],
  level = 0
): SelectOption[] => {
  let flatList: SelectOption[] = [];
  for (const org of orgs) {
    flatList.push({
      id: String(org.id),
      name: `${'ـ '.repeat(level)} ${org.name}`,
    });
    if (org.children && org.children.length > 0) {
      flatList = flatList.concat(
        flattenOrganizationsForSelect(org.children, level + 1)
      );
    }
  }
  return flatList;
};

export const ExportModal = ({
  isOpen,
  onClose,
  onExportStarted,
  formatApiDate,
}: ExportModalProps) => {

  const exportMutation = useRequestExport();

  const { data: organizationsData, isLoading: isLoadingOrganizations } = useOrganizations({ enabled: isOpen });

  const organizationOptions = useMemo(() => {
    if (!organizationsData) return [];
    const allOption: SelectOption = { id: "", name: "همه سازمان‌ها (پیش‌فرض)" };
    const flatList = flattenOrganizationsForSelect(organizationsData);
    return [allOption, ...flatList];
  }, [organizationsData]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      date_from: null,
      date_to: null,
      columns: [
        "timestamp",
        "employee_name",
        "employee_personnel_code",
        "organization_name",
        "event_type",
        "lateness_minutes",
      ],
      sort_by: "timestamp",
      sort_direction: "desc",
      event_type: "all",
      has_lateness: false,
      organization_id: "",
    },
  });

  const selectedColumns = watch("columns");

  const onSubmit = (formData: ExportFormData) => {
    const apiDateFrom = formatApiDate(formData.date_from);
    const apiDateTo = formatApiDate(formData.date_to);

    if (!apiDateFrom || !apiDateTo) return;

    const apiFilters: ReportExportPayload["filters"] = {
      organization_id: formData.organization_id
        ? parseInt(formData.organization_id, 10)
        : undefined,
      event_type:
        formData.event_type === "all" ? undefined : formData.event_type,
      has_lateness: formData.has_lateness || undefined,
    };

    const payload: ReportExportPayload = {
      date_from: apiDateFrom,
      date_to: apiDateTo,
      columns: formData.columns as AllowedExportColumn[],
      sort_by: formData.sort_by,
      sort_direction: formData.sort_direction,
      filters: apiFilters,
    };

    exportMutation.mutate(payload, {
      onSuccess: () => {
        onExportStarted();
      },
    });
  };

  const handleClose = () => {
    if (!exportMutation.isPending) {
      onClose();
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
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

                <form onSubmit={handleSubmit(onSubmit)}>
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
                      type="button"
                      onClick={handleClose}
                      className="text-muted-foregroundL hover:text-foregroundL dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-8">

                    {/* ۱. بخش تاریخ (الزامی) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="date_from"
                        control={control}
                        render={({ field, fieldState }) => (
                          <PersianDatePickerInput
                            label="تاریخ شروع (الزامی)"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            placeholder="انتخاب کنید"
                            containerClassName="w-full"
                          />
                        )}
                      />
                      <Controller
                        name="date_to"
                        control={control}
                        render={({ field, fieldState }) => (
                          <PersianDatePickerInput
                            label="تاریخ پایان (الزامی)"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            placeholder="انتخاب کنید"
                            containerClassName="w-full"
                          />
                        )}
                      />
                    </div>

                    {/* ۲. بخش فیلترهای پیشرفته */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                        <Filter size={16} className="text-primaryL dark:text-primaryD" />
                        فیلترهای پیشرفته
                      </h4>

                      <div className="p-4 rounded-xl border border-borderL dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="organization_id"
                          control={control}
                          render={({ field, fieldState }) => (
                            <SelectBox
                              label="سازمان"
                              placeholder={isLoadingOrganizations ? "در حال بارگذاری..." : "انتخاب کنید"}
                              options={organizationOptions}
                              value={organizationOptions.find((opt) => opt.id === field.value) || null}
                              onChange={(option) => field.onChange(option?.id ?? "")}
                              error={fieldState.error?.message}
                              disabled={isLoadingOrganizations}
                              className=""
                            />
                          )}
                        />

                        <Controller
                          name="event_type"
                          control={control}
                          render={({ field, fieldState }) => (
                            <SelectBox
                              placeholder=""
                              label="نوع رویداد"
                              options={eventTypeOptions}
                              value={eventTypeOptions.find((opt) => opt.id === field.value) || null}
                              onChange={(option) => field.onChange(option?.id)}
                              error={fieldState.error?.message}
                              className=""
                            />
                          )}
                        />

                        <Controller
                          name="sort_by"
                          control={control}
                          render={({ field }) => (
                            <SelectBox
                              placeholder=""
                              label="مرتب‌سازی بر اساس"
                              options={sortOptions}
                              value={sortOptions.find((opt) => opt.id === field.value) || null}
                              onChange={(option) => field.onChange(option?.id)}
                              className=""
                            />
                          )}
                        />

                        <div className="flex flex-col justify-end">
                          <label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
                            جهت و وضعیت
                          </label>
                          <div className="flex gap-2">
                            {/* دکمه‌های جهت مرتب‌سازی */}
                            <div className="flex bg-white dark:bg-zinc-800 rounded-lg border border-borderL dark:border-zinc-700 p-1 h-[42px] items-center">
                              <Controller
                                name="sort_direction"
                                control={control}
                                render={({ field }) => (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => field.onChange("asc")}
                                      className={`p-1.5 rounded-md transition-all ${field.value === 'asc' ? 'bg-primaryL/20 text-primaryL dark:text-primaryD' : 'text-gray-400 hover:text-gray-600'}`}
                                      title="صعودی"
                                    >
                                      <SortAsc size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-borderL dark:bg-zinc-700 mx-1" />
                                    <button
                                      type="button"
                                      onClick={() => field.onChange("desc")}
                                      className={`p-1.5 rounded-md transition-all ${field.value === 'desc' ? 'bg-primaryL/20 text-primaryL dark:text-primaryD' : 'text-gray-400 hover:text-gray-600'}`}
                                      title="نزولی"
                                    >
                                      <SortDesc size={18} />
                                    </button>
                                  </>
                                )}
                              />
                            </div>

                            {/* چک باکس تاخیر */}
                            <Controller
                              name="has_lateness"
                              control={control}
                              render={({ field }) => (
                                <CheckboxItem
                                  id="has_lateness"
                                  label="فقط دارای تاخیر"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ۳. انتخاب ستون‌ها */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-borderL dark:border-zinc-800">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-foregroundL dark:text-foregroundD">
                          ستون‌های خروجی: <span className="text-primaryL dark:text-primaryD text-xs font-normal">({selectedColumns.length} انتخاب شده)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {columnOptions.map((option) => (
                          <Controller
                            key={option.id}
                            name="columns"
                            control={control}
                            render={({ field }) => (
                              <CheckboxItem
                                id={`col-${option.id}`}
                                label={option.name}
                                checked={field.value?.includes(option.id)}
                                onChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.id])
                                    : field.onChange(field.value?.filter((v) => v !== option.id));
                                }}
                              />
                            )}
                          />
                        ))}
                      </div>
                      {errors.columns && (
                        <p className="text-xs text-destructiveL dark:text-destructiveD mt-2">
                          {errors.columns.message}
                        </p>
                      )}
                    </div>

                    {/* راهنما */}
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
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      disabled={exportMutation.isPending}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
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
                          <span>شروع ساخت گزارش</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};