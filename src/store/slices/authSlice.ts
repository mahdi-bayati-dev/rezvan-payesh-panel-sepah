import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axiosInstance from "@/lib/AxiosConfig";
import { AxiosError } from "axios";
import type { LoginFormData } from "@/features/auth/schema/loginSchema";
import { type RootState } from "@/store";

// --- Type Definitions ---
interface User {
  id: number;
  user_name: string;
  email: string;
  roles: string[]; // این فیلد برای تشخیص ادمین کلیدی است
}

interface LoginResponse {
  // در سیستم HttpOnly، دیگر access_token به صورت مستقیم در پاسخ نیست
  // یا اگر هست، فقط برای اطلاع است و نباید ذخیره شود.
  // ما فرض می‌کنیم لاگین موفقیت‌آمیز است و توکن در کوکی HttpOnly تنظیم شده است.
  token_type?: string;
  expires_at?: string;
  user: User;
}

interface MeResponse {
  data: User;
}

interface AuthState {
  user: User | null;
  // توکن در Redux Store ذخیره نمی‌شود.
  // accessToken: string | null; // حذف شد
  initialAuthCheckStatus: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  logoutStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// ✅ حذف تابع getInitialToken و عدم نیاز به خواندن از localStorage
const initialState: AuthState = {
  user: null,
  // accessToken: null, // حذف شد
  initialAuthCheckStatus: "idle",
  loginStatus: "idle",
  logoutStatus: "idle",
  error: null,
};

// --- Async Thunks ---

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    // در سیستم HttpOnly، وجود توکن در کوکی را مرورگر خودکار مدیریت می‌کند.
    // اگر کوکی نباشد، API با 401 پاسخ می‌دهد.
    console.log("Attempting to check auth status...");
    try {
      // اگر توکن در کوکی باشد، این درخواست موفق است
      const response = await axiosInstance.get<MeResponse>("/me");
      console.log("Auth check successful:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Auth check failed:", error);
      let errorMessage = "احراز هویت ناموفق است یا توکن منقضی شده.";
      if (error instanceof AxiosError && error.response) {
        // ✅ گرفتن پیام از بک‌اند (مانند "Unauthenticated.")
        errorMessage = error.response.data?.message || errorMessage;
      }
      // در صورت 401، کوکی HttpOnly توسط بک‌اند پاک می‌شود یا مرورگر آن را نمی‌فرستد.
      // بنابراین نیازی به پاک کردن دستی توکن در اینجا نیست.
      console.log("Rejecting checkAuthStatus with value:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginFormData, { rejectWithValue }) => {
    console.log("Attempting to login user...");
    try {
      // پس از لاگین موفق، بک‌اند کوکی HttpOnly را تنظیم می‌کند
      const response = await axiosInstance.post<LoginResponse>("/login", {
        user_name: loginData.username,
        password: loginData.password,
      });
      console.log(
        "Login API Response (assuming HttpOnly Cookie set):",
        response.data
      );

      // ✅ حذف ذخیره توکن در localStorage

      // برگرداندن پاسخ کامل برای استفاده در reducer
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "خطایی در هنگام ورود رخ داد.";
      if (error instanceof AxiosError && error.response) {
        errorMessage =
          error.response.data?.message || "نام کاربری یا رمز عبور نامعتبر است.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log("Rejecting loginUser with value:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    console.log("Attempting to logout user...");

    try {
      // این درخواست باید کوکی HttpOnly را بفرستد و سرور آن را پاک کند.
      await axiosInstance.post("/logout");
      console.log("Logout successful on server (HttpOnly Cookie cleared)");

      // ✅ حذف پاک کردن دستی توکن از localStorage
      return undefined;
    } catch (error) {
      console.error("Logout failed:", error);

      // ✅ حذف پاک کردن دستی توکن از localStorage در صورت خطا

      let errorMessage = "خطا در خروج از سیستم.";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log("Rejecting logoutUser with value:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Slice Definition ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.loginStatus = "idle";
    },
    // ✅ حذف اکشن clearToken: توکن توسط بک‌اند و مرورگر مدیریت می‌شود.
  },
  extraReducers: (builder) => {
    builder
      // --- checkAuthStatus ---
      .addCase(checkAuthStatus.pending, (state) => {
        state.initialAuthCheckStatus = "loading";
      })
      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.initialAuthCheckStatus = "succeeded";
          state.user = action.payload;
          state.error = null;
          // ✅ عدم نیاز به تنظیم accessToken
        }
      )
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.initialAuthCheckStatus = "failed";
        state.user = null;
        // ✅ تنظیم پیام خطا در هنگام عدم موفقیت احراز هویت
        state.error = (action.payload as string) || "احراز هویت ناموفق.";
        // ✅ عدم نیاز به تنظیم accessToken
      })
      // --- loginUser ---
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loginStatus = "succeeded";
          state.user = action.payload.user;
          // ✅ عدم نیاز به ذخیره access_token در Redux
          state.error = null;
          state.initialAuthCheckStatus = "succeeded";
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.user = null;
        // ✅ عدم نیاز به تنظیم accessToken
        state.error = action.payload as string;
      })
      // --- logoutUser ---
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // بازگشت به حالت اولیه، بدون توکن
        Object.assign(state, initialState, {
          initialAuthCheckStatus: "failed",
        });
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = "failed";
        // بازگشت به حالت اولیه، بدون توکن
        Object.assign(state, initialState, {
          initialAuthCheckStatus: "failed",
        });
        state.error = action.payload as string;
      });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
// [جدید] سلکتور برای خواندن نقش‌های کاربر
export const selectUserRoles = (state: RootState) =>
  state.auth.user?.roles || [];
export const selectIsLoggedIn = (state: RootState) => !!state.auth.user;
export const selectAuthCheckStatus = (state: RootState) =>
  state.auth.initialAuthCheckStatus;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { clearAuthError } = authSlice.actions; // ✅ حذف clearToken
export default authSlice.reducer;
