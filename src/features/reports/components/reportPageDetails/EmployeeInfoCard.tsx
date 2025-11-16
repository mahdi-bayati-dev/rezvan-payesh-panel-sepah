import type { ActivityLog } from "@/features/reports/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
import type { Employee as UserEmployeeProfile } from "@/features/User/types/index";
// [جدید] ایمپورت تابع کمکی
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";

interface EmployeeInfoCardProps {
  logEmployee: ActivityLog["employee"]; // دیتای (ناقص) از خود لاگ
  userEmployee?: UserEmployeeProfile | null; // [اصلاح] این پراپ اختیاری شد
}

// ... (تابع getAvatarPlaceholder بدون تغییر) ...
const getAvatarPlaceholder = (
  firstName?: string,
  lastName?: string
): string => {
  const fName = firstName || "";
  const lName = lastName || "";
  // اولین حرف نام و اولین حرف نام خانوادگی
  return `${fName.charAt(0)}${lName.charAt(0)}`.trim() || "??";
};

export const EmployeeInfoCard = ({
  logEmployee,
  userEmployee, // [اصلاح] این پراپ اختیاری است
}: EmployeeInfoCardProps) => {
  // ۱. نام: اولویت با دیتای کامل User (اگر وجود داشته باشد)
  const name = userEmployee
    ? `${userEmployee.first_name} ${userEmployee.last_name}`
    : logEmployee.name; // fallback

  // ۲. آواتار:
  const avatarUrl = logEmployee.avatarUrl;
  const avatarPlaceholder = getAvatarPlaceholder(
    userEmployee?.first_name, // اگر userEmployee بود، از نام دقیق‌تر استفاده کن
    userEmployee?.last_name
  );

  // ۳. [اصلاح کلیدی] ساخت ردیف‌های اطلاعاتی (هوشمند)
  const infoRows: InfoRowData[] = [
    {
      label: "کد پرسنلی",
      // اگر دیتای کامل بود از personnel_code، وگرنه از employeeId (که از dataMapper فارسی شده) استفاده کن
      value: toPersianNumbers(
        userEmployee?.personnel_code || logEmployee.employeeId
      ),
    },
    {
      label: "سازمان",
      // فقط در صورت وجود دیتای کامل (پنل کاربر) نمایش داده می‌شود
      value: userEmployee?.organization?.name || "نامشخص",
    },
    {
      label: "گروه کاری",
      // فقط در صورت وجود دیتای کامل (پنل کاربر) نمایش داده می‌شود
      value: userEmployee?.work_group?.name || "نامشخص",
    },
  ];

  return (
    <UserInfoCard
      title="مشخصات کارمند"
      name={name}
      avatarUrl={avatarUrl}
      avatarPlaceholder={avatarPlaceholder}
      infoRows={infoRows}
    />
  );
};