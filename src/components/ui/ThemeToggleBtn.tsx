// ThemeToggleBtn.tsx
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleTheme } from "../../store/slices/uiSlice";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleBtn = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isLight = theme === "light";

  return (
    <label
      htmlFor="theme-toggle"
      className={`
        group relative block h-7 w-13 rounded-full cursor-pointer
        transition-colors [-webkit-tap-highlight-color:_transparent]
        ${isLight ? "bg-gray-300" : "bg-gray-700"}
      `}
    >
      {/* input نامرئی ولی قابل فوکوس */}
      <input
        type="checkbox"
        id="theme-toggle"
        checked={!isLight}
        onChange={() => dispatch(toggleTheme())}
        className="peer sr-only"
      />

      {/* دایره‌ی متحرک */}
      <span
        className={`
          absolute inset-y-0 start-0 m-1 grid size-5 place-content-center
          rounded-full bg-white text-gray-700
          transition-[inset-inline-start] duration-300 ease-in-out
          peer-checked:start-6
        `}
      >
        {/* آیکون‌ها */}
        <Sun
          className={`
            size-4 text-amber-500 transition-opacity duration-300
            ${isLight ? "opacity-100" : "opacity-0"}
          `}
        />
        <Moon
          className={`
            size-5 text-gray-800 transition-opacity duration-300 absolute
            ${isLight ? "opacity-0" : "opacity-100"}
          `}
        />
      </span>
    </label>
  );
};
