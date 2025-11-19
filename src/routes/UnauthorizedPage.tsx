import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, Home, LockKeyhole } from "lucide-react";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser, selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";

// نگاشت نام نقش‌ها به فارسی جهت نمایش کاربرپسند
const ROLE_TRANSLATIONS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "مدیر ارشد (Super Admin)",
  [ROLES.ADMIN_L2]: "ادمین سطح ۲",
  [ROLES.ADMIN_L3]: "ادمین سطح ۳",
  [ROLES.USER]: "کاربر عادی",
};

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const roles = useAppSelector(selectUserRoles);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    // [بهینه‌سازی]: چون الان همه کاربران به داشبورد دسترسی دارند،
    // نیازی به چک کردن شرط کاربر عادی نیست. همه به "/" هدایت می‌شوند.
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 transition-colors dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-colors dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

        {/* آیکون و هدر */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <ShieldAlert className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            عدم دسترسی (403)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            شما مجوز لازم برای مشاهده این صفحه را ندارید.
          </p>
        </div>

        {/* اطلاعات کاربر و نقش‌ها */}
        {user && (
          <div className="mb-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
              <LockKeyhole className="text-gray-400 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                اطلاعات کاربری شما:
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">نام کاربر:</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{user.user_name}</span>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="text-gray-500 dark:text-gray-400 mb-1">نقش‌های شناسایی شده:</span>
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                      >
                        {ROLE_TRANSLATIONS[role] || role}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">بدون نقش تعریف شده</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleGoBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت
          </button>

          <button
            onClick={handleGoHome}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primaryL px-4 py-2.5 text-sm font-medium text-white hover:bg-primaryL-600 focus:outline-none focus:ring-2 focus:ring-primaryL focus:ring-offset-2 dark:bg-primaryD dark:hover:bg-primaryD-600"
          >
            <Home className="h-4 w-4" />
            صفحه اصلی
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;