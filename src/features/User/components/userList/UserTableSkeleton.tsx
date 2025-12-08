export const UserTableSkeleton = () => {
    return (
        <div className="w-full space-y-4 animate-pulse" dir="rtl">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>

            {/* Table Skeleton */}
            <div className="border border-borderL dark:border-borderD rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    ))}
                </div>

                {/* Table Rows */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 items-center">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                        {/* Other Columns */}
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex justify-end gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};