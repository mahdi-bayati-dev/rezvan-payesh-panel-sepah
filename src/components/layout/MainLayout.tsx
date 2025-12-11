import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectLicenseStatus } from "@/store/slices/licenseSlice";

// ۱. نگهبان اتصال (عمومی - اتصال سوکت)
import { GlobalWebSocketHandler } from './GlobalWebSocketHandler';
// ۲. نگهبان درخواست‌ها (مدیریت بج و نوتیفیکیشن - مربوط به مرخصی و ...)
import { GlobalRequestSocketHandler } from './GlobalRequestSocketHandler';

// ۳. ایمپورت کامپوننت‌های Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ۴. ایمپورت هندلر مخصوص دانلود
import { GlobalNotificationHandler } from '@/features/reports/components/Export/DownloadToast';

// ۵. هوک‌های سوکت تصاویر
import { useImageNotificationSocket } from '@/features/ConfirmPhotos/hooks/useImageNotificationSocket';
import { useAdminImageSocket } from '@/features/ConfirmPhotos/hooks/useAdminImageSocket';



export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLicensePage = location.pathname === '/license';
  
  // ✅ دریافت وضعیت لایسنس برای بررسی ریدایرکت سراسری
  const licenseStatus = useAppSelector(selectLicenseStatus);

  // --- Socket Hooks ---
  // این هوک برای "کارمند" است (نتیجه تایید/رد عکس خودش)
  useImageNotificationSocket();

  // ✅ اضافه شده: این هوک برای "ادمین" است (دریافت درخواست جدید)
  useAdminImageSocket();

  // ✅ افکت جدید: بررسی وضعیت لایسنس و هدایت خودکار بدون لاگ‌اوت
  // + 🛠️ اضافه شدن لاگ‌های دقیق دیباگ
  useEffect(() => {
    // اگر هنوز وضعیتی نداریم (اولیه)، هیچ کاری نکن
    if (licenseStatus === undefined) return;

    // شروع لاگ‌گیری گروهی برای تمیزی کنسول
    console.groupCollapsed(`🛡️ [License Guard] Check Triggered`);
    console.log("📍 Current Path:", location.pathname);
    console.log("📊 License Status:", licenseStatus);

    // لیست وضعیت‌هایی که باید کاربر را به صفحه لایسنس هدایت کنند
    const invalidStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];
    const shouldRedirect = invalidStatuses.includes(licenseStatus);

    console.log("⚠️ Should Redirect?", shouldRedirect);
    console.log("📄 Is License Page?", isLicensePage);

    if (shouldRedirect) {
        if (!isLicensePage) {
            console.warn(`🚫 Action: REDIRECTING user to /license (Reason: ${licenseStatus})`);
            navigate('/license', { replace: true });
        } else {
            console.log("✅ Action: User is already on license page. No redirect needed.");
        }
    } else {
        console.log("✅ Action: Status is valid (trial/licensed). Access allowed.");
    }
    
    console.groupEnd(); // پایان گروه لاگ

  }, [licenseStatus, isLicensePage, navigate, location.pathname]);

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900">

      {/* --- کامپوننت‌های لاجیک (بدون UI) --- */}

      {/* اتصال اولیه سوکت */}
      <GlobalWebSocketHandler />

      {/* مدیریت بج و نوتیفیکیشن درخواست‌های عمومی (مثل مرخصی) */}
      <GlobalRequestSocketHandler />

      {/* مدیریت دانلود فایل اکسل */}
      <GlobalNotificationHandler />


      {/* --- کامپوننت‌های UI --- */}

      {/* نگهدارنده نوتیفیکیشن‌ها */}
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
        {/* سایدبار دسکتاپ - در صفحه لایسنس مخفی می‌شود */}
        {!isLicensePage && <Sidebar />}

        {/* سایدبار موبایل */}
        {!isLicensePage && (
          <>
            <div
              className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              onClick={() => setSidebarOpen(false)}
            ></div>

            <div
              className={`fixed inset-y-0 right-0 z-40 flex w-64 transform flex-col transition-transform md:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <SidebarContent />
            </div>
          </>
        )}

        {/* محتوای اصلی */}
        <main className="flex-1 overflow-y-auto p-2 md:p-2 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};