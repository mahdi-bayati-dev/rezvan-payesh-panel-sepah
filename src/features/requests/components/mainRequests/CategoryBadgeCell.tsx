// features/requests/components/mainRequests/CategoryBadgeCell.tsx
import Badge, { type BadgeVariant } from '@/components/ui/Badge'; // (استفاده از حروف کوچک)

// ۱. [اصلاح] ایمپورت تایپ LeaveType
// (این تایپ حالا از types/index.ts که آپدیت کردیم re-export می‌شود)
import type { LeaveType } from '@/features/requests/types/index';

interface CategoryBadgeCellProps {
    // ۲. [اصلاح] پراپ ورودی حالا آبجکت LeaveType است
    leaveType: LeaveType;
}

/**
 * کامپوننت آداپتور برای نمایش بَج دسته‌بندی
 */
const CategoryBadgeCell = ({ leaveType }: CategoryBadgeCellProps) => {
    
    // ۳. [اصلاح] ما فقط نام را نمایش می‌دهیم
    // (می‌توانید منطق رنگ را بر اساس parent_id یا خود id اضافه کنید)
    const label = leaveType?.name || '---';
    
    // یک رنگ پیش‌فرض (می‌توانید بعدا این را هوشمند کنید)
    const variant: BadgeVariant = 'info'; 

    return (
        <Badge label={label} variant={variant} />
    );
};

export default CategoryBadgeCell;