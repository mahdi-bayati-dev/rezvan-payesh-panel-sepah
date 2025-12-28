import LoginForm from "@/features/auth/components/LoginForm";
import { useAppSelector } from "@/hook/reduxHooks";
import { Navigate } from "react-router-dom";

// ✅ ایمپورت پس‌زمینه و لوگوها
import bgLogin from "@/assets/images/img-login/background-login.webp";
import logoLight from "@/assets/images/img-header/logo-1.png";
import logoDark from "@/assets/images/img-header/logo-2.png";

const LoginPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.ui.theme);

  // انتخاب لوگو بر اساس تم سیستم
  const logoSrc = theme === "dark" ? logoDark : logoLight;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-backgroundL-500 dark:bg-backgroundD p-3 sm:p-4 overflow-hidden font-vazir">
      <div
        className="relative flex w-full h-full flex-col items-center md:items-end md:h-auto rounded-[2.5rem] md:max-h-dvh md:aspect-video justify-center bg-cover bg-center overflow-hidden shadow-2xl border border-white/5"
        style={{
          backgroundImage: `url('${bgLogin}')`
        }}
      >
        {/* لایه محافظ برای بهبود کنتراست (Overlay) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 dark:from-black/60 dark:to-black/80 z-0"></div>

        {/* ✅ بخش متنی و لوگو (هدر) - بازطراحی شده برای حرفه‌ای‌تر شدن */}
        {/* ✅ هدر بازطراحی شده با استایل فوق حرفه‌ای و سایه‌های چندلایه */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-12 lg:p-16 z-20 flex flex-col items-center md:items-start pointer-events-none select-none" dir="ltr">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-7xl">

            {/* کانتینر لوگو: اضافه شدن سایه نئونی ملایم و بوردر براق */}
            <div className="p-4 md:p-5 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/30 
                    shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.1)] 
                    hover:border-white/50 transition-all duration-500 animate-in fade-in zoom-in ">
              <img
                src={logoSrc}
                alt="Logo"
                className="h-20 md:h-32 lg:h-24 w-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]"
              />
            </div>

            {/* بخش متنی: استفاده از سایه‌های متن ترکیبی برای خوانایی خیره‌کننده */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 md:space-y-4">

              {/* تیتر اصلی با سایه سنگین و Glow ملایم */}
              <h1 className="text-white text-3xl md:text-5xl lg:text-4xl font-black leading-tight tracking-tighter
                     drop-shadow-[0_10px_20px_rgba(0,0,0,1)] filter">
                مرکز هوش مصنوعی و فناوری‌های نوظهور
              </h1>

              {/* زیرعنوان با پس‌زمینه محو ملایم برای تفکیک بهتر از ویدیو/عکس پشت */}
              <p className="text-white/95 text-xl md:text-3xl font-bold px-4 py-1 rounded-lg
                    bg-black/20 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)]
                    ">
                سپاه ثارالله استان کرمان
              </p>

            </div>
          </div>
        </div>
        {/* فرم ورود در پایین صفحه */}
        <div className="relative z-10 w-full flex justify-center md:justify-center px-0 md:px-0 mt-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;