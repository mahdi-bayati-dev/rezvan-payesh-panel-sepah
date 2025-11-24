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
  if (import.meta.env.DEV || level === "error") {
    console.log(`%c[Socket] ${message}`, logStyles[level], data || "");
  }
};

/**
 * مقداردهی اولیه Echo.
 * تغییر مهم: آرگومان `token` حذف شد.
 * احراز هویت کانال‌های خصوصی از طریق کوکی HttpOnly و توسط axiosInstance انجام می‌شود.
 */
export const initEcho = (): Echo<any> | null => {
  if (typeof window === "undefined") return null;

  if (window.EchoInstance) {
    return window.EchoInstance;
  }

  logSocket("info", "در حال ایجاد اتصال جدید (با احراز هویت کوکی)...");

  const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
  const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";
  const PUSHER_HOST =
    import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
  const FORCE_TLS = import.meta.env.VITE_PUSHER_FORCE_TLS === "true";
  const PUSHER_PORT =
    Number(import.meta.env.VITE_PUSHER_PORT) || (FORCE_TLS ? 443 : 80);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  const rootUrl = apiBase.replace(/\/api\/?$/, "");
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;

  const options: any = {
    broadcaster: "pusher",
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: PUSHER_HOST,
    wsPort: PUSHER_PORT,
    wssPort: PUSHER_PORT,
    forceTLS: FORCE_TLS,
    disableStats: true,
    enabledTransports: ["ws", "wss"],

    // تنظیمات Authorizer برای استفاده از کوکی
    authorizer: (channel: any, _options: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          // چون axiosInstance دارای withCredentials: true است،
          // کوکی‌های نشست به طور خودکار به broadcasting/auth ارسال می‌شوند.
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
              // اگر 401 یا 419 (CSRF) داد یعنی نشست معتبر نیست
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
        if (
          states.current === "connected" ||
          states.current === "failed" ||
          states.current === "unavailable"
        ) {
          logSocket("info", `وضعیت اتصال: ${states.current}`);
        }
      }
    );

    (echoInstance.connector as any).pusher.connection.bind("connected", () => {
      logSocket(
        "success",
        "✅ متصل شد.",
        `Socket ID: ${echoInstance.socketId()}`
      );
    });

    (echoInstance.connector as any).pusher.connection.bind(
      "error",
      (err: any) => {
        logSocket("error", "خطای اتصال سوکت:", err);
      }
    );

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