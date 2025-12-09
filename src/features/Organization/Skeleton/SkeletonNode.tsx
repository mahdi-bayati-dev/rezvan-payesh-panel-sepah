import { Skeleton } from '@/components/ui/Skeleton';

const SkeletonNode = ({ indentationLevel = 0 }: { indentationLevel?: number }) => {
  const paddingRight = `${indentationLevel * 1.5}rem`; 

  return (
    <div 
      className="flex items-center justify-between py-3 px-4 border-b border-borderL/50 dark:border-borderD/50 last:border-0" 
      style={{ paddingRight: paddingRight ? `calc(1rem + ${paddingRight})` : '1rem' }}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-md" />
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-5 w-32 md:w-48 rounded-md" />
      </div>

      <div className="flex items-center pl-2">
        <Skeleton className="h-8 w-8 rounded-md" /> 
      </div>
    </div>
  );
};

export const OrganizationTreeSkeleton = () => {
  return (
    <div className="w-full space-y-6" dir="rtl">
      
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>

      <div
        className="bg-backgroundL-500 dark:bg-backgroundD rounded-lg border border-borderL dark:border-borderD shadow-sm overflow-hidden"
      >
        <div className="flex flex-col">
          <SkeletonNode indentationLevel={0} />
          <SkeletonNode indentationLevel={1} />
          <SkeletonNode indentationLevel={1} />
          <SkeletonNode indentationLevel={2} />
          <SkeletonNode indentationLevel={0} />
          <SkeletonNode indentationLevel={1} />
        </div>
      </div>
    </div>
  );
};