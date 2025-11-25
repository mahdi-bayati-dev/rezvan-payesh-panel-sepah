import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { importUsers, type ImportUserPayload } from "../api/api";

export const useImportUsers = () => {
  return useMutation({
    mutationFn: (payload: ImportUserPayload) => importUsers(payload),
    // ✅ اصلاح: حذف آرگومان data چون استفاده نمی‌شود
    onSuccess: () => {
      // طبق داکیومنت، عملیات در صف انجام می‌شود (200 OK)
      // پس به کاربر می‌گوییم عملیات شروع شده است
      toast.success(
        "✅ فایل با موفقیت آپلود شد. پردازش در پس‌زمینه انجام می‌شود."
      );
      toast.info(
        "⏳ نتیجه عملیات پس از پردازش اعمال خواهد شد. می‌توانید پنجره را ببندید."
      );
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "خطا در آپلود فایل.";

      if (status === 422) {
        // خطای ولیدیشن فایل یا پارامترها
        toast.error(`خطای اعتبارسنجی: ${message}`);
      } else if (status === 500) {
        // خطای سرور یا صف
        toast.error("خطای سرور. لطفاً با پشتیبانی تماس بگیرید.");
      } else {
        toast.error(message);
      }
    },
  });
};
