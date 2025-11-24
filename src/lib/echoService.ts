import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosInstance from "./AxiosConfig"; 

declare global {
  interface Window {
    Pusher: typeof Pusher;
    EchoInstance: Echo<any> | null;
  }
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

// استایل‌های لاگ برای خوانایی بهتر در کنسول
const logStyles = {
  info: "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px;",
  success: "background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px;",
  error: "background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px;",
  warning: "background: #f59e0b; color: black; padding: 2px 6px; border-radius: 4px;",
};

const logSocket = (level: keyof typeof logStyles, message: string, data?: any) => {
  // فقط در محیط توسعه لاگ بزن، مگر اینکه خطا باشد
  if (import.meta.env.DEV || level === 'error') {
    console.log(`%c[Socket] ${message}`, logStyles[level], data || "");
  }
};

export const initEcho = (token: string): Echo<any> | null => {
  if (typeof window === "undefined") return null;

  if (!token) {
    logSocket("error", "تلاش برای اتصال بدون توکن!");
    return null;
  }

  if (window.EchoInstance) {
    return window.EchoInstance;
  }

  logSocket("info", "در حال ایجاد اتصال جدید...");

  // دریافت متغیرهای محیطی با مقادیر پیش‌فرض ایمن
  const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
  const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";
  const PUSHER_HOST = import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
  
  // تبدیل رشته 'true'/'false' به boolean واقعی
  const FORCE_TLS = import.meta.env.VITE_PUSHER_FORCE_TLS === 'true';
  
  // تعیین پورت بر اساس TLS
  // اگر TLS روشن باشد، معمولا پورت ۴۴۳ است، مگر اینکه در ENV چیز دیگری باشد
  const PUSHER_PORT = Number(import.meta.env.VITE_PUSHER_PORT) || (FORCE_TLS ? 443 : 80);

  // تنظیم آدرس Auth
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  // حذف اسلش‌های اضافی و کلمه api از انتهای آدرس
  const rootUrl = apiBase.replace(/\/api\/?$/, ""); 
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;

  const options: any = {
    broadcaster: "pusher",
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: PUSHER_HOST,
    
    // تنظیمات پورت برای حالت‌های مختلف (Reverb نیاز به تفکیک دقیق دارد)
    wsPort: PUSHER_PORT,
    wssPort: PUSHER_PORT,
    
    forceTLS: FORCE_TLS,
    disableStats: true,
    enabledTransports: ["ws", "wss"], // همیشه هر دو را ساپورت کند تا اگر یکی بسته بود سویچ کند
    
    // استفاده از authorizer سفارشی برای ارسال هدر Authorization
    authorizer: (channel: any, _options: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                axiosInstance.post(authEndpointUrl, {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    logSocket("error", `❌ Auth Error for ${channel.name}`, error.response?.status);
                    callback(true, error);
                });
            }
        };
    },
  };

  try {
    const echoInstance = new Echo(options);
    window.EchoInstance = echoInstance;

    // لیسنرهای وضعیت اتصال
    (echoInstance.connector as any).pusher.connection.bind("state_change", (states: any) => {
      // فقط تغییرات مهم را لاگ کن
      if (states.current === 'connected' || states.current === 'failed' || states.current === 'unavailable') {
         logSocket("info", `وضعیت اتصال: ${states.current}`);
      }
    });

    (echoInstance.connector as any).pusher.connection.bind("connected", () => {
      logSocket("success", "✅ متصل شد.", `Socket ID: ${echoInstance.socketId()}`);
    });
    
    (echoInstance.connector as any).pusher.connection.bind("error", (err: any) => {
        logSocket("error", "خطای اتصال سوکت:", err);
    });

    return echoInstance;
  } catch (error) {
    logSocket("error", "کرش در initEcho:", error);
    return null;
  }
};

export const getEcho = (): Echo<any> | null => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    return window.EchoInstance;
  }
  return null;
};

export const disconnectEcho = (): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    logSocket("warning", "قطع اتصال Echo.");
    window.EchoInstance.disconnect();
    window.EchoInstance = null;
  }
};