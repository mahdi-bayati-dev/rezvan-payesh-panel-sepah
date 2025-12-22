// vite-env.d
/// <reference types="vite/client" />

interface Window {
  globalConfig: {
    // Core
    VITE_API_BASE_URL?: string;
    VITE_STORAGE_BASE_URL?: string;
    
    // AI Services
    VITE_API_BASE_AI_URL?: string;
    VITE_AI_SERVICE_SECRET?: string;

    // Pusher / Soketi
    VITE_PUSHER_APP_KEY?: string;
    VITE_PUSHER_APP_CLUSTER?: string;
    VITE_PUSHER_HOST?: string;
    VITE_PUSHER_PORT?: string;
    VITE_PUSHER_SCHEME?: string;
    
    // Auth
    VITE_AUTH_MODE?: string;
  };
}
declare const __APP_VERSION__: string;
