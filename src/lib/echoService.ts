import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosInstance, { AUTH_MODE } from "@/lib/AxiosConfig";

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
  listeners = []; // بعد از اطلاع‌رسانی لیست را خالی می‌کنیم (یا نگه می‌داریم بسته به نیاز)
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

  if (AUTH_MODE === "token" && !token) {
    logSocket("error", "تلاش برای اتصال سوکت بدون توکن (در مود token)!");
    return null;
  }

  // اگر قبلا متصل شده، همان را برگردان و کانکتور را چک کن
  if (window.EchoInstance) {
    const connector = window.EchoInstance.connector as any;
    if (
      connector.pusher &&
      connector.pusher.connection.state === "disconnected"
    ) {
      connector.pusher.connect();
    }
    // حتی اگر موجود است، شاید لیسنرهای جدید اضافه شده باشند
    notifyListeners(window.EchoInstance);
    return window.EchoInstance;
  }

  logSocket("info", `🚀 در حال اتصال به سوکت (حالت: ${AUTH_MODE})...`);

  const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
  const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";
  const PUSHER_HOST =
    import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
  const FORCE_TLS = import.meta.env.VITE_PUSHER_FORCE_TLS === "true";
  const defaultPort = FORCE_TLS ? 443 : 80;
  const PUSHER_PORT = Number(import.meta.env.VITE_PUSHER_PORT) || defaultPort;

  const apiBaseEnv =
    import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  const rootUrl = apiBaseEnv.replace(/\/api\/?$/, "");
  const authEndpointUrl = `${rootUrl}/broadcasting/auth`;

  const options = {
    broadcaster: "pusher" as const,
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: PUSHER_HOST,
    wsPort: PUSHER_PORT,
    wssPort: PUSHER_PORT,
    forceTLS: FORCE_TLS,
    disableStats: true,
    enabledTransports: ["ws", "wss"] as any,
    authorizer: (channel: any, _options: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          const headers: Record<string, string> = {};
          if (AUTH_MODE === "token" && token) {
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
        // 🔥 مهم: اینجا به تمام هوک‌ها خبر می‌دهیم که سوکت آماده است
        notifyListeners(echoInstance);
      });
    }

    // برای اطمینان اولیه هم نوتیفای می‌کنیم (شاید pusher هنوز وصل نشده باشد اما آبجکت ساخته شده)
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
    listeners = []; // پاکسازی لیسنرها
  }
};