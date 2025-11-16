// [انتقال] این فایل از 'features/reports/services/' به 'src/lib/' منتقل شد
// ... (کامنت‌های قبلی) ...
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    EchoInstance: Echo<any> | null;
  }
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

// (تابع logSocket بدون تغییر)
const logSocket = (
  level: "info" | "error" | "success",
  message: string,
  data: any = ""
) => {
  // ... (کد لاگ بدون تغییر) ...
  const styles = {
    info: "background: #007bff; color: white; padding: 2px 8px; border-radius: 3px;",
    error:
      "background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;",
    success:
      "background: #28a745; color: white; padding: 2px 8px; border-radius: 3px;",
  };
  console.log(
    `%c[Global Echo]%c ${message}`,
    styles[level],
    "font-weight: bold;",
    data
  );
};

export const initEcho = (token: string): Echo<any> | null => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    logSocket("info", "نمونه Echo از قبل وجود داشت، از همان استفاده می‌شود.");
    return window.EchoInstance;
  }
  // (کد بررسی توکن بدون تغییر)
  if (!token) {
    logSocket("error", "توکن برای اتصال WebSocket ارائه نشده است.");
    return null;
  }

  logSocket("info", "در حال ایجاد نمونه جدید Echo...");

  const options: any = {
    broadcaster: "pusher",
    key: "dLqP31MIZy3LQm10QtHe9ciAt", // (این کلیدها از فایل شما آمده است)
    cluster: "mt1",
    disableStats: true,
    enabledTransports: ["ws"],
    wsHost: "ws.eitebar.ir",
    wsPort: 80,
    forceTLS: false,
    encrypted: false,

    // --- [اصلاح کلیدی] ---
    // این گزینه به Echo می‌گوید که پیشوند App.User را به کانال‌های خصوصی اضافه کند
    // تا با 'App.User.{id}' در routes/channels.php مطابقت داشته باشد
    // namespace: "App",
    // --- [پایان اصلاح] ---

    authEndpoint: "http://payesh.eitebar.ir/broadcasting/auth",
    auth: {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
    },
  };

  try {
    const echoInstance = new Echo(options) as Echo<any>;
    if (typeof window !== "undefined") {
      window.EchoInstance = echoInstance;
    }

    // (اتصال شنونده‌های گلوبال برای دیباگ بدون تغییر)
    const pusher = echoInstance.connector.pusher;
    pusher.connection.bind("connecting", () => {
      logSocket("info", "در حال اتصال به ws.eitebar.ir:80 ...");
    });

    pusher.connection.bind("connected", () => {
      const socketId = pusher.connection.socket_id;
      logSocket(
        "success",
        `✅ اتصال گلوبال با موفقیت برقرار شد.`,
        `Socket ID: ${socketId}`
      );
    });

    pusher.connection.bind("error", (err: any) => {
      logSocket("error", "❌ خطای اتصال گلوبال Pusher:", err);
    });

    pusher.connection.bind("disconnected", () => {
      logSocket("info", "ارتباط گلوبال قطع شد.");
    });

    pusher.connection.bind("unavailable", () => {
      logSocket("error", "سرور WebSocket در دسترس نیست.");
    });

    return echoInstance;
  } catch (error) {
    logSocket("error", "خطا در ایجاد نمونه Echo:", error);
    return null;
  }
};

/**
 * (تابع getEcho بدون تغییر)
 */
export const getEcho = (): Echo<any> | null => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    return window.EchoInstance;
  }
  return null;
};

/**
 * (تابع disconnectEcho بدون تغییر)
 */
export const disconnectEcho = (): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    window.EchoInstance.disconnect();
    window.EchoInstance = null;
    logSocket("info", "[EchoService] WebSocket گلوبال قطع شد.");
  }
};

/**
 * (تابع leaveChannel بدون تغییر)
 */
export const leaveChannel = (channelName: string): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    window.EchoInstance.leave(channelName);
  }
};