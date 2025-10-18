// src/components/layout/MainLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
// ✅ کامنت: SidebarContent را از فایل خودش وارد می‌کنیم
import { Sidebar, SidebarContent } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-100 text-gray-800 dark:bg-gray-900">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* --- سایدبار دسکتاپ --- */}
        <Sidebar />

        {/* --- سایدبار موبایل (Overlay) --- */}
        <div
          className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* --- محفظه سایدبار موبایل --- */}
        <div
          // کامنت: کلاس bg-gray-800 حذف شد چون SidebarContent خودش مدیریت رنگ پس‌زمینه را بر عهده دارد
          className={`fixed inset-y-0 right-0 z-40 flex w-64 transform flex-col transition-transform md:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <SidebarContent />
        </div>

        {/* --- محتوای اصلی صفحه --- */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};