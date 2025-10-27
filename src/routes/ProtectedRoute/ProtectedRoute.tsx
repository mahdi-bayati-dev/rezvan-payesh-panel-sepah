import { useEffect, useRef } from 'react'; // useRef را اضافه کن
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hook/reduxHooks';
import { checkAuthStatus } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui/Spinner';

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const authCheckStatus = useAppSelector((state) => state.auth.initialAuthCheckStatus);
  // ۱. یک ref برای پیگیری اینکه آیا dispatch اولیه انجام شده یا نه
  const didCheckAuth = useRef(false);

  useEffect(() => {
    // ۲. فقط اگر وضعیت 'idle' است و dispatch اولیه هنوز انجام نشده
    if (authCheckStatus === 'idle' && !didCheckAuth.current) {
      console.log('Dispatching checkAuthStatus from ProtectedRoute (once)...');
      dispatch(checkAuthStatus());
      // ۳. علامت بزن که dispatch انجام شد
      didCheckAuth.current = true;
    }
    // وابستگی‌ها بدون تغییر، useRef باعث اجرای مجدد نمی‌شود
  }, [dispatch, authCheckStatus]);

  // نمایش اسپینر (بدون تغییر)
  if (authCheckStatus === 'idle' || authCheckStatus === 'loading') {
    console.log('ProtectedRoute showing spinner (initial check ongoing)...');
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // نمایش محتوا اگر کاربر هست (بدون تغییر)
  if (user) {
    console.log('ProtectedRoute rendering Outlet (user exists).');
    return <Outlet />;
  }

  // ریدایرکت به لاگین اگر کاربر نیست (بدون تغییر)
  console.log('ProtectedRoute navigating to login (check complete, no user). Status:', authCheckStatus);
  return <Navigate to="/login" replace />;
};

