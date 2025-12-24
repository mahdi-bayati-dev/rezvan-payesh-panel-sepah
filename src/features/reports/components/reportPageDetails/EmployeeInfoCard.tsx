import type { ActivityLog } from "@/features/reports/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
import type { Employee as UserEmployeeProfile } from "@/features/User/types/index";
import { toPersianNumbers } from "@/features/reports/utils/toPersianNumbers";
import { getFullImageUrl } from "@/features/User/utils/imageHelper";

interface EmployeeInfoCardProps {
  logEmployee: ActivityLog["employee"];
  userEmployee?: UserEmployeeProfile | null;
}

export const EmployeeInfoCard = ({
  logEmployee,
  userEmployee,
}: EmployeeInfoCardProps) => {

  const name = logEmployee.name;
  // کد پرسنلی در مپر فارسی شده است
  const personnelCode = logEmployee.employeeId;

  const rawAvatarUrl = logEmployee.avatarUrl;
  const fullAvatarUrl = getFullImageUrl(rawAvatarUrl);

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
      // ✅ تبدیل شماره تماس به فارسی
      value: toPersianNumbers(userEmployee?.phone_number),
    },
    {
      label: "سازمان",
      value: userEmployee?.organization?.name || "نامشخص",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <UserInfoCard
        title="مشخصات سرباز"
        name={name}
        avatarUrl={fullAvatarUrl || undefined}
        avatarPlaceholder={avatarPlaceholder}
        infoRows={infoRows}
      // className="border border-borderL dark:border-borderD shadow-sm"
      />
    </div>
  );
};