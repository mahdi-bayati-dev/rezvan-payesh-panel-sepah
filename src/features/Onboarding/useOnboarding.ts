import { useCallback, useMemo, useRef } from "react";
import { driver, type Driver } from "driver.js";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hook/reduxHooks";
import { completeTour } from "@/store/slices/onboardingSlice";
import { TOUR_STEPS } from "./OnboardingData";

export const useOnboarding = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const driverInstance = useRef<Driver | null>(null);

  const completedTours = useAppSelector(
    (state) => state.onboarding.completedTours
  );

  const currentPath = useMemo(() => {
    const path = location.pathname;
    const tourKeys = Object.keys(TOUR_STEPS);

    // ۱. اولویت اول: تطبیق دقیق (Exact Match)
    // اگر روت دقیقاً در دیتا بیس ما بود، همان را برگردان
    if (TOUR_STEPS[path]) return path;

    // ۲. اولویت دوم: تطبیق الگوهای داینامیک (Dynamic Route Matching)
    // فقط اگر تطبیق دقیق پیدا نشد، روت‌های حاوی :id را چک کن
    const matchedPattern = tourKeys.find((pattern) => {
      if (!pattern.includes(":")) return false; // فقط روت‌های داینامیک را اینجا چک کن
      const regexPath = pattern.replace(/:[^\s/]+/g, "([^/]+)");
      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(path);
    });

    if (matchedPattern) return matchedPattern;

    // ۳. اولویت سوم: منطق سلسله‌مراتبی (Fallback)
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "/dashboard";

    let testPath = `/${segments.join("/")}`;
    while (segments.length > 0) {
      if (TOUR_STEPS[testPath]) return testPath;
      segments.pop();
      testPath = `/${segments.join("/")}`;
    }

    return "/dashboard";
  }, [location.pathname]);

  const startTour = useCallback(
    (force = false) => {
      const steps = TOUR_STEPS[currentPath];
      if (!steps || steps.length === 0) return;

      const isAlreadyCompleted = completedTours.includes(currentPath);
      if (isAlreadyCompleted && !force) return;

      if (driverInstance.current) {
        driverInstance.current.destroy();
      }

      driverInstance.current = driver({
        showProgress: true,
        animate: true,
        popoverClass: "rezvan-onboarding-popover",
        nextBtnText: "بعدی",
        prevBtnText: "قبلی",
        doneBtnText: "متوجه شدم",
        overlayColor: "rgba(0, 0, 0, 0.75)",
        allowClose: true,
        onDestroyed: () => {
          dispatch(completeTour(currentPath));
          driverInstance.current = null;
        },
      });

      driverInstance.current.setSteps(steps);
      driverInstance.current.drive();
    },
    [currentPath, completedTours, dispatch]
  );

  return { startTour, currentPath, driverInstance };
};
