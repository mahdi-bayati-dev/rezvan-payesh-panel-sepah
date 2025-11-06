import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

export const newShiftScheduleSchema = z.object({
  name: z
    .string()
    .min(1, "نام برنامه شیفتی الزامی است")
    .max(255, "نام برنامه طولانی است"),

  cycle_length_days: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "طول چرخه الزامی است و باید عدد باشد.",
    })
    .int({ message: "طول چرخه باید عدد صحیح باشد." })
    .min(1, "طول چرخه باید حداقل ۱ روز باشد.")
    .max(31, "طول چرخه نباید بیشتر از ۳۱ روز باشد."),

  cycle_start_date: z
    .string()
    .min(1, "تاریخ شروع چرخه الزامی است.")
    .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),
});

export type NewShiftScheduleFormData = z.infer<typeof newShiftScheduleSchema>;
