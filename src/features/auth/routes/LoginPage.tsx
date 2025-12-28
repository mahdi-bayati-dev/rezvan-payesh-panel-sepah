import LoginForm from "@/features/auth/components/LoginForm";
import { useAppSelector } from "@/hook/reduxHooks";
import { Navigate } from "react-router-dom";

// ✅ استفاده از مسیر اصلی تصویر در پروژه شما
import bgLogin from "@/assets/images/img-login/background-login.webp";

const LoginPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    /**
     * تغییرات:
     * 1. p-3 sm:p-4: اضافه کردن پدینگ در همه حالت‌ها برای ایجاد فاصله از لبه‌ها
     * 2. h-dvh & overflow-hidden: برای اطمینان از عدم اسکرول
     */
    <div className="flex h-dvh w-full items-center justify-center bg-backgroundL-500 dark:bg-backgroundD p-3 sm:p-4 overflow-hidden">
      <div
        /**
         * تغییرات:
         * 3. h-full: پر کردن فضای داخلی پدینگ والد
         * 4. rounded-2xl: حذف md: تا در موبایل هم گوشه‌ها گرد باشند و فاصله دیده شود
         */
        className="relative flex w-full h-full flex-col items-center md:items-end md:h-auto rounded-3xl md:max-h-dvh md:aspect-video justify-center bg-cover bg-center overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `url('${bgLogin}')`
        }}
      >
        {/* لایه محافظ برای بهبود کنتراست متن‌ها و فرم */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-0"></div>

        {/* ✅ بخش متنی در بالاترین قسمت */}
        <div className="absolute top-0 left-0 w-full p-8 md:p-14 z-20 flex flex-col items-center md:items-end pointer-events-none select-none">
          <div className="flex flex-col items-center md:items-end">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-black text-center md:text-right drop-shadow-[0_4px_15px_rgba(0,0,0,1)] tracking-tighter transition-all duration-300">
              سپاه ثارالله استان کرمان
            </h1>

            <div className="w-16 md:w-32 h-1 bg-primaryL dark:bg-primaryD rounded-full my-2 md:my-3 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>

            <h2 className="text-white/95 text-xs sm:text-sm md:text-xl font-bold text-center md:text-right drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] opacity-90">
              مرکز هوش مصنوعی و فناوری‌های نوظهور
            </h2>
          </div>
        </div>

        {/* ✅ قرارگیری فرم در پایین (items-end) طبق درخواست شما */}
        <div className="relative z-10 w-full flex justify-center md:justify-center px-0 md:px-0 mt-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;