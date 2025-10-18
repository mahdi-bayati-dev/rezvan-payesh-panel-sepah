// کامپوننت نمایش وضعیت (Badge)
import type {  RequestStatus } from '../types';
const StatusBadgeCell = ({ status }: { status: RequestStatus }) => {
    const colorClasses = {
        'تایید شده': 'bg-green-100 text-green-800',
        'پاسخ داده نشده': 'bg-yellow-100 text-yellow-800',
        'رد شده': 'bg-red-100 text-red-800',
        'در حال بررسی': 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default StatusBadgeCell