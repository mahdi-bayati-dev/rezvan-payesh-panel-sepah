import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosInstance from "@/lib/AxiosConfig";
import { AppConfig } from "@/config"; // ✅ ایمپورت کانفیگ مرکزی

declare global {
  interface Window {
    Pusher: typeof Pusher;
    EchoInstance: Echo<any> | null;
  }
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

// لیست شنوندگانی که منتظر اتصال سوکت هستند
type EchoCallback = (echo: Echo<any>) => void;
let listeners: EchoCallback[] = [];

/**
 * افزودن یک شنونده برای زمانی که سوکت آماده شد.
 * اگر سوکت از قبل آماده باشد، بلافاصله کال‌بک اجرا می‌شود.
 */
export const onEchoReady = (callback: EchoCallback) => {
  if (window.EchoInstance) {
    callback(window.EchoInstance);
  } else {
    listeners.push(callback);
  }
};

/**
 * اطلاع‌رسانی به تمام شنوندگان
 */
const notifyListeners = (echo: Echo<any>) => {
  listeners.forEach((callback) => callback(echo));
  listeners = [];
};

const logStyles = {
  info: "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px;",
  success:
    "background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px;",
  error:
    "background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px;",
  warning:
    "background: #f59e0b; color: black; padding: 2px 6px; border-radius: 4px;",
};

type LogLevel = keyof typeof logStyles;

const logSocket = (level: LogLevel, message: string, data?: any) => {
  if (import.meta.env.DEV || level === "error") {
    console.log(`%c[Socket] ${message}`, logStyles[level], data || "");
  }
};

export const initEcho = (token?: string | null): Echo<any> | null => {
  if (typeof window === "undefined") return null;

  // ✅ دریافت حالت احراز هویت از کانفیگ مرکزی
  const authMode = AppConfig.AUTH_MODE;

  if (authMode === "token" && !token) {
    logSocket("error", "تلاش برای اتصال سوکت بدون توکن (در مود token)!");
    return null;
  }

  // اگر قبلا متصل شده، همان را برگردان
  if (window.EchoInstance) {
    const connector = window.EchoInstance.connector as any;
    if (
      connector.pusher &&
      connector.pusher.connection.state === "disconnected"
    ) {
      connector.pusher.connect();
    }
    notifyListeners(window.EchoInstance);
    return window.EchoInstance;
  }

  logSocket("info", `🚀 در حال اتصال به سوکت (حالت: ${authMode})...`);

  // ✅ خواندن تنظیمات از AppConfig (داکر فرندلی)
  const PUSHER_KEY = AppConfig.PUSHER.APP_KEY;
  const PUSHER_CLUSTER = AppConfig.PUSHER.CLUSTER || "mt1";
  const PUSHER_HOST = AppConfig.PUSHER.HOST || window.location.hostname;

  // ✅ تشخیص TLS بر اساس اسکیم (http/https) تعریف شده در کانفیگ
  const useTls = AppConfig.PUSHER.SCHEME === "https";

  const defaultPort = useTls ? 443 : 80;
  const PUSHER_PORT = AppConfig.PUSHER.PORT || defaultPort;

  // ✅ ساخت آدرس Auth با استفاده از API_URL کانفیگ
  const apiBaseEnv = AppConfig.API_URL;
  // حذف /api از انتهای آدرس برای رسیدن به روت، سپس اضافه کردن مسیر broadcasting
  const rootUrl = apiBaseEnv.replace(/\/api\/?$/, "");
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;

  const options = {
    broadcaster: "reverb", // یا "pusher"
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: PUSHER_HOST,
    wsPort: PUSHER_PORT,
    wssPort: PUSHER_PORT,
    forceTLS: useTls,
    encrypted: useTls,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    // 🗑️ پارامتر _options حذف شد چون استفاده نمی‌شد
    authorizer: (channel: any) => {
      return {
        // 🔧 تایپ Function با یک تایپ دقیق (Error-first callback) جایگزین شد
        authorize: (
          socketId: string,
          callback: (error: any, data?: any) => void
        ) => {
          const headers: Record<string, string> = {};
          if (authMode === "token" && token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          axiosInstance
            .post(
              authEndpointUrl,
              {
                socket_id: socketId,
                channel_name: channel.name,
              },
              {
                headers: headers,
              }
            )
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              logSocket(
                "error",
                `❌ Auth Error: ${channel.name}`,
                error.response?.status
              );
              callback(true, error);
            });
        },
      };
    },
  };

  try {
    // @ts-expect-error Echo options type mismatch with custom authorizer
    const echoInstance = new Echo(options);
    window.EchoInstance = echoInstance;

    const pusher = (echoInstance.connector as any).pusher;

    if (pusher) {
      pusher.connection.bind("state_change", (states: any) => {
        if (["connected", "failed", "unavailable"].includes(states.current)) {
          logSocket("info", `وضعیت اتصال: ${states.current}`);
        }
      });

      pusher.connection.bind("connected", () => {
        logSocket(
          "success",
          "✅ سوکت کاملاً متصل شد.",
          `ID: ${echoInstance.socketId()}`
        );
        notifyListeners(echoInstance);
      });
    }

    notifyListeners(echoInstance);
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
    listeners = [];
  }
};
