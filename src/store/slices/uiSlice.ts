// src/store/slices/uiSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// تعریف تایپ برای state
interface UiState {
  theme: "light" | "dark";
}
const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "light"; // یک مقدار پیش‌فرض برمی‌گردونیم
  }
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }
  // اگر هیچ تمی ذخیره نشده بود،
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light"; // مقدار پیش‌فرض نهایی
};

// وضعیت اولیه حالا به صورت داینامیک از localStorage خوانده می‌شود
const initialState: UiState = {
  theme: getInitialTheme(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    toLightMode: (state) => {
      state.theme = "light";
    },
    toDarkMode: (state) => {
      state.theme = "dark";
    },
  },
});

export const { toggleTheme, toLightMode, toDarkMode, setTheme } =
  uiSlice.actions;
export default uiSlice.reducer;
