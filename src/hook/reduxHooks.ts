import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
// ۱. تایپ‌های RootState و AppDispatch را از فایل store خود ایمپورت کنید
//    (مسیر را بر اساس ساختار پروژه خودتان تنظیم کنید)
import type { RootState, AppDispatch } from "@/store/index";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
