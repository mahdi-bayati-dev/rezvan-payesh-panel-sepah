import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { licenseApi } from "@/features/license/api/licenseService";
import type {
  LicenseState,
  ActivateLicensePayload,
} from "@/features/license/types";
import type { RootState } from "@/store/index";
import { AxiosError } from "axios";

interface LicenseReduxState {
  data: LicenseState | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  activateStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LicenseReduxState = {
  data: null,
  status: "idle",
  activateStatus: "idle",
  error: null,
};

export const fetchLicenseStatus = createAsyncThunk(
  "license/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await licenseApi.getStatus();
      return response;
    } catch (error: any) {
      // ✅ هندلینگ هوشمند خطای ۴۹۹ برای لایسنس
      // اگر سرور ۴۹۹ داد، معمولاً بادی ریسپانس حاوی اطلاعات لایسنس (مثل ID) است
      if (error instanceof AxiosError && error.response?.status === 499 && error.response.data) {
          // دیتای موجود در خطا را به عنوان دیتای موفق برمی‌گردانیم
          return error.response.data as LicenseState;
      }

      let errorMessage = "خطا در دریافت اطلاعات لایسنس";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const activateLicense = createAsyncThunk(
  "license/activate",
  async (payload: ActivateLicensePayload, { rejectWithValue }) => {
    try {
      const response = await licenseApi.activate(payload);
      return response.license;
    } catch (error: any) {
      let errorMessage = "خطا در فعال‌سازی لایسنس";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const licenseSlice = createSlice({
  name: "license",
  initialState,
  reducers: {
    clearLicenseError: (state) => {
      state.error = null;
      state.activateStatus = "idle";
    },
    resetLicenseState: () => initialState,
  },
  extraReducers: (builder) => {
    // --- Fetch Status ---
    builder.addCase(fetchLicenseStatus.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(
      fetchLicenseStatus.fulfilled,
      (state, action: PayloadAction<LicenseState>) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchLicenseStatus.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload as string;
    });

    // --- Activate License ---
    builder.addCase(activateLicense.pending, (state) => {
      state.activateStatus = "loading";
      state.error = null;
    });
    builder.addCase(
      activateLicense.fulfilled,
      (state, action: PayloadAction<LicenseState>) => {
        state.activateStatus = "succeeded";
        state.data = action.payload;
        state.error = null;
      }
    );
    builder.addCase(activateLicense.rejected, (state, action) => {
      state.activateStatus = "failed";
      state.error = action.payload as string;
    });
  },
});

export const { clearLicenseError, resetLicenseState } = licenseSlice.actions;

export const selectLicenseData = (state: RootState) => state.license.data;
export const selectLicenseStatus = (state: RootState) => state.license.data?.status;
export const selectIsLicenseLoading = (state: RootState) => state.license.status === "loading";
export const selectIsActivating = (state: RootState) => state.license.activateStatus === "loading";
export const selectLicenseError = (state: RootState) => state.license.error;

export default licenseSlice.reducer;