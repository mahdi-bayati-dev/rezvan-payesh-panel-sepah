import { useEffect, useRef, useState } from "react";
import { User, Lock, SquaresExclude, Loader2, Info, UserPlus } from "lucide-react";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import type { Id as ToastId } from 'react-toastify';

// ✅ ایمپورت کامپوننت‌های UI
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import { ThemeToggleBtn } from "@/components/ui/ThemeToggleBtn";
// اضافه کردن کامپوننت‌های مدال
import { Modal, ModalHeader, ModalBody } from "@/components/ui/Modal";

import { loginSchema, type LoginFormData } from '../schema/loginSchema';
import { useAppDispatch, useAppSelector } from '@/store/index';
import { loginUser, resetAuthStatus } from '@/store/slices/authSlice';

const LoginForm = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector((state) => state.auth.loginStatus);
  const authError = useAppSelector((state) => state.auth.error);
  const isLoading = authStatus === 'loading';

  // ✅ استیت برای مدیریت نمایش مدال ثبت نام
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const logoSrc = theme === "dark"
    ? "/img/img-header/logo-2.webp"
    : "/img/img-header/logo-1.webp";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loadingToastId = useRef<ToastId | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetAuthStatus());
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
    };
  }, [dispatch]);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    dispatch(resetAuthStatus());
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (authStatus === 'loading') {
      loadingToastId.current = toast.loading("در حال بررسی اطلاعات...", { rtl: true });
    }

    if (authStatus === 'succeeded') {
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
      toast.success("ورود با موفقیت انجام شد!", { rtl: true });
    }

    if (authStatus === 'failed' && authError) {
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
      toast.error(authError, { rtl: true });
    }

  }, [authStatus, authError]);

  return (
    <div className="w-full max-w-sm rounded-t-3xl md:rounded-t-3xl md:rounded-b-0 bg-backgroundL-500/60 p-4 shadow-2xl backdrop-blur-md sm:p-8 dark:bg-backgroundD/60 animate-in fade-in zoom-in-95 duration-300 border border-white/20 dark:border-zinc-800">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foregroundL dark:text-foregroundD">ورود</h2>
        <span className="my-2 flex items-center">
          <span className="h-px flex-1 bg-borderL/50 dark:bg-borderD/50"></span>
          <span className="shrink-0 px-2 text-sm text-muted-foregroundL sm:px-4 dark:text-muted-foregroundD">
            خوش آمدید
          </span>
          <span className="h-px flex-1 bg-borderL/50 dark:bg-borderD/50"></span>
        </span>
        <div className="flex flex-col items-center justify-center sm:flex-row gap-2">
          <img
            src={logoSrc}
            alt="لوگوی رضوان پایش"
            className="h-16 w-auto sm:h-20 object-contain"
          />
          <p className="text-xl font-bold text-foregroundL sm:text-2xl dark:text-foregroundD">
            رضـــوان پایش
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          id="username"
          label="نام کاربری"
          type="text"
          autoComplete="username"
          placeholder="نام کاربری خود را وارد کنید"
          icon={<User className="h-5 w-5 text-muted-foregroundL dark:text-muted-foregroundD" />}
          {...register('username')}
          error={errors.username?.message}
          disabled={isLoading}
        />

        <Input
          id="password"
          label="رمز عبور"
          type="password"
          autoComplete="current-password"
          placeholder="رمز عبور خود را وارد کنید"
          icon={<Lock className="h-5 w-5 text-muted-foregroundL dark:text-muted-foregroundD" />}
          {...register('password')}
          error={errors.password?.message}
          disabled={isLoading}
        />

        {authStatus === 'failed' && authError && (
          <Alert variant="destructive" className="py-2 bg-destructiveL-background text-destructiveL-foreground border-destructiveL-foreground/10 dark:bg-destructiveD-background dark:text-destructiveD-foreground">
            <AlertDescription className="text-center font-medium">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-lg bg-primaryL text-primary-foregroundL hover:bg-primaryL/90 dark:bg-primaryD dark:text-primary-foregroundD shadow-primaryL/25 dark:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primaryL/50 text-primaryL hover:bg-primaryL hover:text-white dark:border-primaryD/50 dark:text-primaryD dark:hover:bg-primaryD dark:hover:text-black"
            disabled={isLoading}
            // ✅ باز کردن مدال راهنما به جای Toast
            onClick={() => setIsRegisterModalOpen(true)}
          >
            ثبت نام
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between border-t border-borderL pt-4 dark:border-borderD">
        <span className="flex items-center gap-2 text-sm font-medium text-foregroundL dark:text-foregroundD">
          <SquaresExclude size={18} />
          تم صفحه:
        </span>
        <ThemeToggleBtn />
      </div>

      {/* ✅ مدال راهنمای ثبت نام */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        size="md"
      >
        <ModalHeader onClose={() => setIsRegisterModalOpen(false)}>
          <div className="flex items-center gap-2 text-foregroundL dark:text-foregroundD">
            <UserPlus className="h-5 w-5 text-primaryL dark:text-primaryD" />
            <span>راهنمای ایجاد حساب کاربری</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4 text-center px-2">
            <div className="p-4 bg-secondaryL/50 rounded-full dark:bg-secondaryD/50">
              <Info className="h-10 w-10 text-primaryL dark:text-primaryD" />
            </div>

            <h4 className="text-lg font-bold text-foregroundL dark:text-foregroundD">
              نحوه دریافت نام کاربری
            </h4>

            <p className="text-sm leading-7 text-muted-foregroundL dark:text-muted-foregroundD">
              در سامانه <strong className="text-foregroundL dark:text-foregroundD">رضوان پایش</strong>، حساب‌های کاربری به صورت متمرکز مدیریت می‌شوند.
              <br />
              برای ایجاد حساب جدید، لطفاً با <strong className="text-foregroundL dark:text-foregroundD">مدیر ارشد</strong> یا مسئول سیستم در سازمان خود تماس بگیرید.
            </p>

            <div className="w-full rounded-lg bg-secondaryL/30 p-3 border border-borderL dark:bg-secondaryD/30 dark:border-borderD mt-2">
              <p className="text-xs text-foregroundL dark:text-foregroundD font-medium">
                نام کاربری و رمز عبور پس از تایید هویت، توسط مدیریت در اختیار شما قرار خواهد گرفت.
              </p>
            </div>

            <Button
              className="w-full mt-4 bg-primaryL text-primary-foregroundL hover:bg-primaryL/90 dark:bg-primaryD dark:text-primary-foregroundD"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              متوجه شدم
            </Button>
          </div>
        </ModalBody>
      </Modal>

    </div>
  );
};

export default LoginForm;