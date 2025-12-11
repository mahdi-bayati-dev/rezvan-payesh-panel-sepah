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
  useEffect(() => {
    // لیست وضعیت‌هایی که باید کاربر را به صفحه لایسنس هدایت کنند (همه چیز جز trial و licensed)
    // اگر کاربر لایسنس معتبر (licensed) یا آزمایشی (trial) داشته باشد، مشکلی نیست.
    // اما اگر expired یا tampered باشد، باید ریدایرکت شود.
    const invalidStatuses = ['expired', 'tampered', 'trial_expired', 'license_expired'];

    if (licenseStatus && invalidStatuses.includes(licenseStatus)) {
        if (!isLicensePage) {
            console.warn(`⚠️ License Status is '${licenseStatus}'. Redirecting to /license...`);
            navigate('/license', { replace: true });
        }
    }
  }, [licenseStatus, isLicensePage, navigate]);

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