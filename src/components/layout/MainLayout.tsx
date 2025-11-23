import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";

// ۱. نگهبان اتصال (عمومی - اتصال سوکت)
import { GlobalWebSocketHandler } from './GlobalWebSocketHandler';
// ۲. نگهبان درخواست‌ها (مدیریت بج و نوتیفیکیشن)
import { GlobalRequestSocketHandler } from './GlobalRequestSocketHandler';

// ۳. ایمپورت کامپوننت‌های Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ۴. ایمپورت هندلر مخصوص دانلود (طبق فایل‌های قبلی شما)
import { GlobalNotificationHandler } from '@/features/reports/components/Export/DownloadToast';


export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLicensePage = location.pathname === '/license';

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900">

      {/* --- کامپوننت‌های لاجیک (بدون UI) --- */}

      {/* اتصال اولیه سوکت */}
      <GlobalWebSocketHandler />

      {/* مدیریت بج و نوتیفیکیشن درخواست‌ها */}
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

            <div
              className={`fixed inset-y-0 right-0 z-40 flex w-64 transform flex-col transition-transform md:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <SidebarContent />
            </div>
          </>
        )}

        {/* محتوای اصلی */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};