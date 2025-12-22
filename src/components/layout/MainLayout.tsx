import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectLicenseStatus } from "@/store/slices/licenseSlice";
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
export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLicensePage = location.pathname === '/license';

  const licenseStatus = useAppSelector(selectLicenseStatus);
  const isAuthLocked = useAppSelector(selectIsLicenseLocked);
  const authStatus = useAppSelector(selectAuthCheckStatus);

  useImageNotificationSocket();
  useAdminImageSocket();

  useEffect(() => {
    const invalidLicenseStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];
    const isLicenseInvalid = licenseStatus && invalidLicenseStatuses.includes(licenseStatus);
    const shouldRedirect = isAuthLocked || isLicenseInvalid;

    if (shouldRedirect && !isLicensePage) {
      navigate('/license', { replace: true });
    }
  }, [isAuthLocked, licenseStatus, isLicensePage, navigate]);

  // نمایش اسکلتون سراسری در زمان احراز هویت
  if (authStatus === 'loading' || authStatus === 'idle') {
    return <GlobalAppSkeleton />;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900 transition-colors duration-300">
      <GlobalWebSocketHandler />
      <GlobalRequestSocketHandler />
      <GlobalNotificationHandler />

      <ToastContainer position="bottom-right" autoClose={5000} theme="colored" rtl={true} />

      <Header onMenuClick={() => !isLicensePage && setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* سایدبار دسکتاپ */}
        {!isLicensePage && <Sidebar />}

        {/* سایدبار موبایل */}
        {!isLicensePage && (
          <>
            <div
              className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* عرض سایدبار موبایل را هم w-64 قرار دادیم برای یکپارچگی */}
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
          <OnboardingSystem /> {/* سیستم آموزشی هوشمند در اینجا قرار می‌گیرد */}
        </main>
      </div>
    </div>
  );
};