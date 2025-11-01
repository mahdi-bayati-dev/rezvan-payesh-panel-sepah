import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axiosInstance from "@/lib/AxiosConfig";
import { AxiosError } from "axios";
import type { LoginFormData } from "@/features/auth/schema/loginSchema";
import { type RootState } from "@/store"; // ایمپورت RootState

// --- Type Definitions ---
interface User {
  id: number;
  user_name: string;
  email: string;
  roles: string[];
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

interface MeResponse {
  data: User;
}

// ۱. تعریف ساختار پاسخ کامل API لاگین (شامل توکن)
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null; // ۲. اضافه کردن فیلد توکن
  initialAuthCheckStatus: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  logoutStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// ۳. خواندن توکن اولیه از localStorage
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    console.error("Could not read token from localStorage", e);
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: getInitialToken(), // ۴. مقداردهی اولیه توکن
  initialAuthCheckStatus: "idle",
  loginStatus: "idle",
  logoutStatus: "idle",
  error: null,
};

// --- Async Thunks ---

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue, getState }) => {
    // getState را اضافه می‌کنیم
    console.log("Attempting to check auth status...");
    // ۵. اگر توکنی از قبل نداشتیم، نیازی به ارسال درخواست نیست
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) {
      console.log("No token found, rejecting checkAuthStatus.");
      return rejectWithValue("No token found.");
    }
    // اگر توکن داشتیم، interceptor آن را اضافه می‌کند
    try {
      const response = await axiosInstance.get<MeResponse>("/me");
      console.log("Auth check successful:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Auth check failed:", error);
      let errorMessage = "توکن نامعتبر یا منقضی شده است.";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        // اگر خطا 401 بود، توکن را پاک می‌کنیم
        if (error.response.status === 401) {
          try {
            localStorage.removeItem("accessToken");
          } catch (error) {
            console.log(error);
          }
        }
      }
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
      // ۶. حالا پاسخ کامل API (شامل توکن) را انتظار داریم
      const response = await axiosInstance.post<LoginResponse>("/login", {
        user_name: loginData.username,
        password: loginData.password,
      });
      console.log("Login API Response:", response.data);
      // ۷. ذخیره توکن در localStorage
      try {
        localStorage.setItem("accessToken", response.data.access_token);
      } catch (e) {
        console.error("Could not save token to localStorage", e);
        // می‌توانید خطا را به کاربر نشان دهید یا فقط لاگ کنید
      }
      // ۸. برگرداندن پاسخ کامل برای استفاده در reducer
      return response.data;
    } catch (error) {
      // ... (مدیریت خطا مثل قبل) ...
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

// ...existing code...
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, getState }) => {
    console.log("Attempting to logout user...");
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) {
      console.log("No token found, performing local logout.");
      try {
        localStorage.removeItem("accessToken");
      } catch (error) {
        console.log(error);
      }
      return undefined;
    }

    try {
      await axiosInstance.post("/logout");
      console.log("Logout successful on server");
      try {
        localStorage.removeItem("accessToken");
      } catch (error) {
        console.log(error);
      }
      return undefined;
    } catch (error) {
      console.error("Logout failed:", error);
      // حتی اگر API خطا داد، توکن را از localStorage پاک می‌کنیم
      try {
        localStorage.removeItem("accessToken");
      } catch (error) {
        console.log(error);
      }
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
    // ۱۲. اکشن برای پاک کردن دستی توکن (اگر لازم شد)
    clearToken: (state) => {
      state.accessToken = null;
      try {
        localStorage.removeItem("accessToken");
      } catch (error) {
        console.log(error);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- checkAuthStatus ---
      .addCase(checkAuthStatus.pending, (state) => {
        state.initialAuthCheckStatus = "loading";
      })
      // --- اصلاحیه کلیدی ۳ ---
      // PayloadAction حالا خود User است، نه { data: User }
      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.initialAuthCheckStatus = "succeeded";
          // --- اصلاحیه کلیدی ۴ ---
          // action.payload حالا خود آبجکت کاربر است
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(checkAuthStatus.rejected, (state) => {
        state.initialAuthCheckStatus = "failed";
        state.user = null;
        state.accessToken = null;
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
          // (این بخش از قبل درست بود)
          state.user = action.payload.user;
          state.accessToken = action.payload.access_token;
          state.error = null;
          state.initialAuthCheckStatus = "succeeded";
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
      })
      // --- logoutUser ---
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState, {
          accessToken: null,
          initialAuthCheckStatus: "failed",
        });
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = "failed";
        Object.assign(state, initialState, {
          accessToken: null,
          initialAuthCheckStatus: "failed",
        });
        state.error = action.payload as string;
      });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => !!state.auth.user;
export const selectAuthCheckStatus = (state: RootState) =>
  state.auth.initialAuthCheckStatus;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { clearAuthError, clearToken } = authSlice.actions;
export default authSlice.reducer;
