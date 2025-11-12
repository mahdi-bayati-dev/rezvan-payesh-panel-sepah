import Echo from "laravel-echo";
import Pusher from "pusher-js";

// به تایپ اسکریپت می‌فهمانیم که می‌خواهیم این موارد را به window اضافه کنیم
declare global {
  interface Window {
    Pusher: typeof Pusher;
    EchoInstance: Echo<any> | null;
  }
}

// این برای سمت کلاینت (مرورگر) لازم است
if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

// تابع کمکی برای لاگ کردن وضعیت‌های اتصال
const logSocket = (level: 'info' | 'error' | 'success', message: string, data: any = '') => {
  const styles = {
    info: 'background: #007bff; color: white; padding: 2px 8px; border-radius: 3px;',
    error: 'background: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;',
    success: 'background: #28a745; color: white; padding: 2px 8px; border-radius: 3px;',
  };
  console.log(`%c[Global Echo]%c ${message}`, styles[level], 'font-weight: bold;', data);
};

/**
 * (جدید) - این تابع اتصال گلوبال Echo را راه‌اندازی می‌کند
 * این تابع باید *فقط یک بار* در سطح App و پس از لاگین فراخوانی شود
 * @param token توکن JWT کاربر
 * @returns {Echo<any> | null}
 */
export const initEcho = (token: string): Echo<any> | null => {
  // اگر از قبل نمونه ساخته شده، همان را برگردان
  if (typeof window !== "undefined" && window.EchoInstance) {
    logSocket('info', 'نمونه Echo از قبل وجود داشت، از همان استفاده می‌شود.');
    return window.EchoInstance;
  }

  if (!token) {
    logSocket('error', 'توکن برای اتصال Echo ارائه نشده است.');
    return null;
  }

  logSocket('info', 'در حال ایجاد نمونه جدید Echo...');

  const options: any = {
    broadcaster: "pusher",
    key: "dLqP31MIZy3LQm10QtHe9ciAt", // از مستندات شما
    
    // --- نکته کلیدی ---
    // این پارامتر در مستندات شما نبود، اما کتابخانه pusher-js به آن نیاز دارد
    // "mt1" یک مقدار استاندارد برای سرورهای self-hosted است
    cluster: "mt1", 
    // ------------------

    disableStats: true,
    enabledTransports: ['ws'],

    wsHost: "ws.eitebar.ir",
    wsPort: 80,
    forceTLS: false,
    encrypted: false,

    authEndpoint: "http://payesh.eitebar.ir/broadcasting/auth", // آدرس از مستندات شما

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

    // اتصال شنونده‌های گلوبال برای دیباگ
    const pusher = echoInstance.connector.pusher;

    pusher.connection.bind('connecting', () => {
      logSocket('info', 'در حال اتصال به ws.eitebar.ir:80 ...');
    });

    pusher.connection.bind('connected', () => {
      const socketId = pusher.connection.socket_id;
      logSocket('success', `✅ اتصال گلوبال با موفقیت برقرار شد.`, `Socket ID: ${socketId}`);
    });

    pusher.connection.bind('error', (err: any) => {
      logSocket('error', '❌ خطای اتصال گلوبال Pusher:', err);
      // اینجا می‌توانید یک dispatch برای Redux (مثلاً قطع اتصال سوکت) بگذارید
    });

    pusher.connection.bind('disconnected', () => {
      logSocket('info', 'ارتباط گلوبال قطع شد.');
    });

    pusher.connection.bind('unavailable', () => {
      logSocket('error', 'سرور WebSocket در دسترس نیست.');
    });


    return echoInstance;

  } catch (error) {
    logSocket('error', 'خطا در ایجاد نمونه Echo:', error);
    return null;
  }
};

/**
 * (جدید) - این تابع نمونه Echo گلوبال را برمی‌گرداند
 * کامپوننت‌ها از این تابع برای عضویت در کانال‌ها استفاده می‌کنند
 * @returns {Echo<any> | null}
 */
export const getEcho = (): Echo<any> | null => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    return window.EchoInstance;
  }
  logSocket('error', 'تلاش برای دریافت Echo قبل از init شدن!');
  return null;
};


/**
 * اتصال Echo را قطع کرده و نمونه را پاک می‌کند
 * این تابع باید در زمان Logout فراخوانی شود
 */
export const disconnectEcho = (): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    window.EchoInstance.disconnect();
    window.EchoInstance = null;
    logSocket('info', "[EchoService] WebSocket گلوبال قطع شد.");
  }
};

/**
 * یک تابع کمکی برای خروج امن از یک کانال
 * (این تابع بدون تغییر باقی می‌ماند و عالی است)
 */
export const leaveChannel = (channelName: string): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    logSocket('info', `[EchoService] در حال خروج از کانال: ${channelName}`);
    window.EchoInstance.leave(channelName);
  }
};