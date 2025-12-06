import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteShiftSchedule } from "@/features/shift-schedule/api/api";
import { shiftScheduleKeys } from "./queryKeys"; // ایمپورت کلیدها از فایل جداگانه

export const useDeleteShiftSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number | string) => deleteShiftSchedule(id),

        onSuccess: async () => {
            // استفاده از کلیدهای مرکزی برای باطل کردن کش
            await queryClient.invalidateQueries({
                queryKey: shiftScheduleKeys.lists(),
            });
            await queryClient.invalidateQueries({ queryKey: ["workPatterns"] });
            toast.success("برنامه شیفتی حذف شد.");
        },

        onError: (error: any) => {
            console.error("useDeleteShiftSchedule (DELETE) onError:", error);

            // مدیریت خطای ۴۰۹ با JSX کاستوم
            if (error.response?.status === 409) {
                toast.error(
                    <div className="text-right text-sm font-vazir" dir="rtl">
                        <div className="font-bold mb-1 flex items-center gap-1">
                            ⛔ حذف غیرمجاز
                        </div>
                        <p className="leading-6">
                            این برنامه شیفتی به تعدادی از کارمندان اختصاص داده شده است و قابل
                            حذف نیست.
                        </p>
                        <p className="mt-2 text-xs opacity-90 border-t border-white/20 pt-1">
                            لطفاً ابتدا کارمندان را مدیریت کنید، سپس اقدام به حذف نمایید.
                        </p>
                    </div>,
                    {
                        autoClose: 6000,
                        className: "font-vazir",
                    }
                );
            } else {
                toast.error(
                    error.response?.data?.message || "خطا در حذف برنامه شیفتی."
                );
            }
        },
    });
};