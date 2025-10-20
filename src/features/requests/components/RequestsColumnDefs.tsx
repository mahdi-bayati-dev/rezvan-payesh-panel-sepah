// features/requests/components/RequestsColumnDefs.tsx
import { type ColumnDef } from '@tanstack/react-table';
import type { Request } from '@/features/requests/types/index';
import ActionsMenuCell from '@/features/requests/components/ActionsMenuCell';
import UserAvatarCell from '@/features/requests/components/UserAvatarCell';
import StatusBadgeCell from '@/features/requests/components/StatusBadgeCell';
import CategoryBadgeCell from '@/features/requests/components/CategoryBadgeCell';

// === تعریف ستون‌ها ===

export const requestsColumns: ColumnDef<Request>[] = [
    // 1. ستون انتخاب (Checkbox)
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <input
    //             type="checkbox"
    //             checked={table.getIsAllRowsSelected()}
    //             onChange={table.getToggleAllRowsSelectedHandler()}
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <input
    //             type="checkbox"
    //             checked={row.getIsSelected()}
    //             onChange={row.getToggleSelectedHandler()}
    //             disabled={!row.getCanSelect()}
    //         />
    //     ),
    // },

    // 2. ستون مشخصات (رندر سفارشی)
    {
        accessorKey: 'requester', // کلید داده
        header: 'مشخصات', // عنوان ستون
        cell: ({ row }) => {
            const { name, phone, avatarUrl } = row.original.requester;
            return <UserAvatarCell name={name} phone={phone} avatarUrl={avatarUrl} />;
        },
    },

    // 3. ستون‌های ساده (فقط نمایش متن)
    {
        accessorKey: 'organization',
        header: 'سازمان',
    },
    {
        accessorKey: 'category',
        header: 'دسته بندی',
        cell: ({ row }) => {
            // استفاده از کامپوننت آداپتور جدید
            return <CategoryBadgeCell category={row.original.category} />;
        },
    },
    {
        accessorKey: 'requestType',
        header: 'نوع درخواست',
    },

    // 4. ستون وضعیت (رندر سفارشی)
    {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
            return <StatusBadgeCell status={row.original.status} />;
        },
    },

    // 5. ستون تاریخ
    {
        accessorKey: 'date',
        header: 'تاریخ درخواست',
    },

    // 6. ستون شماره درخواست
    {
        accessorKey: 'requestNumber',
        header: 'شماره درخواست',
    },

    // 7. ستون عملیات (رندر سفارشی)
    {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => {
            return <ActionsMenuCell requestId={row.original.id} />;
        },
    },
];