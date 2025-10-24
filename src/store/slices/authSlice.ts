import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
// ۱. ایمپورت instance پیکربندی شده به جای axios خام
import axiosInstance from "@/lib/AxiosConfig";
// ۲. ایمپورت تایپ AxiosError برای مدیریت بهتر خطا
import { AxiosError } from "axios";
import type { LoginFormData } from "@/features/auth/schema/loginSchema";

// --- تعریف تایپ User ---
interface User {
  id: number;
  name: string;
  email: string;
  roles: any[];
}

// --- AuthState (بدون تغییر) ---
interface AuthState {
  user: User | null;
  initialAuthCheckStatus: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  logoutStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  initialAuthCheckStatus: "idle",
  loginStatus: "idle",
  logoutStatus: "idle",
  error: null,
};

// --- Thunk برای بررسی وضعیت اولیه لاگین ---
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      // ۳. استفاده از axiosInstance (baseURL و withCredentials خودکار اعمال می‌شود)
      const response = await axiosInstance.get<User>("/user"); // فقط مسیر نسبی کافی است
      return response.data;
    } catch (error) {
      let errorMessage = "کاربر احراز هویت نشده است.";
      // ۴. بررسی خطای Axios با تایپ
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage; // دسترسی امن‌تر به message
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Thunk برای لاگین کاربر ---
export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginFormData, { rejectWithValue }) => {
    try {
      // ۳. استفاده از axiosInstance
      const response = await axiosInstance.post<{ user: User }>("/login", {
        // فقط مسیر نسبی
        user_name: loginData.username,
        password: loginData.password,
      });
      return response.data.user;
    } catch (error) {
      let errorMessage = "خطایی در هنگام ورود رخ داد.";
      // ۴. بررسی خطای Axios با تایپ
      if (error instanceof AxiosError && error.response) {
        errorMessage =
          error.response.data?.message || "نام کاربری یا رمز عبور نامعتبر است.";
      } else if (error instanceof Error) {
        // خطاهای دیگر (مثل خطای شبکه)
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Thunk برای لاگ اوت کاربر ---
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // ۳. استفاده از axiosInstance
      await axiosInstance.post("/logout"); // فقط مسیر نسبی
      return undefined;
    } catch (error) {
      let errorMessage = "خطا در خروج از سیستم.";
      // ۴. بررسی خطای Axios با تایپ
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Slice Definition (بدون تغییر در extraReducers) ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for checkAuthStatus (بدون تغییر)
      .addCase(checkAuthStatus.pending, (state) => {
        state.initialAuthCheckStatus = "loading";
      })
      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.initialAuthCheckStatus = "succeeded";
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(checkAuthStatus.rejected, (state) => {
        state.initialAuthCheckStatus = "failed";
        state.user = null;
      })
      // Cases for loginUser (بدون تغییر)
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loginStatus = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.user = null;
        state.error = action.payload as string;
      })
      // Cases for logoutUser (بدون تغییر)
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutStatus = "succeeded";
        state.user = null;
        state.error = null;
        state.loginStatus = "idle";
        state.initialAuthCheckStatus = "idle";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = "failed";
        state.user = null;
        state.error = action.payload as string;
        state.loginStatus = "idle";
        state.initialAuthCheckStatus = "idle";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
