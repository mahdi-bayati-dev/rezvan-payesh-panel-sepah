import LoginForm from "@/features/auth/components/LoginForm";
import { useAppSelector } from "@/hook/reduxHooks";
import { Navigate } from "react-router-dom";

// ✅ استاندارد: ایمپورت تصویر پس‌زمینه
// لطفاً فایل را به src/assets/images/login/background-login.webp منتقل کن
import bgLogin from "@/assets/images/img-login/background-login.webp";

const LoginPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-backgroundL-500 dark:bg-backgroundD md:p-4">

      <div
        className="relative flex w-full h-screen items-center md:h-auto md:rounded-2xl md:items-end md:max-h-dvh md:aspect-video justify-center bg-cover bg-center overflow-hidden before:absolute before:inset-0 before:bg-backgroundL-500/10 dark:before:bg-backgroundD/30"
        style={{ 
          // ✅ استفاده از متغیر ایمپورت شده
          backgroundImage: `url('${bgLogin}')` 
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;