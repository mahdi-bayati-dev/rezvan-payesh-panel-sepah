

import Badge, { type BadgeVariant } from '@/components/ui/Badge';

import type { RequestStatus } from '@/features/requests/types/index';


const statusToVariantMap: Record<RequestStatus, BadgeVariant> = {
    'تایید شده': 'success',
    'پاسخ داده نشده': 'warning',
    'رد شده': 'danger',
    'در حال بررسی': 'info',
};

interface StatusBadgeCellProps {
    status: RequestStatus;
}


const StatusBadgeCell = ({ status }: StatusBadgeCellProps) => {

    const variant = statusToVariantMap[status] || 'default';

    return (

        <Badge label={status} variant={variant} />
    );
};

export default StatusBadgeCell;