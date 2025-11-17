import type { ActivityLog } from "@/features/reports/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
// [اصلاح ۱] حالا تایپ Employee رو مستقیم ایمپورت می‌کنیم
import type { Employee as UserEmployeeProfile } from "@/features/User/types/index";
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";

// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/Button";
// import { User } from "lucide-react";

interface EmployeeInfoCardProps {
  logEmployee: ActivityLog["employee"]; // دیتای ناقص از لاگ
  userEmployee?: UserEmployeeProfile | null; // دیتای کامل کارمند (آبجکت Employee)
}

const getAvatarPlaceholder = (
  firstName?: string,
  lastName?: string
): string => {
  const fName = firstName || "";
  const lName = lastName || "";
  return `${fName.charAt(0)}${lName.charAt(0)}`.trim() || "??";
};

export const EmployeeInfoCard = ({
  logEmployee,
  userEmployee,
}: EmployeeInfoCardProps) => {
  
  // const navigate = useNavigate();
  
  // --- [اصلاح ۲] ---
  // ID لازم برای دکمه (User ID) در logEmployee.userId قرار دارد
  // (که در dataMapper ست شده)
  // const employeeProfileId = logEmployee.userId;
  // --- [پایان اصلاح] ---

  // const handleGoToProfile = () => {
  //   if (employeeProfileId) {
  //     navigate(`/organizations/users/${employeeProfileId}`);
  //   } else {
  //     console.error('[EmployeeInfoCard] GoToProfile clicked but employeeProfileId is 0 or nullish.');
  //   }
  // };

  // --- [اصلاح ۳] اولویت‌بندی نمایش ---
  // ما همیشه نام و کد پرسنلی را از خود لاگ (logEmployee) می‌خوانیم
  // چون اون مربوط به همین گزارش هست.
  const name = logEmployee.name;
  const personnelCode = logEmployee.employeeId; // این از dataMapper میاد (فارسی شده)
  // --- [پایان اصلاح] ---

  const avatarUrl = logEmployee.avatarUrl;
  const avatarPlaceholder = getAvatarPlaceholder(
    logEmployee.name.split(' ')[0], // استفاده از نام خود لاگ
    logEmployee.name.split(' ')[1]
  );

  const infoRows: InfoRowData[] = [
    {
      label: "کد پرسنلی",
      value: personnelCode, // [اصلاح] استفاده از متغیر بالا
    },
    // --- [جدید] افزودن شماره تماس ---
    {
      label: "شماره تماس",
      // toPersianNumbers خودش null و undefined رو مدیریت می‌کنه و "---" برمی‌گردونه
      value: toPersianNumbers(userEmployee?.phone_number),
    },
    // --- [پایان جدید] ---
    {
      label: "سازمان",
      // [اصلاح ۴] حالا userEmployee خود آبجکت کارمند است
      value: userEmployee?.organization?.name || "نامشخص",
    },
    // {
    //   label: "گروه کاری",
    //   // [اصلاح ۵] حالا userEmployee خود آبجکت کارمند است
    //   value: userEmployee?.work_group?.name || "نامشخص",
    // },
  ];

  return (
    <div className="flex flex-col gap-4">
      <UserInfoCard
        title="مشخصات کارمند"
        name={name} // [اصلاح] استفاده از نام خود لاگ
        avatarUrl={avatarUrl}
        avatarPlaceholder={avatarPlaceholder}
        infoRows={infoRows}
      />
      
      {/* <Button
        variant="outline"
        onClick={handleGoToProfile}
        disabled={!employeeProfileId} // دکمه با userId فعال می‌شود
        className="w-full flex items-center justify-center gap-2"
      >
        <User className="w-4 h-4" />
        <span>مشاهده پروفایل کارمند</span>
      </Button> */}
    </div>
  );
};