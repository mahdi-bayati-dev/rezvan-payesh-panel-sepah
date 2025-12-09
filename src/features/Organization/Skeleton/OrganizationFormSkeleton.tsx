import { Skeleton } from '@/components/ui/Skeleton';

export const OrganizationFormSkeleton = () => {
  return (
    <div
      className="p-5 bg-backgroundL-500 rounded-lg shadow-md dark:bg-backgroundD border border-borderL dark:border-borderD"
      dir="rtl"
    >
      <Skeleton className="h-7 w-3/4 mb-6" />

      <div className="space-y-2 mb-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2 mb-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};