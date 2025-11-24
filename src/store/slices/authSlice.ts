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
  roles: string[];
}

interface LoginResponse {
  user: User;
  message?: string;
}

interface MeResponse {
  data: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialAuthCheckStatus: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  logoutStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialAuthCheckStatus: "idle",
  loginStatus: "idle",
  logoutStatus: "idle",
  error: null,
};

// --- Async Thunks ---

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    // console.log فقط در محیط توسعه برای جلوگیری از شلوغی کنسول پروداکشن
    if (import.meta.env.DEV) console.log("%c[Auth Check] Requesting /me...", "color: #8b5cf6");
    
    try {
      const response = await axiosInstance.get<MeResponse>("/me");
      return response.data.data;
    } catch (error) {
      let errorMessage = "عدم احراز هویت";
      if (error instanceof AxiosError) {
         // اگر 401 بود یعنی کاربر لاگین نیست، نیازی به لاگ خطا نیست
         if (error.response?.status !== 401 && import.meta.env.DEV) {
             console.error("[Auth Check] Error:", error);
         }
         errorMessage = error.response?.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<LoginResponse>("/login", {
        user_name: loginData.username,
        password: loginData.password,
      });
      return response.data;
    } catch (error) {
      console.error("[Login] Failed:", error);
      let errorMessage = "خطایی در هنگام ورود رخ داد.";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || "نام کاربری یا رمز عبور نامعتبر است.";
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ اصلاح خطا: حذف rejectWithValue چون استفاده نمی‌شد
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    if (import.meta.env.DEV) console.log("%c[Logout] Clearing session...", "color: #ef4444");
    try {
      await axiosInstance.post("/logout");
      return undefined;
    } catch (error) {
      // در خروج، حتی اگر سرور خطا داد، ما در کلاینت عملیات را موفق فرض می‌کنیم
      // تا کاربر گیر نکند. بنابراین نیازی به rejectWithValue نیست.
      if (import.meta.env.DEV) console.warn("[Logout] Server side logout failed, forcing client logout.", error);
      return undefined;
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
    logoutClientSide: (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialAuthCheckStatus = "failed";
    }
  },
  extraReducers: (builder) => {
    builder
      // --- checkAuthStatus ---
      .addCase(checkAuthStatus.pending, (state) => {
        state.initialAuthCheckStatus = "loading";
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.initialAuthCheckStatus = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.initialAuthCheckStatus = "failed";
        state.user = null;
        state.isAuthenticated = false;
      })
      // --- loginUser ---
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loginStatus = "succeeded";
        state.user = action.payload.user; 
        state.isAuthenticated = true;
        state.error = null;
        state.initialAuthCheckStatus = "succeeded";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // --- logoutUser ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialAuthCheckStatus = "failed";
        state.loginStatus = "idle";
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialAuthCheckStatus = "failed";
      });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectUserRoles = (state: RootState) => state.auth.user?.roles || [];
export const selectIsLoggedIn = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthCheckStatus = (state: RootState) => state.auth.initialAuthCheckStatus;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { clearAuthError, logoutClientSide } = authSlice.actions;
export default authSlice.reducer;