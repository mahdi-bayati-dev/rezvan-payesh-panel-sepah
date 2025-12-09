import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { AUTH_MODE } from "@/lib/AxiosConfig";
import { AxiosError } from "axios";
import type { LoginFormData } from "@/features/auth/schema/loginSchema";
import type { RootState } from "@/store";

// ====================================================================
// 📝 تعاریف تایپ‌ها
// ====================================================================

interface User {
  id: number;
  user_name: string;
  email: string;
  roles: string[];
  employee?: any;
}

interface LoginResponse {
  access_token?: string;
  token_type?: string;
  user: User;
}

interface MeResponse {
  data: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  initialAuthCheckStatus: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  logoutStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

// ====================================================================
// 🛠️ ابزارهای کمکی (بهینه شده برای SSR)
// ====================================================================

/**
 * دریافت توکن با چک کردن محیط اجرا (کلاینت/سرور)
 * این کار از خطای "window is not defined" در Next.js جلوگیری می‌کند.
 */
const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null; // گارد برای SSR
  if (AUTH_MODE === "token") {
    try {
      return localStorage.getItem("accessToken");
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  accessToken: getInitialToken(),
  isAuthenticated: false,
  initialAuthCheckStatus: "idle",
  loginStatus: "idle",
  logoutStatus: "idle",
  error: null,
};

// ====================================================================
// ⚡ Async Thunks
// ====================================================================

export const checkAuthStatus = createAsyncThunk<User, void, ThunkConfig>(
  "auth/checkStatus",
  async (_, { rejectWithValue, getState }) => {
    // اگر مود توکن است اما توکن نداریم، اصلاً ریکوئست نزن (بهینه‌سازی ترافیک)
    if (AUTH_MODE === "token") {
      const token = (getState() as RootState).auth.accessToken;
      if (!token) return rejectWithValue("No token found.");
    }

    try {
      const response = await axiosInstance.get<MeResponse>("/me");
      return response.data.data;
    } catch (error: any) {
      let errorMessage = "عدم احراز هویت";
      // فقط اگر توکن منقضی شده بود (۴۰۱)، توکن را پاک کن
      if (error instanceof AxiosError && error.response?.status === 401) {
        if (AUTH_MODE === "token" && typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginFormData,
  ThunkConfig
>("auth/login", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<LoginResponse>("/login", {
      user_name: loginData.username,
      password: loginData.password,
    });

    if (
      AUTH_MODE === "token" &&
      response.data.access_token &&
      typeof window !== "undefined"
    ) {
      localStorage.setItem("accessToken", response.data.access_token);
    }

    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error);
    let errorMessage = "خطایی در هنگام ورود رخ داد.";

    if (error instanceof AxiosError && error.response) {
      errorMessage =
        error.response.data?.message || "نام کاربری یا رمز عبور اشتباه است.";
    }

    return rejectWithValue(errorMessage);
  }
});

export const logoutUser = createAsyncThunk<void, void, ThunkConfig>(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.warn(
        "Logout API warning (session might be mostly cleared):",
        error
      );
    } finally {
      dispatch(authSlice.actions.clearSession());
    }
  }
);

// ====================================================================
// 🍰 Slice Definition
// ====================================================================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.error = null;
      state.loginStatus = "idle";
    },
    clearSession: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.initialAuthCheckStatus = "failed";
      state.loginStatus = "idle";
      if (AUTH_MODE === "token" && typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Check Auth ---
      .addCase(checkAuthStatus.pending, (state) => {
        state.initialAuthCheckStatus = "loading";
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.initialAuthCheckStatus = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.initialAuthCheckStatus = "failed";
        state.user = null;
        state.isAuthenticated = false;
        // اگر احراز هویت فیل شد، توکن را هم از استیت پاک کن تا UI درست رفتار کند
        state.accessToken = null;
      })

      // --- Login ---
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.accessToken = action.payload.access_token || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialAuthCheckStatus = "succeeded";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.error = action.payload as string;
      })

      // --- Logout ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutStatus = "succeeded";
      });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectUserRoles = (state: RootState) =>
  state.auth.user?.roles || [];
export const selectIsLoggedIn = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthCheckStatus = (state: RootState) =>
  state.auth.initialAuthCheckStatus;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { resetAuthStatus, clearSession } = authSlice.actions;
export default authSlice.reducer;
