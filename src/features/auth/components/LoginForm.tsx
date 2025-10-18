// src/features/auth/components/LoginForm.tsx
import { User, Lock, SquaresExclude } from "lucide-react";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";

const LoginForm = () => {
  return (
    // کامنت: پدینگ فرم در موبایل کمتر (p-4) و در صفحات بزرگتر (sm) بیشتر می‌شود (sm:p-8).
    <div className="w-full max-w-sm  rounded-t-3xl md:rounded-t-3xl md:rounded-b-0 bg-white/40 p-4 shadow-2xl backdrop-blur-sm sm:p-8 dark:bg-black/50">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          ورود
        </h2>

        <span className="my-2 flex items-center">
          <span className="h-px flex-1 bg-borderL"></span>
          <span className="shrink-0 px-2 text-sm text-borderD sm:px-4 dark:text-backgroundL-500">
            خوش آمدید
          </span>
          <span className="h-px flex-1 bg-borderL"></span>
        </span>

        {/* کامنت: در موبایل لوگو و عنوان روی هم قرار می‌گیرند (flex-col) و در صفحات بزرگتر کنار هم (sm:flex-row) */}
        <div className="flex flex-col items-center justify-center  sm:flex-row">
          <img
            src="img/img-header/logo-1.png"
            alt="لوگوی رضوان پایش"
            // کامنت: اندازه لوگو در موبایل کوچکتر است
            className="h-20 sm:h-24"
          />
          <p className="text-2xl font-bold text-gray-700 sm:text-3xl dark:text-gray-200">
            رضـــوان پایش
          </p>
        </div>
      </div>

      {/* کامنت: فاصله بین فیلدها در موبایل کمی کمتر است */}
      <form className="mt-6 space-y-4">
        {/* اینپوت‌ها نیازی به تغییر ندارند چون w-full هستند */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-primaryL focus:outline-none focus:ring-1 focus:ring-primaryL dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primaryD"
            placeholder="نام کاربری"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-primaryL focus:outline-none focus:ring-1 focus:ring-primaryL dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primaryD"
            placeholder="رمز عبور"
          />
        </div>

        {/* کامنت: دکمه‌ها در موبایل زیر هم (flex-col) و در صفحات بزرگتر کنار هم (sm:flex-row) قرار می‌گیرند */}
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-primaryL py-2 text-sm font-bold text-white shadow-lg transition hover:opacity-80 dark:bg-primaryD dark:text-black px-20 "
          >
            ورود
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-primaryL py-1 text-sm font-bold text-primaryL transition hover:bg-primaryL hover:text-white dark:border-primaryD dark:text-primaryD dark:hover:bg-primaryD dark:hover:text-black"
          >
            ثبت نام
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-borderL pt-4 dark:border-borderD">
        <span className="flex items-center gap-2 text-sm font-medium text-foregroundL dark:text-foregroundD">
          <SquaresExclude size={20} />
          تم صفحه:
        </span>
        <ThemeToggleBtn />
      </div>
    </div>
  );
};

export default LoginForm;
