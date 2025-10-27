import LoginForm from "@/features/auth/components/LoginForm";
import { useAppSelector } from "@/hook/reduxHooks";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import { toast } from 'react-toastify'; // نوتیفیکیشن خوش‌آمدگویی حذف شد

const LoginPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  // دیگر نیازی به authCheckStatus در اینجا نداریم

  useEffect(() => {
    // اگر کاربر وجود دارد (چه از لاگین جدید چه از بررسی اولیه)
    // او را به صفحه اصلی هدایت کن
    if (user) {
      console.log('LoginPage navigating to "/" because user exists.');
      navigate('/', { replace: true });
      // نوتیفیکیشن خوش‌آمدگویی بهتر است در صفحه مقصد باشد
      // toast.info(`${user?.user_name} خوش آمدی`, { rtl: true });
    }
  }, [navigate, user]); // فقط به user وابسته است

  // ❌ دیگر نیازی به نمایش اسپینر در اینجا نیست
  // if (authCheckStatus === 'idle' || authCheckStatus === 'loading') { ... }

  console.log('LoginPage rendering Login Form (user does not exist or useEffect pending).');
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-backgroundL-500 md:p-4">
      <div
        className="relative flex w-full h-screen items-center md:h-auto md:rounded-2xl md:items-end md:max-h-dvh md:aspect-video justify-center bg-cover bg-center overflow-hidden before:absolute before:inset-0 before:bg-white/40 dark:before:bg-backgroundD/30"
        style={{ backgroundImage: "url('/img/img-login/background-login.jpg')" }} // مسیر مطلق
      >
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;

