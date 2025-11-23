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
  if (typeof window === "undefined") return null;

  // ✅ در اینجا منطق چک کردن توکن را حذف می‌کنیم.
  // اگر کاربر لاگین نباشد، درخواست Auth Pusher با 401 مواجه می‌شود.

  if (window.EchoInstance) {
    return window.EchoInstance;
  }

  logSocket("info", "در حال ایجاد اتصال جدید...");

  // آدرس API شما: http://payesh.eitebar.ir/api
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  const rootUrl = apiBase.replace(/\/api\/?$/, ""); // حذف /api از آخر
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;

  const options: any = {
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY || "dLqP31MIZy3LQm10QtHe9ciAt",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
    wsHost: import.meta.env.VITE_PUSHER_HOST || "ws.eitebar.ir",
    wsPort: Number(import.meta.env.VITE_PUSHER_PORT) || 80,
    wssPort: Number(import.meta.env.VITE_PUSHER_PORT) || 443,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],

    // ✅ مهم: نیاز به تنظیم authorizer نیست، اگر Pusher به طور خودکار کوکی‌ها را بفرستد.
    // اما برای اطمینان از سازگاری و فرستادن کوکی‌ها به Auth Endpoint لاراول،
    // از authorizer و axiosInstance که با withCredentials تنظیم شده، استفاده می‌کنیم.
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
