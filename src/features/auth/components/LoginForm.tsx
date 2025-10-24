import { User, Lock, SquaresExclude, Loader2 } from "lucide-react"; // Loader2 برای نمایش وضعیت لودینگ
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/features/auth/schema/loginSchema'; // ایمپورت اسکیما و تایپ
import { useAppDispatch, useAppSelector } from '@/hook/reduxHooks'; // هوک‌های تایپ شده Redux (باید در پروژه تعریف شوند)
import { loginUser } from '@/store/slices/authSlice'; // ایمپورت Async Thunk
import Input from '@/components/ui/Input'; // ایمپورت کامپوننت Input ماژولار

const LoginForm = () => {
  const theme = useAppSelector((state) => state.ui.theme)

  const logoSrc =
    theme === "dark"
      ? "/img/img-header/logo-2.png" // مسیر مطلق از ریشه سایت
      : "/img/img-header/logo-1.png"; // مسیر مطلق از ریشه سایت
  // --- ۱. اتصال به Redux ---
  const dispatch = useAppDispatch(); // هوک dispatch تایپ شده
  // انتخاب وضعیت‌های مورد نیاز از state ریداکس
  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);
  const isLoading = authStatus === 'loading'; // محاسبه وضعیت لودینگ

  // --- ۲. اتصال به React Hook Form ---
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // اتصال به Zod
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // --- ۳. تابع onSubmit ---
  // این تابع زمانی که فرم معتبر باشد توسط handleSubmit فراخوانی می‌شود
  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    // dispatch کردن Async Thunk با داده‌های فرم
    console.log('==>',data);

    dispatch(loginUser(data));
    console.log(data);
    
  };

  return (
    // استایل‌های کلی فرم (بدون تغییر زیاد)
    <div className="w-full max-w-sm rounded-t-3xl md:rounded-t-3xl md:rounded-b-0 bg-white/40 p-4 shadow-2xl backdrop-blur-sm sm:p-8 dark:bg-black/50">
      {/* هدر فرم (بدون تغییر) */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">ورود</h2>
        {/* ... (بقیه هدر: خط جداکننده، لوگو، عنوان) ... */}
        <span className="my-2 flex items-center">
          <span className="h-px flex-1 bg-borderL"></span>
          <span className="shrink-0 px-2 text-sm text-borderD sm:px-4 dark:text-backgroundL-500">
            خوش آمدید
          </span>
          <span className="h-px flex-1 bg-borderL"></span>
        </span>
        <div className="flex flex-col items-center justify-center  sm:flex-row">
          <img
            src={logoSrc} // ✅ مسیرها را مطلق کنید
            alt="لوگوی رضوان پایش"
            className="h-20 sm:h-24"
          />
          <p className="text-2xl font-bold text-gray-700 sm:text-3xl dark:text-gray-200">
            رضـــوان پایش
          </p>
        </div>
      </div>

      {/* --- ۴. بدنه فرم با React Hook Form --- */}
      {/* handleSubmit وظیفه اعتبارسنجی و فراخوانی onSubmit را دارد */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {/* استفاده از کامپوننت Input ماژولار */}
        <Input
          id="username"
          label="نام کاربری" // لیبل برای accessibility بهتر
          type="text"
          placeholder="نام کاربری خود را وارد کنید"
          icon={<User className="h-5 w-5 text-gray-400" />} // آیکون به عنوان prop
          // اتصال به React Hook Form با register
          {...register('username')}
          // نمایش خطا از errors
          error={errors.username?.message}
          // غیرفعال کردن در زمان لودینگ
          disabled={isLoading}
        />

        <Input
          id="password"
          label="رمز عبور"
          type="password"
          placeholder="رمز عبور خود را وارد کنید"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          {...register('password')}
          error={errors.password?.message}
          disabled={isLoading}
        />

        {/* --- ۵. نمایش خطای کلی لاگین از Redux --- */}
        {authStatus === 'failed' && authError && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{authError}</p>
        )}

        {/* دکمه‌های فرم */}
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <button
            type="submit"
            className="w-full flex justify-center items-center rounded-xl bg-primaryL py-2 px-4 text-sm font-bold text-white shadow-lg transition hover:opacity-80 disabled:opacity-50 dark:bg-primaryD dark:text-black"
            // غیرفعال کردن دکمه در زمان لودینگ
            disabled={isLoading}
          >
            {/* --- ۶. نمایش آیکون لودینگ --- */}
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>
          {/* دکمه ثبت نام (فعلاً غیرفعال) */}
          <button
            type="button"
            className="w-full rounded-xl border border-primaryL py-2 text-sm font-bold text-primaryL transition hover:bg-primaryL hover:text-white dark:border-primaryD dark:text-primaryD dark:hover:bg-primaryD dark:hover:text-black disabled:opacity-50"
            disabled={isLoading}
            onClick={() => alert('صفحه ثبت نام هنوز پیاده‌سازی نشده است.')} // رویداد موقت
          >
            ثبت نام
          </button>
        </div>
      </form>

      {/* بخش تم (بدون تغییر) */}
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

