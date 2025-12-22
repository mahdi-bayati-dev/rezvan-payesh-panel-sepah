import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// تابع کمکی برای خواندن تورهای کامل شده از LocalStorage
const getPersistedTours = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("completed_onboarding_tours");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Error reading onboarding status:", e);
    return [];
  }
};

interface OnboardingState {
  completedTours: string[];
}

const initialState: OnboardingState = {
  completedTours: getPersistedTours(),
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    completeTour: (state, action: PayloadAction<string>) => {
      if (!state.completedTours.includes(action.payload)) {
        state.completedTours.push(action.payload);
        // ذخیره در LocalStorage برای ماندگاری بعد از رفرش
        localStorage.setItem(
          "completed_onboarding_tours",
          JSON.stringify(state.completedTours)
        );
      }
    },
    resetAllTours: (state) => {
      state.completedTours = [];
      localStorage.removeItem("completed_onboarding_tours");
    },
  },
});

export const { completeTour, resetAllTours } = onboardingSlice.actions;
export default onboardingSlice.reducer;
