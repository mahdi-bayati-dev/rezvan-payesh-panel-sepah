import Echo from "laravel-echo";
import Pusher from "pusher-js";

// به تایپ اسکریپت می‌فهمانیم که می‌خواهیم این موارد را به window اضافه کنیم
declare global {
  interface Window {
    Pusher: typeof Pusher;
    // EchoInstance: Echo | null;
    EchoInstance: Echo<any> | null;
  }
}

// این برای سمت کلاینت (مرورگر) لازم است
if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

/**
 * یک نمونه Echo ایجاد می‌کند یا نمونه موجود را برمی‌گرداند (Singleton)
 * @param token توکن JWT کاربر
 * @returns {Echo<any>}
 */
// ✅ اصلاح کلیدی (TS2314):
// Echo یک تایپ Generic است (Echo<T>)، بنابراین باید به آن بگوییم چه تایپی دارد.
// در اینجا، چون ما تایپ مشخصی برای T نداریم، از <any> استفاده می‌کنیم.
export const getEchoInstance = (token: string): Echo<any> => {
  // اگر نمونه از قبل وجود دارد، همان را برگردان
  if (typeof window !== "undefined" && window.EchoInstance) {
    return window.EchoInstance;
  }

  // [اصلاح شد] استفاده از 'any' برای جلوگیری از خطای Vite
  const options: any = {
    broadcaster: "pusher",
    key: "dLqP31MIZy3LQm10QtHe9ciAt",

    // ✅ افزودن گزینه‌های مستندات
    disableStats: true,
    enabledTransports: ['ws'],
    cluster: "mt1",

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

  // ایجاد و ذخیره نمونه در window
  // ✅ برای اطمینان، اینجا هم تایپ را as Echo<any> می‌گذاریم
  const echoInstance = new Echo(options) as Echo<any>;
  if (typeof window !== "undefined") {
    window.EchoInstance = echoInstance;
  }
  return echoInstance;
};

/**
 * اتصال Echo را قطع کرده و نمونه را پاک می‌کند
 */
export const disconnectEcho = (): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    window.EchoInstance.disconnect();
    window.EchoInstance = null;
    console.log("[EchoService] WebSocket disconnected.");
  }
};

/**
 * یک تابع کمکی برای خروج امن از یک کانال
 */
export const leaveChannel = (channelName: string): void => {
  if (typeof window !== "undefined" && window.EchoInstance) {
    console.log(`[EchoService] Leaving channel: ${channelName}`);
    window.EchoInstance.leave(channelName);
  }
};
