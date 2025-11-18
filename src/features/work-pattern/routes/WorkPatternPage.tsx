import { useState, useMemo } from 'react';
// ✅ اصلاح حساسیت به حروف: Alert -> alert
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// ✅ ۱. ایمپورت هوک‌های React Query
// ✅ اصلاح مسیر: حذف /features/ از alias
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';
import { useWeekPatternDetails } from '@/features/work-pattern/hooks/useWeekPatternDetails';
// ✅✅✅ جدید: ایمپورت هوک جزئیات برنامه شیفتی (مسیر alias صحیح است)
// ✅ اصلاح مسیر: حذف /features/ از alias
import { useShiftSchedule } from '@/features/shift-schedule/hooks/hook';

// کامپوننت‌های ماژولار
// ✅ اصلاح مسیر: حذف /features/ از alias
import { WorkPatternList } from '@/features/work-pattern/components/workPatternPage/workPatternList';
import { WorkPatternScheduleView } from '@/features/work-pattern/components/workPatternPage/workPatternScheduleView';
// ✅✅✅ جدید: ایمپورت کامپوننت شماتیک برنامه شیفتی
// ✅ اصلاح مسیر: حذف /features/ از alias
import { ShiftScheduleScheduleView } from '@/features/work-pattern/components/workPatternPage/ShiftScheduleScheduleView';
import { WorkPatternActions } from '@/features/work-pattern/components/workPatternPage/workPatternActions';

// کامپوننت صفحه‌بندی
// ✅ اصلاح حساسیت به حروف: Button -> button
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const PaginationControls = ({
  currentPage,
  lastPage,
  onPageChange,
  isLoading,
}: PaginationControlsProps) => (
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
  const [selectedPatternKey, setSelectedPatternKey] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: combinedData,
    isLoading: isLoadingList,
    isError: isListError,
    error: listError,
  } = useWorkPatterns(currentPage);

  const patternsList = combinedData?.patterns || [];
  const paginationMeta = combinedData?.meta;

  const { selectedId, selectedType } = useMemo(() => {
    if (!selectedPatternKey) {
      return { selectedId: null, selectedType: null };
    }
    const parts = selectedPatternKey.split('-');
    if (parts.length < 2) return { selectedId: null, selectedType: null };
    const id = parseInt(parts.pop()!, 10);
    const type = parts.join('-');
    return {
      selectedId: id,
      selectedType: type as 'WEEK_PATTERN' | 'SHIFT_SCHEDULE',
    };
  }, [selectedPatternKey]);

  const selectedPattern =
    patternsList.find(
      (p) => p.id === selectedId && p.pattern_type === selectedType
    ) || null;

  const selectedPatternName = selectedPattern?.name || null;
  const isShiftScheduleSelected = selectedType === 'SHIFT_SCHEDULE';

  // --- ۲. فچ کردن جزئیات الگوی انتخاب شده ---

  // هوک جزئیات الگوی هفتگی (فقط زمانی فعال است که شیفتی انتخاب *نشده* باشد)
  const {
    data: selectedPatternDetails,
    isLoading: isLoadingWeekDetails,
    isError: isWeekDetailsError,
    error: weekDetailsError,
  } = useWeekPatternDetails(isShiftScheduleSelected ? null : selectedId);

  // ✅✅✅ جدید: هوک جزئیات برنامه شیفتی (فقط زمانی فعال است که شیفتی انتخاب *شده* باشد)
  const {
    data: selectedShiftScheduleDetails,
    isLoading: isLoadingShiftDetails,
    isError: isShiftDetailsError,
    error: shiftDetailsError,
  } = useShiftSchedule(isShiftScheduleSelected ? (selectedId || 0) : 0);

  // ✅✅✅ جدید: یکپارچه‌سازی وضعیت لودینگ و خطا
  const isLoadingDetails = isLoadingWeekDetails || isLoadingShiftDetails;
  const isDetailsError = isWeekDetailsError || isShiftDetailsError;
  const detailsError = weekDetailsError || shiftDetailsError;

  // --- ۳. هندلرها ---
  const handleSelectPattern = (key: string | null) => {
    setSelectedPatternKey(key);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && paginationMeta && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage);
      setSelectedPatternKey(null);
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
            <AlertDescription>
              {(listError as Error)?.message || 'خطا در دریافت لیست'}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 min-h-0">
          <WorkPatternList
            patterns={patternsList}
            selectedPatternKey={selectedPatternKey}
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

      {/* ستون وسط: شماتیک (✅ بخش آپدیت شده) */}
      <div className="lg:col-span-7 h-full min-h-[400px]">
        {/* مدیریت خطای یکپارچه برای هر دو نوع جزئیات */}
        {isDetailsError && selectedId && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>خطا در دریافت جزئیات</AlertTitle>
            <AlertDescription>
              {(detailsError as Error)?.message ||
                'خطا در دریافت جزئیات الگوی انتخاب شده.'}
            </AlertDescription>
          </Alert>
        )}

        {/* ✅ رندر شرطی بر اساس نوع الگو */}
        {isShiftScheduleSelected ? (
          // اگر برنامه شیفتی بود، کامپوننت جدید را رندر کن
          <ShiftScheduleScheduleView
            schedule={selectedShiftScheduleDetails || null}
            isLoadingDetails={isLoadingDetails && !!selectedId}
          />
        ) : (
          // در غیر این صورت، کامپوننت الگوی هفتگی قبلی را رندر کن
          <WorkPatternScheduleView
            selectedPattern={selectedPatternDetails || null}
            isLoadingDetails={isLoadingDetails && !!selectedId}
          />
        )}
      </div>

      {/* ستون چپ: گزینه‌ها (بدون تغییر) */}
      <div className="lg:col-span-2 ">
        <WorkPatternActions
          selectedPatternId={selectedId}
          selectedPatternName={selectedPatternName}
          isShiftSchedule={isShiftScheduleSelected}
          onActionComplete={() => setSelectedPatternKey(null)}
        />
      </div>
    </div>
  );
}