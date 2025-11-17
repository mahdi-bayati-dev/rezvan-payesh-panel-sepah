import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
// 1. Input دیگر استفاده نمی‌شود، اما SelectBox لازم است
// import Input from "@/components/ui/Input";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Checkbox from "@/components/ui/Checkbox";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from 'react-multi-date-picker';

// --- ایمپورت‌های جدید ---
// 2. ایمپورت هوک و تایپ سازمان‌ها
import { useOrganizations } from "@/features/Organization/hooks/useOrganizations";
import { type Organization } from "@/features/Organization/types";
// --- ---

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
import { Loader2 } from "lucide-react";

// (گزینه‌های ستون‌ها، مرتب‌سازی، و نوع رویداد بدون تغییر)
// ... (columnOptions, sortOptions, eventTypeOptions) ...
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


// (اسکیما Zod بدون تغییر باقی می‌ماند، چون organization_id همچنان رشته اختیاری است)
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
  // 3. این فیلد همچنان string است که ID سازمان یا "" (برای همه) را نگه می‌دارد
  organization_id: z.string().optional(),
  event_type: z.enum(["all", "check_in", "check_out"]),
  has_lateness: z.boolean(),
});
type ExportFormData = z.infer<typeof exportFormSchema>;

// (پراپ‌های ExportModalProps بدون تغییر)
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: LogFilters;
  onExportStarted: () => void;
  formatApiDate: (date: DateObject | null) => string | undefined;
}

