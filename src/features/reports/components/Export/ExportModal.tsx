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
import Input from "@/components/ui/Input";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Checkbox from "@/components/ui/Checkbox";

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

// (گزینه‌ها، اسکیما و تایپ‌ها بدون تغییر)
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
const exportFormSchema = z.object({
  columns: z.array(z.string()).min(1, "حداقل یک ستون باید انتخاب شود."),
  sort_by: z.enum(["timestamp", "employee_name"]),
  sort_direction: z.enum(["desc", "asc"]),
  organization_id: z.string().optional(),
  event_type: z.enum(["all", "check_in", "check_out"]),
  has_lateness: z.boolean(),
});
type ExportFormData = z.infer<typeof exportFormSchema>;

// (پراپ‌ها بدون تغییر)
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: LogFilters;
  onExportStarted: () => void;
}

export const ExportModal = ({
  isOpen,
  onClose,
  currentFilters,
  onExportStarted,
}: ExportModalProps) => {
  // (هوک‌ها و onSubmit بدون تغییر)
  const exportMutation = useRequestExport();

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
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
    const apiFilters: ReportExportPayload["filters"] = {
      organization_id: formData.organization_id
        ? parseInt(formData.organization_id, 10)
        : undefined,
      event_type:
        formData.event_type === "all" ? undefined : formData.event_type,
      has_lateness: formData.has_lateness || undefined,
    };

    const payload: ReportExportPayload = {
      date_from: currentFilters.date_from || "1970-01-01",
      date_to:
        currentFilters.date_to || new Date().toISOString().split("T")[0],
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
            <DialogTitle>درخواست خروجی اکسل (گزارش تردد)</DialogTitle>
            <DialogDescription>
              فیلترها و ستون‌های مورد نیاز خود را انتخاب کنید. گزارش در پس‌زمینه
              ساخته شده و لینک دانلود ارسال خواهد شد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6">
            {/* (بخش ستون‌ها بدون تغییر) */}
            <div>
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

            {/* بخش ۲: مرتب‌سازی و فیلترها */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="sort_by"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectBox
                    label="مرتب‌سازی بر اساس"
                    placeholder="انتخاب کنید..."
                    options={sortOptions}
                    // --- [اصلاح ۱] افزودن '|| null' ---
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

              {/* (فیلد ID سازمان بدون تغییر) */}
              <Input
                label="فیلتر سازمان (ID)"
                type="number"
                placeholder="ID سازمان را وارد کنید (اختیاری)"
                {...register("organization_id")}
              />

              <Controller
                name="event_type"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectBox
                    label="فیلتر نوع رویداد"
                    placeholder="انتخاب کنید..."
                    options={eventTypeOptions}
                    // --- [اصلاح ۲] افزودن '|| null' ---
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
          <DialogFooter className="border-t border-borderL dark:border-borderD">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={exportMutation.isPending}
            >
              لغو
            </Button>
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