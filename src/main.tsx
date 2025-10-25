// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import { router } from "@/routes/index";
import { store } from "@/store/index";
import { ThemeProvider } from "./providers/ThemeProvider"; // مطمئن شوید این import صحیح است

import "./styles/index.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ToastContainer
          position="bottom-right" // موقعیت نمایش (مثال: پایین چپ)
          autoClose={5000}       // زمان بسته شدن خودکار (۵ ثانیه)
          hideProgressBar={false} // نمایش نوار پیشرفت زمان
          newestOnTop={false}    // نوتیفیکیشن‌های جدید پایین‌تر نمایش داده شوند
          closeOnClick           // با کلیک روی نوتیفیکیشن بسته شود
          rtl={true}             //  مهم: فعال کردن حالت راست به چپ برای فارسی
          pauseOnFocusLoss       // وقتی پنجره فوکوس را از دست می‌دهد، تایمر متوقف شود
          draggable              // قابلیت بستن با کشیدن (Drag)
          pauseOnHover           // وقتی موس روی نوتیفیکیشن است، تایمر متوقف شود
          theme="colored"        // تم ظاهری ('light', 'dark', 'colored')
        />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
