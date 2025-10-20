import Badge, { type BadgeVariant } from '@/components/ui/Badge';

import type { RequestCategory } from '@/features/requests/types/index';


const categoryToVariantMap: Record<RequestCategory, BadgeVariant> = {
    'ماموریت': 'info',
    'مرخصی': 'warning',
    'تجهیزات': 'default',

};

interface CategoryBadgeCellProps {
    category: RequestCategory;
}

/**
 * کامپوننت آداپتور برای نمایش بَج دسته‌بندی
 */
const CategoryBadgeCell = ({ category }: CategoryBadgeCellProps) => {
    // ۳. پیدا کردن variant متناظر
    const variant = categoryToVariantMap[category] || 'default';

    return (
        // ۴. استفاده مجدد از همان کامپوننت ماژولار Badge
        <Badge label={category} variant={variant} />
    );
};

export default CategoryBadgeCell;