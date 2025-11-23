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

const logStyles = {
  info: "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px;",
  success:
    "background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px;",
  error:
    "background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px;",
  warning:
    "background: #f59e0b; color: black; padding: 2px 6px; border-radius: 4px;",
};

const logSocket = (
  level: keyof typeof logStyles,
  message: string,
  data?: any
) => {
  if (import.meta.env.DEV) {
    console.log(`%c[Socket] ${message}`, logStyles[level], data || "");
  }
};

// ✅ تغییر: توکن را به عنوان ورودی نمی‌گیریم
export const initEcho = (): Echo<any> | null => {
  // <--- آرگومان حذف شده است
  if (typeof window === "undefined") return null;

  // ✅ در اینجا منطق چک کردن توکن را حذف می‌کنیم.
  if (window.EchoInstance) {
    return window.EchoInstance;
  }

  logSocket("info", "در حال ایجاد اتصال جدید...");

  // آدرس API شما: http://payesh.eitebar.ir/api
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  const rootUrl = apiBase.replace(/\/api\/?$/, ""); // حذف /api از آخر
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;
  
  // ✅ خواندن تنظیمات TLS و پورت از متغیرهای محیطی
  const forceTlsEnv = import.meta.env.VITE_PUSHER_FORCE_TLS === 'true';
  const wsPortEnv = Number(import.meta.env.VITE_PUSHER_PORT) || 80;


  const options: any = {
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY || "dLqP31MIZy3LQm10QtHe9ciAt",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
    
    wsHost: import.meta.env.VITE_PUSHER_HOST || "ws.eitebar.ir",
    
    // ✅ داینامیک کردن پورت‌ها
    wsPort: wsPortEnv,
    wssPort: forceTlsEnv ? 443 : wsPortEnv, // اگر TLS اجباری بود، پورت 443 باشد، در غیر این صورت از پورت محیطی استفاده کند

    // ✅ داینامیک کردن اجبار TLS
    forceTLS: forceTlsEnv, 
    
    encrypted: forceTlsEnv, // encrypted باید با forceTLS همگام باشد
    disableStats: true,
    enabledTransports: ["ws", "wss"],

    // ✅ استفاده از authorizer برای ارسال کوکی HttpOnly در فرآیند احراز هویت سوکت
    authorizer: (channel: any, _options: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          // axiosInstance به دلیل withCredentials: true کوکی‌های HttpOnly را ارسال می‌کند
          axiosInstance
            .post(authEndpointUrl, {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              logSocket(
                "error",
                `❌ Auth Error for ${channel.name}`,
                error.response?.status
              );
              callback(true, error);
            });
        },
      };
    },
  };

  try {
    const echoInstance = new Echo(options);
    window.EchoInstance = echoInstance;

    (echoInstance.connector as any).pusher.connection.bind(
      "state_change",
      (states: any) => {
        logSocket("info", `وضعیت اتصال: ${states.current}`);
      }
    );

    (echoInstance.connector as any).pusher.connection.bind("connected", () => {
      logSocket(
        "success",
        "✅ متصل شد.",
        `Socket ID: ${echoInstance.socketId()}`
      );
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