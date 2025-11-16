import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";
import { useMemo } from "react";

// ایمپورت دو صفحه‌ای که داریم
import ActivityReportPage from "./reportPage"; // صفحه ادمین
import MyReportsPage from "./MyReportsPage"; // صفحه کاربر
import ReportsPageSkeleton from "../Skeleton/SkeletonRepotrs"; // اسکلت لودینگ

/**
 * این کامپوننت "هوشمند" به عنوان ورودی اصلی /reports عمل می‌کند.
 * نقش کاربر را از Redux بررسی می‌کند و تصمیم می‌گیرد
 * کدام صفحه گزارش را رندر کند:
 * - ادمین: ActivityReportPage (گزارش کامل با فیلتر کارمندان)
 * - کاربر: MyReportsPage (فقط گزارش‌های خود کاربر)
 */
export default function ReportsIndexPage() {
  const roles = useAppSelector(selectUserRoles);

  // بررسی اینکه آیا کاربر نقش ادمین دارد یا خیر
  // (شما باید 'admin' را با نام نقش واقعی در سیستم خود جایگزین کنید)
  const isAdmin = useMemo(() => {
    // اگر roles هنوز لود نشده (مثلاً در auth check اولیه)
    if (roles.length === 0) {
      return null; // وضعیت نامشخص
    }
    // (این منطق را بر اساس سیستم رول خودتان تنظیم کنید)
    return roles.includes("admin") || roles.includes("super_admin"); 
  }, [roles]);

  // اگر وضعیت احراز هویت هنوز مشخص نیست، اسکلت لودینگ را نشان بده
  if (isAdmin === null) {
    // (می‌توانید از selectAuthCheckStatus نیز برای دقت بیشتر استفاده کنید)
    return <ReportsPageSkeleton />;
  }

  // اگر ادمین است، پنل ادمین را نشان بده
  if (isAdmin) {
    return <ActivityReportPage />;
  }

  // اگر کاربر عادی است، صفحه "گزارش‌های من" را نشان بده
  return <MyReportsPage />;
}