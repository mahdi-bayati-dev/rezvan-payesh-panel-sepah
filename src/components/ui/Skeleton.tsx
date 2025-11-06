import clsx from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    // شما می‌توانید پراپ‌های بیشتری مثل width, height, circle و... اضافه کنید
    
}

/**
 * یک کامپوننت پایه برای نمایش لودینگ اسکلتی.
 * از `animate-pulse` تیل‌ویند برای افکت درخشان استفاده می‌کند.
 */
export const Skeleton = ({ className, ...props }: SkeletonProps) => {
    return (
        <div
            className={clsx(
                'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
                className
            )}
            {...props}
        />
    );
};