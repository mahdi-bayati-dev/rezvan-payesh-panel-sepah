import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector, useAppDispatch } from "@/hook/reduxHooks";
import { fetchLicenseStatus, selectLicenseStatus } from "@/store/slices/licenseSlice";
import { selectIsLicenseLocked, selectAuthCheckStatus } from "@/store/slices/authSlice";

import { GlobalWebSocketHandler } from './GlobalWebSocketHandler';
import { GlobalRequestSocketHandler } from './GlobalRequestSocketHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalNotificationHandler } from '@/features/reports/components/Export/DownloadToast';
import { useImageNotificationSocket } from '@/features/ConfirmPhotos/hooks/useImageNotificationSocket';
import { useAdminImageSocket } from '@/features/ConfirmPhotos/hooks/useAdminImageSocket';
import { GlobalAppSkeleton } from "./GlobalAppSkeleton";
import OnboardingSystem from '../../features/Onboarding/OnboardingModule';
import { TimeSyncGuard } from "@/features/system-check/components/TimeSyncModal";

export const MainLayout = () => {
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLicensePage = location.pathname === '/license';

  const licenseStatus = useAppSelector(selectLicenseStatus);
  const isAuthLocked = useAppSelector(selectIsLicenseLocked);
  const authStatus = useAppSelector(selectAuthCheckStatus);

  // ۱. اولویت بسیار بالا: دریافت وضعیت لایسنس به محض احراز هویت موفق
  useEffect(() => {
    if (authStatus === 'succeeded' && !licenseStatus) {
      dispatch(fetchLicenseStatus());
    }
  }, [dispatch, authStatus, licenseStatus]);

  // ۲. مدیریت ریدایرکت‌های لایسنس
  useEffect(() => {
    const invalidLicenseStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];
    const isLicenseInvalid = licenseStatus && invalidLicenseStatuses.includes(licenseStatus);
    const shouldRedirect = isAuthLocked || isLicenseInvalid;

    if (shouldRedirect && !isLicensePage) {
      navigate('/license', { replace: true });
    }
  }, [isAuthLocked, licenseStatus, isLicensePage, navigate]);

  useImageNotificationSocket();
  useAdminImageSocket();

  // اگر هنوز وضعیت احراز هویت مشخص نیست، اسکلتون نشان بده
  if (authStatus === 'loading' || authStatus === 'idle') {
    return <GlobalAppSkeleton />;
  }

  return (
    /* نکته کلیدی: TimeSyncGuard حالا هوشمند است. 
       اگر لایسنس مشکل داشته باشد، این گارد غیرفعال می‌شود تا جلوی ریدایرکت به صفحه لایسنس را نگیرد.
    */
    <TimeSyncGuard>
      <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900 transition-colors duration-300">
        <GlobalWebSocketHandler />
        <GlobalRequestSocketHandler />
        <GlobalNotificationHandler />

        <ToastContainer position="bottom-right" autoClose={5000} theme="colored" rtl={true} />

        <Header onMenuClick={() => !isLicensePage && setSidebarOpen(true)} />

        <div className="flex flex-1 overflow-hidden relative">
          {!isLicensePage && <Sidebar />}

          {!isLicensePage && (
            <>
              <div
                className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                onClick={() => setSidebarOpen(false)}
              ></div>

              <div
                className={`fixed inset-y-0 right-0 z-40 flex w-64 transform flex-col transition-transform duration-300 md:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                  }`}
              >
                <SidebarContent />
              </div>
            </>
          )}

          <main className="flex-1 overflow-y-auto p-3 md:p-4">
            <Outlet />
            <OnboardingSystem />
          </main>
        </div>
      </div>
    </TimeSyncGuard>
  );
};

export default MainLayout;