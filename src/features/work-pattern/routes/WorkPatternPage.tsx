import { useState, useMemo } from 'react'; // ✅ useMemo اضافه شد
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// ✅ ۱. ایمپورت هوک‌های React Query
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';
import { useWeekPatternDetails } from '@/features/work-pattern/hooks/useWeekPatternDetails';

// کامنت: ایمپورت کامپوننت‌های ماژولار
import { WorkPatternList } from '@/features/work-pattern/components/workPatternPage/workPatternList';
import { WorkPatternScheduleView } from '@/features/work-pattern/components/workPatternPage/workPatternScheduleView';
import { WorkPatternActions } from '@/features/work-pattern/components/workPatternPage/workPatternActions';

// کامنت: کامپوننت صفحه‌بندی
import { Button } from '@/components/ui/Button'; // ✅ G: 'Button' -> 'button'
import { ChevronRight, ChevronLeft, Info } from 'lucide-react'; // ✅ Info اضافه شد


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
  // ✅ ۱. state به کلید ترکیبی (رشته) تغییر کرد
  const [selectedPatternKey, setSelectedPatternKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);


  const {
    data: combinedData, // ✅ هوک useWorkPatterns حالا داده ترکیبی را برمی‌گرداند
    isLoading: isLoadingList,
    isError: isListError,
    error: listError
  } = useWorkPatterns(currentPage);


  const patternsList = combinedData?.patterns || [];
  const paginationMeta = combinedData?.meta;

  // ✅ ۲. منطق جدید: پارس کردن کلید ترکیبی برای یافتن ID و Type
  const { selectedId, selectedType } = useMemo(() => {
    if (!selectedPatternKey) {
      return { selectedId: null, selectedType: null };
    }
    // کامنت: کلید را بر اساس "-" جدا می‌کنیم (مثال: "WEEK_PATTERN-5")
    const parts = selectedPatternKey.split('-');
    if (parts.length < 2) return { selectedId: null, selectedType: null };

    const id = parseInt(parts.pop()!, 10); // آخرین بخش ID است
    const type = parts.join('-'); // بقیه نوع است (برای اطمینان از انواع چند کلمه‌ای)

    return {
      selectedId: id,
      selectedType: type as 'WEEK_PATTERN' | 'SHIFT_SCHEDULE'
    };
  }, [selectedPatternKey]);

  // کامنت: پیدا کردن الگوی منتخب بر اساس ID و Type
  const selectedPattern = patternsList.find(
    p => p.id === selectedId && p.pattern_type === selectedType
  ) || null;

  const selectedPatternName = selectedPattern?.name || null;
  const isShiftScheduleSelected = selectedType === 'SHIFT_SCHEDULE';


  // --- ۲. فچ کردن جزئیات الگوی انتخاب شده ---
  const {
    data: selectedPatternDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useWeekPatternDetails(
    // کامنت: فقط اگر الگوی ثابت (و نه شیفتی) انتخاب شده بود، جزئیات را فچ کن
    isShiftScheduleSelected ? null : selectedId
  );


  // --- ۳. هندلرها ---
  // کامنت: هندلر حالا کلید ترکیبی (رشته) را مستقیماً در state قرار می‌دهد
  const handleSelectPattern = (key: string | null) => {
    setSelectedPatternKey(key);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && paginationMeta && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage);
      setSelectedPatternKey(null); // ✅ با تغییر صفحه، آیتم منتخب پاک شود
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
            patterns={patternsList}
            selectedPatternKey={selectedPatternKey} // ✅ ارسال پراپ جدید
            onSelectPattern={handleSelectPattern} // ✅ ارسال هندلر جدید
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

      {/* ستون وسط: شماتیک ) */}
      <div className="lg:col-span-7 h-full min-h-[400px]">
        {isDetailsError && selectedId && !isShiftScheduleSelected && ( // فقط خطای جزئیات الگوهای ثابت
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>خطا</AlertTitle>
            <AlertDescription>{(detailsError as Error)?.message || 'خطا در دریافت جزئیات الگو'}</AlertDescription>
          </Alert>
        )}

        {/* ✅ نمایش پیام برای الگوهای شیفتی */}
        {selectedId && isShiftScheduleSelected ? (
          <div className="p-4 bg-backgroundL-500 rounded-lg shadow md:min-h-[450px] flex flex-col items-center justify-center dark:bg-backgroundD border border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD">
            <Info className='h-10 w-10 mb-3 text-blue-500' />
            <p className='font-semibold text-lg mb-2'>{selectedPatternName}</p>
            <p>این الگو، یک «برنامه شیفتی چرخشی» است.</p>
            <p className='text-sm'>برای مشاهده و ویرایش اسلات‌های چرخه، لطفاً دکمه "ویرایش" را بزنید.</p>
          </div>
        ) : (
          <WorkPatternScheduleView
            selectedPattern={selectedPatternDetails || null}
            isLoadingDetails={isLoadingDetails && !!selectedId}
          />
        )}
      </div>

      {/* ستون چپ: گزینه‌ها ) */}
      <div className="lg:col-span-2 ">
        <WorkPatternActions
          selectedPatternId={selectedId} // ✅ ارسال ID خام (عددی)
          selectedPatternName={selectedPatternName}
          isShiftSchedule={isShiftScheduleSelected} // ✅ ارسال نوع الگو
        />
      </div>

    </div>
  );
}

