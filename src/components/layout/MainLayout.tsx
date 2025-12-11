import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectLicenseStatus } from "@/store/slices/licenseSlice";
import { selectIsLicenseLocked } from "@/store/slices/authSlice"; // ✅ استفاده از فلگ جدید

import { GlobalWebSocketHandler } from './GlobalWebSocketHandler';
import { GlobalRequestSocketHandler } from './GlobalRequestSocketHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalNotificationHandler } from '@/features/reports/components/Export/DownloadToast';
import { useImageNotificationSocket } from '@/features/ConfirmPhotos/hooks/useImageNotificationSocket';
import { useAdminImageSocket } from '@/features/ConfirmPhotos/hooks/useAdminImageSocket';

export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLicensePage = location.pathname === '/license';

  const licenseStatus = useAppSelector(selectLicenseStatus);
  // ✅ دریافت وضعیت قفل لایسنس از AuthSlice
  const isAuthLocked = useAppSelector(selectIsLicenseLocked);

  useImageNotificationSocket();
  useAdminImageSocket();

  // ✅ افکت "نگهبان لایسنس" (License Guard) - استاندارد و متمرکز
  useEffect(() => {
    // شرط ۱: اگر AuthSlice می‌گوید سیستم قفل است (چون /me ارور ۴۹۹ داد)
    // شرط ۲: یا اگر LicenseSlice می‌گوید وضعیت invalid است
    const invalidLicenseStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];
    const isLicenseInvalid = licenseStatus && invalidLicenseStatuses.includes(licenseStatus);

    const shouldRedirect = isAuthLocked || isLicenseInvalid;

    if (shouldRedirect) {
      if (!isLicensePage) {
        console.warn("🔒 System Locked/Expired. Redirecting to License Page.");
        navigate('/license', { replace: true });
      }
    }
  }, [isAuthLocked, licenseStatus, isLicensePage, navigate]);

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900">
      <GlobalWebSocketHandler />
      <GlobalRequestSocketHandler />
      <GlobalNotificationHandler />

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Header onMenuClick={() => !isLicensePage && setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* اگر در صفحه لایسنس هستیم، سایدبار را مخفی کن تا تمرکز کاربر فقط روی فعال‌سازی باشد */}
        {!isLicensePage && <Sidebar />}

        {!isLicensePage && (
          <>
            <div
              className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div
              className={`fixed inset-y-0 right-0 z-40 flex w-64 transform flex-col transition-transform md:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <SidebarContent />
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto p-2 md:p-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};