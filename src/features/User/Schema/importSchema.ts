import { z } from "zod";

// حداکثر حجم فایل: 5 مگابایت (طبق داکیومنت PDF)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
];

export const importUserSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "انتخاب فایل الزامی است.")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "حجم فایل نباید بیشتر از ۵ مگابایت باشد."
    )
    .refine(
      (file) =>
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        // گاهی اوقات مرورگر تایپ csv را درست تشخیص نمی‌دهد، پس پسوند را هم چک می‌کنیم
        /\.(xlsx|xls|csv)$/i.test(file.name),
      "فرمت فایل باید Excel (.xlsx, .xls) یا CSV باشد."
    ),
  organization_id: z.number(),
  default_password: z.boolean(),
  work_group_id: z.number().nullable().optional(),
  shift_schedule_id: z.number().nullable().optional(),
});

export type ImportUserFormData = z.infer<typeof importUserSchema>;
