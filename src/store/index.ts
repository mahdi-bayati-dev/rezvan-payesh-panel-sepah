// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

// reducer های هر slice را وارد می‌کنیم
import themeReducer from "./slices/uiSlice";
import authReducer from "@/store/slices/authSlice";
import licenseReducer from "@/store/slices/licenseSlice"; // [افزوده شد]

export const store = configureStore({
  reducer: {
    ui: themeReducer,
    auth: authReducer,
    license: licenseReducer, // [افزوده شد]
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// هوک‌های سفارشی و تایپ‌شده
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
