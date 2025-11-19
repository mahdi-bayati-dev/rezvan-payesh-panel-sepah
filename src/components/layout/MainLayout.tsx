import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom"; // اضافه کردن useLocation
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";
// ۱. کامپوننت نگهبان (اتصال عمومی)
import { GlobalWebSocketHandler } from './GlobalWebSocketHandler';

// [جدید] ۲. ایمپورت کامپوننت‌های Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// [جدید] ۳. ایمپورت هندلر مخصوص دانلود
import { GlobalNotificationHandler } from '@/features/reports/components/Export/DownloadToast';


export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // دریافت مسیر فعلی برای تشخیص صفحه لایسنس
  const location = useLocation();

  // بررسی اینکه آیا در صفحه لایسنس هستیم یا خیر
  // نکته: اگر در صفحه لایسنس باشیم، سایدبار و منو باید مخفی شوند تا کاربر نتواند خارج شود
  const isLicensePage = location.pathname === '/license';

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900">

      {/* [جدید] ۴. نگهدارنده نوتیفیکیشن‌ها */}
      {/* این کامپوننت باید در بالاترین سطح باشد تا Toastها به درستی نمایش داده شوند */}
      <ToastContainer
        position="bottom-right" // (یا هر موقعیتی که ترجیح می‌دهید)
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

      {/* ۵. نگهبان اتصال (عمومی) */}
      <GlobalWebSocketHandler />

      {/* [جدید] ۶. نگهبان اتصال (مخصوص دانلود اکسل) */}
      {/* این کامپوننت هیچ خروجی بصری ندارد و فقط به ایونت دانلود گوش می‌دهد */}
      <GlobalNotificationHandler />

      {/* اگر در صفحه لایسنس هستیم، کلیک روی دکمه منو نباید سایدبار را باز کند.
          هدر همچنان نمایش داده می‌شود تا کاربر بتواند تم را عوض کند یا لاگ‌اوت کند.
      */}
      <Header onMenuClick={() => !isLicensePage && setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">

        {/* --- سایدبار دسکتاپ --- */}
        {/* اگر در صفحه لایسنس هستیم، سایدبار را کاملاً از DOM حذف می‌کنیم */}
        {!isLicensePage && <Sidebar />}

        {/* --- سایدبار موبایل (Overlay & Content) --- */}
        {/* فقط اگر در صفحه لایسنس نباشیم رندر می‌شوند */}
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

        {/* --- محتوای اصلی صفحه --- */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};