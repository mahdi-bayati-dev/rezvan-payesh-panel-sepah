import { configureStore } from "@reduxjs/toolkit";
import onboardingReducer from "./slices/onboardingSlice"; // اضافه شد
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

// reducer های هر slice را وارد می‌کنیم
import themeReducer from "./slices/uiSlice";
import authReducer from "@/store/slices/authSlice";
import licenseReducer from "@/store/slices/licenseSlice";

// ✅ ایمپورت تابع تزریق استور از کانفیگ Axios
import { injectStore } from "@/lib/AxiosConfig";

export const store = configureStore({
  reducer: {
    ui: themeReducer,
    auth: authReducer,
    license: licenseReducer,
    onboarding: onboardingReducer, // اضافه شد
  },
});

// ✅ بلافاصله بعد از ساخت استور، آن را به Axios تزریق می‌کنیم
// این کار باعث می‌شود مشکل وابستگی حلقوی حل شود چون AxiosConfig دیگر
// نیازی ندارد که در ابتدای فایل، استور را ایمپورت کند.
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
