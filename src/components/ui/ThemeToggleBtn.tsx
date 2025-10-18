// ThemeToggleBtn.tsx
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleTheme } from "../../store/slices/uiSlice";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleBtn = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  const isLight = theme === "light";

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label={isLight ? "تغییر به حالت تیره" : "تغییر به حالت روشن"}
      className={`
        relative flex items-center justify-center
        w-12 h-6 rounded-full p-1
        transition-all duration-300 ease-in-out
        
        ${isLight ? "bg-gray-200" : "bg-gray-800 hover:bg-gray-700"}
        active:scale-95
      `}
    >
      {/* دکمه متحرک */}
      <div
        className={`
          absolute top-0.5
          w-5 h-5 rounded-full bg-white shadow-md
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isLight ? "translate-x-0" : "translate-x-0"}
          ${isLight ? "rotate-0" : "rotate-180"}
        `}
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-600 transition-transform duration-300" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-gray-800 transition-transform duration-300" />
        )}
      </div>

      {/* برای دسترسی‌پذیری */}
      <span className="sr-only">
        {isLight ? "تغییر به حالت تیره" : "تغییر به حالت روشن"}
      </span>
    </button>
  );
};
