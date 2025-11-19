import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePermission } from "@/hook/usePermission";
// import { ROLES } حذف شد چون استفاده نشده بود و باعث خطای بیلد می‌شد

interface RoleBasedGuardProps {
    allowedRoles: string[];
    redirectTo?: string;
}

export const RoleBasedGuard = ({
    allowedRoles,
    redirectTo = "/unauthorized", // یا هر مسیری که برای عدم دسترسی در نظر دارید
}: RoleBasedGuardProps) => {
    const hasPermission = usePermission(allowedRoles);
    const location = useLocation();

    // لاگ برای دیباگ (می‌توانید در پروداکشن حذف کنید)
    if (!hasPermission) {
        console.warn(
            `[Access Denied] User attempted to access ${location.pathname} without required roles:`,
            allowedRoles
        );
    }

    // اگر دسترسی داشت، محتوا (Outlet) را نشان بده
    if (hasPermission) {
        return <Outlet />;
    }

    // مدیریت ریدایرکت هوشمند برای "کاربر عادی"
    if (location.pathname === "/" && !hasPermission) {
        return <Navigate to="/requests" replace />;
    }

    // در غیر این صورت ریدایرکت به صفحه لاگین یا صفحه خطا
    return <Navigate to={redirectTo} replace />;
};