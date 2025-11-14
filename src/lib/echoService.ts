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

// [حذف] متغیر محلی echoService حذف شد تا از سردرگمی جلوگیری شود.
// ما فقط از window.EchoInstance به عنوان منبع واحد حقیقت (Single Source of Truth) استفاده می‌کنیم.
// let echoService: Echo<any> | null = null; // <-- حذف شد

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
  // ... (کد initEcho بدون تغییر) ...
  if (!token) {
    // ... (کد initEcho بدون تغییر) ...
    return null;
  }

  logSocket("info", "در حال ایجاد نمونه جدید Echo...");

  const options: any = {
    // ... (کد options بدون تغییر) ...
    broadcaster: "pusher",
    key: "dLqP31MIZy3LQm10QtHe9ciAt",
    cluster: "mt1",
    disableStats: true,
    enabledTransports: ["ws"],
    wsHost: "ws.eitebar.ir",
    wsPort: 80,
    forceTLS: false,
    encrypted: false,
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
      window.EchoInstance = echoInstance; // <-- فقط در window ذخیره می‌کنیم
    }

    // [حذف] خط زیر حذف شد
    // echoService = echoInstance;

    // اتصال شنونده‌های گلوبال برای دیباگ
    const pusher = echoInstance.connector.pusher;
    // ... (کد bindها بدون تغییر) ...
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
 * (جدید) - این تابع نمونه Echo گلوبال را برمی‌گرداند
 */
export const getEcho = (): Echo<any> | null => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    return window.EchoInstance;
  }
  // [اصلاح] لاگ خطا فقط زمانی که باید، نمایش داده می‌شود
  // و دیگر به متغیر محلی echoService وابسته نیستیم
  // logSocket('error', 'تلاش برای دریافت Echo قبل از init شدن!');
  return null;
};

/**
 * اتصال Echo را قطع کرده و نمونه را پاک می‌کند
 */
export const disconnectEcho = (): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    window.EchoInstance.disconnect();
    window.EchoInstance = null;
    logSocket("info", "[EchoService] WebSocket گلوبال قطع شد.");
  }
  // [حذف] خط زیر حذف شد
  // echoService = null;
};

/**
 * یک تابع کمکی برای خروج امن از یک کانال
 */
export const leaveChannel = (channelName: string): void => {
  // ... (کد leaveChannel بدون تغییر) ...
  if (typeof window !== "undefined" && window.EchoInstance) {
    // ... (کد leaveChannel بدون تغییر) ...
    window.EchoInstance.leave(channelName);
  }
};
