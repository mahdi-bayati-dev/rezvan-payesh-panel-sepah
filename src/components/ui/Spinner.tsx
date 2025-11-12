import { type FC } from "react";

interface SpinnerProps {
  fullscreen?: boolean; // اسپینر تمام‌صفحه باشه یا نه
  size?: "sm" | "md" | "lg" | "xs"; // اندازه اسپینر
  text?: string; // متن زیر اسپینر
}

const sizeClasses = {
  xs: "w-3 h-3 border",
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-3",
  lg: "w-14 h-14 border-4",
};

export const Spinner: FC<SpinnerProps> = ({
  fullscreen = false,
  size = "md",
  text = '',
}) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-solid border-primary border-t-transparent ${sizeClasses[size]
        }`}
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        {spinner}
        {text && (
          <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && (
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-xs font-medium">
          {text}
        </p>
      )}
    </div>
  );
};
