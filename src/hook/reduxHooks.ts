import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
// [اصلاح کلیدی ۱]: ایمپورت کردن RootState و AppDispatch از مسیر اصلی
import type { RootState, AppDispatch } from "@/store/index";

// [اصلاح کلیدی ۲]: اکسپورت کردن RootState و AppDispatch
export type { RootState, AppDispatch };

export const useAppDispatch = () => useDispatch<AppDispatch>();
// [اصلاح کلیدی ۳]: اطمینان از اکسپورت صحیح useAppSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
