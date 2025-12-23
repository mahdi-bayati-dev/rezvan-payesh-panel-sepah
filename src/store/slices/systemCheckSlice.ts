// ====================================================================
// 1. Redux Slice (store/slices/systemCheckSlice.ts)
// ====================================================================
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SystemCheckState {
  isTimeSynced: boolean;
  serverTime: string | null;
  timeDiff: number; // اختلاف به میلی‌ثانیه
  isChecking: boolean;
}

const initialState: SystemCheckState = {
  isTimeSynced: true,
  serverTime: null,
  timeDiff: 0,
  isChecking: false,
};

// تعریف تایپ برای پی‌لود اکشن جهت جلوگیری از تداخل تایپ در TypeScript
interface TimeSyncPayload {
  isSynced: boolean;
  diff: number;
  serverTime: string | null; // اجازه دادن به مقدار null برای شرایط خطا
}

export const systemCheckSlice = createSlice({
  name: "systemCheck",
  initialState,
  reducers: {
    setTimeSyncStatus: (state, action: PayloadAction<TimeSyncPayload>) => {
      state.isTimeSynced = action.payload.isSynced;
      state.timeDiff = action.payload.diff;
      state.serverTime = action.payload.serverTime;
      state.isChecking = false;
    },
    setChecking: (state) => {
      state.isChecking = true;
    },
  },
});

export const { setTimeSyncStatus, setChecking } = systemCheckSlice.actions;
export const systemCheckReducer = systemCheckSlice.reducer;
