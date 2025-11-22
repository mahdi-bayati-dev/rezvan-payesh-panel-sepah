import type { ActivityLog } from "@/features/reports/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
import type { Employee as UserEmployeeProfile } from "@/features/User/types/index";
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";

// کامپوننت UserInfoCard باید بتواند آواتار را هندل کند
// اما اگر UserInfoCard از تگ img معمولی استفاده می‌کند، بهتر است
// آدرس عکس را قبل از ارسال پردازش کنیم یا خود UserInfoCard را آپدیت کنیم.
// در اینجا فرض می‌کنیم UserInfoCard از پراپ avatarUrl استفاده می‌کند.

interface EmployeeInfoCardProps {
  logEmployee: ActivityLog["employee"];
  userEmployee?: UserEmployeeProfile | null;
}

export const EmployeeInfoCard = ({
  logEmployee,
  userEmployee,
}: EmployeeInfoCardProps) => {

  const name = logEmployee.name;
  const personnelCode = logEmployee.employeeId;

  // نکته مهم: در اینجا avatarUrl را مستقیماً پاس می‌دهیم. 
  // اگر کامپوننت UserInfoCard قابلیت هندل کردن خطای عکس را ندارد، 
  // باید آن کامپوننت هم آپدیت شود تا از <Avatar /> استفاده کند.
  const avatarUrl = logEmployee.avatarUrl;

  // این بخش برای کامپوننت‌های قدیمی که نیاز به حروف اول اسم دارند
  const getAvatarPlaceholder = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.split(' ');
    const f = parts[0]?.[0] || "";
    const l = parts[1]?.[0] || "";
    return `${f}${l}`;
  };

  const avatarPlaceholder = getAvatarPlaceholder(name);

  const infoRows: InfoRowData[] = [
    {
      label: "کد پرسنلی",
      value: personnelCode,
    },
    {
      label: "شماره تماس",
      value: toPersianNumbers(userEmployee?.phone_number),
    },
    {
      label: "سازمان",
      value: userEmployee?.organization?.name || "نامشخص",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* اطمینان حاصل کن که UserInfoCard از منطق مشابه Avatar استفاده می‌کند */}
      <UserInfoCard
        title="مشخصات کارمند"
        name={name}
        avatarUrl={avatarUrl}
        avatarPlaceholder={avatarPlaceholder}
        infoRows={infoRows}
      />
    </div>
  );
};