// --- 4. تابع کمکی برای مسطح کردن درخت سازمان‌ها (از ماژول سازمان قرض گرفته شده) ---
// (این تابع SelectOption برمی‌گرداند)
const flattenOrganizationsForSelect = (
  orgs: Organization[],
  level = 0
): SelectOption[] => {
  let flatList: SelectOption[] = [];
  for (const org of orgs) {
    flatList.push({
      // ID را به رشته تبدیل می‌کنیم تا با SelectBox هماهنگ باشد
      id: String(org.id),
      // از 'ـ' برای نمایش تورفتگی و سلسله‌مراتب استفاده می‌کنیم
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

  // --- 5. واکشی لیست سازمان‌ها ---
  const {
    data: organizationsData,
    isLoading: isLoadingOrganizations
  } = useOrganizations({ enabled: isOpen }); // فقط زمانی که مودال باز است واکشی کن

  // --- 6. ساخت گزینه‌های SelectBox ---
  const organizationOptions = useMemo(() => {
    if (!organizationsData) return [];
    // گزینه "همه" را در ابتدا اضافه می‌کنیم
    const allOption: SelectOption = { id: "", name: "همه سازمان‌ها (پیش‌فرض)" };
    const flatList = flattenOrganizationsForSelect(organizationsData);
    return [allOption, ...flatList];
  }, [organizationsData]);


  const {
    control,
    handleSubmit,
    // 7. register دیگر برای organization_id استفاده نمی‌شود
    // register,
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
      // 8. مقدار پیش‌فرض "" به معنی "همه سازمان‌ها" است
      organization_id: "",
    },
  });

  const selectedColumns = watch("columns");

  // (تابع onSubmit بدون تغییر کار می‌کند)
  // چون organization_id: "" به parseInt(undefined) تبدیل می‌شود که خروجی undefined دارد
  // و organization_id: "123" به parseInt(123) تبدیل می‌شود.
  const onSubmit = (formData: ExportFormData) => {
    const apiDateFrom = formatApiDate(formData.date_from);
    const apiDateTo = formatApiDate(formData.date_to);

    if (!apiDateFrom || !apiDateTo) {
      return;
    }

    const apiFilters: ReportExportPayload["filters"] = {
      // 9. این منطق همچنان کاملا درست کار می‌کند
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

  const memoizedColumnOptions = useMemo(() => columnOptions, []);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogContent className="max-w-3xl" onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            {/* ... (Header بدون تغییر) ... */}
            <DialogTitle>درخواست خروجی اکسل (گزارش تردد)</DialogTitle>
            <DialogDescription>
              فیلترها و ستون‌های مورد نیاز خود را انتخاب کنید. تاریخ شروع و پایان الزامی است.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6">

            {/* (بخش تاریخ بدون تغییر) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-xl bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
              {/* ... (Controller date_from) ... */}
              <Controller
                name="date_from"
                control={control}
                render={({ field, fieldState }) => (
                  <PersianDatePickerInput
                    label="تاریخ شروع (الزامی)"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="انتخاب تاریخ شروع..."
                  />
                )}
              />
              {/* ... (Controller date_to) ... */}
              <Controller
                name="date_to"
                control={control}
                render={({ field, fieldState }) => (
                  <PersianDatePickerInput
                    label="تاریخ پایان (الزامی)"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="انتخاب تاریخ پایان..."
                  />
                )}
              />
            </div>

            {/* (بخش ستون‌ها بدون تغییر) */}
            <div>
              {/* ... (Column selection UI) ... */}
              <label className="font-semibold text-foregroundL dark:text-foregroundD">
                انتخاب ستون‌ها ({selectedColumns.length})
              </label>
              <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mb-2">
                ستون‌هایی که می‌خواهید در فایل اکسل باشند را انتخاب کنید.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 border rounded-lg bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
                {memoizedColumnOptions.map((option) => (
                  <Controller
                    key={option.id}
                    name="columns"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`col-${option.id}`}
                          label=""
                          checked={field.value?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, option.id])
                              : field.onChange(
                                field.value?.filter((v) => v !== option.id)
                              );
                          }}
                        />
                        <label
                          htmlFor={`col-${option.id}`}
                          className="text-sm cursor-pointer text-foregroundL dark:text-foregroundD"
                        >
                          {option.name}
                        </label>
                      </div>
                    )}
                  />
                ))}
              </div>
              {errors.columns && (
                <p className="text-xs text-destructiveL dark:text-destructiveD mt-1">
                  {errors.columns.message}
                </p>
              )}
            </div>

            {/* بخش ۲: مرتب‌سازی و فیلترها (اصلاح فیلد سازمان) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* (Controller sort_by بدون تغییر) */}
              <Controller
                name="sort_by"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectBox
                    label="مرتب‌سازی بر اساس"
                    placeholder="انتخاب کنید..."
                    options={sortOptions}
                    value={
                      sortOptions.find((opt) => opt.id === field.value) || null
                    }
                    onChange={(option) => field.onChange(option?.id)}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* (فیلد جهت مرتب‌سازی بدون تغییر) */}
              <div className="flex flex-col">
                {/* ... (Sort direction UI) ... */}
                <label className="block text-sm font-medium mb-2 text-foregroundL dark:text-foregroundD">
                  جهت مرتب‌سازی
                </label>
                <div className="flex gap-4 p-3 border rounded-xl h-[46px] items-center bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
                  <Controller
                    name="sort_direction"
                    control={control}
                    render={({ field }) => (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="sort_desc"
                            value="desc"
                            checked={field.value === "desc"}
                            onChange={field.onChange}
                            className="form-radio text-primaryL dark:text-primaryD"
                          />
                          <label
                            htmlFor="sort_desc"
                            className="text-foregroundL dark:text-foregroundD"
                          >
                            نزولی (پیش‌فرض)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="sort_asc"
                            value="asc"
                            checked={field.value === "asc"}
                            onChange={field.onChange}
                            className="form-radio text-primaryL dark:text-primaryD"
                          />
                          <label
                            htmlFor="sort_asc"
                            className="text-foregroundL dark:text-foregroundD"
                          >
                            صعودی
                          </label>
                        </div>
                      </>
                    )}
                  />
                </div>
              </div>

              {/* --- 10. جایگزینی Input با Controller و SelectBox --- */}
              <Controller
                name="organization_id"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectBox
                    label="فیلتر سازمان (اختیاری)"
                    placeholder={isLoadingOrganizations ? "در حال بارگذاری..." : "انتخاب کنید..."}
                    options={organizationOptions}
                    // مقدار فیلد (id) را با گزینه‌ها مقایسه می‌کنیم
                    value={organizationOptions.find((opt) => opt.id === field.value) || null}
                    // ID (رشته‌ای) گزینه انتخاب شده را به فرم پاس می‌دهیم
                    onChange={(option) => field.onChange(option?.id ?? "")}
                    error={fieldState.error?.message}
                    disabled={isLoadingOrganizations}
                  />
                )}
              />
              {/* --- پایان جایگزینی --- */}


              {/* (Controller event_type بدون تغییر) */}
              <Controller
                name="event_type"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectBox
                    label="فیلتر نوع رویداد"
                    placeholder="انتخاب کنید..."
                    options={eventTypeOptions}
                    value={
                      eventTypeOptions.find((opt) => opt.id === field.value) ||
                      null
                    }
                    onChange={(option) => field.onChange(option?.id)}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* (فیلد تاخیر بدون تغییر) */}
              <div className="flex items-center gap-2 p-3 border rounded-xl md:mt-8 bg-backgroundL-DEFAULT dark:bg-backgroundD-800">
                {/* ... (Checkbox has_lateness) ... */}
                <Controller
                  name="has_lateness"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="has_lateness"
                      label=""
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor="has_lateness"
                  className="text-sm cursor-pointer text-foregroundL dark:text-foregroundD"
                >
                  فقط رکوردهای دارای تاخیر
                </label>
              </div>
            </div>
          </div>

          {/* (فوتر و دکمه‌ها بدون تغییر) */}
          <DialogFooter className="border-t flex gap-2 border-borderL dark:border-borderD">
            {/* ... (Cancel button) ... */}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={exportMutation.isPending}
            >
              لغو
            </Button>
            {/* ... (Submit button) ... */}
            <Button
              type="submit"
              variant="primary"
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              )}
              {exportMutation.isPending
                ? "در حال ارسال..."
                : "شروع ساخت گزارش"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};