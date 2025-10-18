// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

// reducer های هر slice را وارد می‌کنیم
import themeReducer from "./slices/uiSlice";


export const store = configureStore({
  // تمام reducer ها را اینجا ثبت می‌کنیم
  reducer: {
    ui: themeReducer,
    
  },
});

// ✅ نکته حرفه‌ای: تعریف تایپ‌های سراسری برای state و dispatch
// این کار باعث می‌شود در کل برنامه از هوک‌های تایپ‌شده استفاده کنیم و از type-safety بهره‌مند شویم.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ ساخت هوک‌های سفارشی و تایپ‌شده به جای استفاده از useDispatch و useSelector خام
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
