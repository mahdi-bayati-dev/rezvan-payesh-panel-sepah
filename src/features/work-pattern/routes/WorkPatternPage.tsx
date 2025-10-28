import { useState } from 'react';
// import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// ✅ ۱. ایمپورت هوک‌های React Query
// کامنت: هوک useWorkPatterns همان هوکی است که تابع 'select' را برای تبدیل داده‌ها دارد
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';
import { useWeekPatternDetails } from '@/features/work-pattern/hooks/useWeekPatternDetails';

// کامنت: ایمپورت کامپوننت‌های ماژولار
import { WorkPatternList } from '@/features/work-pattern/components/workPatternPage/workPatternList';
import { WorkPatternScheduleView } from '@/features/work-pattern/components/workPatternPage/workPatternScheduleView';
import { WorkPatternActions } from '@/features/work-pattern/components/workPatternPage/workPatternActions';

// کامنت: کامپوننت صفحه‌بندی (بدون تغییر)
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';


interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const PaginationControls = ({ currentPage, lastPage, onPageChange, isLoading }: PaginationControlsProps) => (
  <div className="flex justify-center items-center gap-2 mt-4">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1 || isLoading}
    >
      <ChevronRight size={16} /> {/* آیکون برای RTL */}
      قبلی
    </Button>
    <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
      صفحه {currentPage} از {lastPage}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= lastPage || isLoading}
    >
      بعدی
      <ChevronLeft size={16} /> {/* آیکون برای RTL */}
    </Button>
  </div>
);


export default function WorkPatternPage() {
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- ۱. فچ کردن لیست الگوها ---
  // ✅ تغییر ۱: استفاده از هوک useWorkPatterns که داده‌ها را تبدیل می‌کند
  const {
    data: listData, // کامنت: listData حالا آبجکت { patterns, meta, links } است
    isLoading: isLoadingList,
    isError: isListError,
    error: listError
  } = useWorkPatterns(currentPage); // ✅ هوک صحیح

  // ✅ تغییر ۲: دسترسی به پراپرتی patterns (که WorkPatternUI[] است)
  const patternsList = listData?.patterns || []; // ⬅️ قبلاً listData?.data بود
  const paginationMeta = listData?.meta; // ⬅️ این درست بود

  // --- ۲. فچ کردن جزئیات الگوی انتخاب شده ---
  const {
    data: selectedPatternDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useWeekPatternDetails(selectedPatternId);

  // --- ۳. هندلرها ---
  const handleSelectPattern = (id: number | string) => {
    setSelectedPatternId(typeof id === 'string' ? parseInt(id, 10) : id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && paginationMeta && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage);
      setSelectedPatternId(null);
    }
  };

  // --- ۴. رندر ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3  lg:h-[calc(100vh-6rem)]">

      {/* ستون راست: لیست */}
      <div className="lg:col-span-3 h-full order-last lg:order-none flex flex-col">
        {isListError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>خطا</AlertTitle>
            <AlertDescription>{(listError as Error)?.message || 'خطا در دریافت لیست'}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 min-h-0">
          <WorkPatternList
            patterns={patternsList} // ✅ حالا patternsList از نوع WorkPatternUI[] است
            selectedPatternId={selectedPatternId}
            onSelectPattern={handleSelectPattern}
            isLoading={isLoadingList}
          />
        </div>
        {paginationMeta && paginationMeta.last_page > 1 && (
          <PaginationControls
            currentPage={currentPage}
            lastPage={paginationMeta.last_page}
            onPageChange={handlePageChange}
            isLoading={isLoadingList}
          />
        )}
      </div>

      {/* ستون وسط: شماتیک (بدون تغییر) */}
      <div className="lg:col-span-7 h-full min-h-[400px]">
        {isDetailsError && selectedPatternId && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>خطا</AlertTitle>
            <AlertDescription>{(detailsError as Error)?.message || 'خطا در دریافت جزئیات الگو'}</AlertDescription>
          </Alert>
        )}
        <WorkPatternScheduleView
          selectedPattern={selectedPatternDetails || null}
          isLoadingDetails={isLoadingDetails && !!selectedPatternId}
        />
      </div>

      {/* ستون چپ: گزینه‌ها (بدون تغییر) */}
      <div className="lg:col-span-2 ">
        <WorkPatternActions />
      </div>

    </div>
  );
}


