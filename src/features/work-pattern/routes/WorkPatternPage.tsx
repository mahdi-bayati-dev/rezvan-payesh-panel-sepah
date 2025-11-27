import { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// Hooks
import { useWorkPatterns } from '@/features/work-pattern/hooks/useWorkPatternsHookGet';
import { useWeekPatternDetails } from '@/features/work-pattern/hooks/useWeekPatternDetails';
import { useShiftSchedule } from '@/features/shift-schedule/hooks/hook';

// Components
import { WorkPatternList } from '@/features/work-pattern/components/workPatternPage/workPatternList';
import { WorkPatternScheduleView } from '@/features/work-pattern/components/workPatternPage/workPatternScheduleView';
import { ShiftScheduleScheduleView } from '@/features/work-pattern/components/workPatternPage/ShiftScheduleScheduleView';
import { WorkPatternActions } from '@/features/work-pattern/components/workPatternPage/workPatternActions';

// UI
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft, LayoutDashboard } from 'lucide-react';

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
  <div className="flex justify-between items-center px-2 py-3 mt-auto border-t border-borderL dark:border-borderD bg-backgroundL-500/50 dark:bg-backgroundD/50 backdrop-blur-sm rounded-b-xl">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1 || isLoading}
      className="h-8 w-8 p-0"
    >
      <ChevronRight size={16} />
    </Button>
    <span className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD">
      {currentPage} / {lastPage}
    </span>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= lastPage || isLoading}
      className="h-8 w-8 p-0"
    >
      <ChevronLeft size={16} />
    </Button>
  </div>
);

export default function WorkPatternPage() {
  const [selectedPatternKey, setSelectedPatternKey] = useState<string | null>(null);
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

  const selectedPattern = patternsList.find(
    (p) => p.id === selectedId && p.pattern_type === selectedType
  ) || null;

  const selectedPatternName = selectedPattern?.name || null;
  const isShiftScheduleSelected = selectedType === 'SHIFT_SCHEDULE';

  // --- Fetch Details ---
  const {
    data: selectedPatternDetails,
    isLoading: isLoadingWeekDetails,
    isError: isWeekDetailsError,
    error: weekDetailsError,
  } = useWeekPatternDetails(isShiftScheduleSelected ? null : selectedId);

  const {
    data: selectedShiftScheduleDetails,
    isLoading: isLoadingShiftDetails,
    isError: isShiftDetailsError,
    error: shiftDetailsError,
  } = useShiftSchedule(isShiftScheduleSelected ? (selectedId || 0) : 0);

  const isLoadingDetails = isLoadingWeekDetails || isLoadingShiftDetails;
  const isDetailsError = isWeekDetailsError || isShiftDetailsError;
  const detailsError = weekDetailsError || shiftDetailsError;

  // --- Handlers ---
  const handleSelectPattern = (key: string | null) => {
    setSelectedPatternKey(key);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && paginationMeta && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage);
      setSelectedPatternKey(null);
    }
  };

  return (
    // ✨ UX Fix: استفاده از h-screen منهای هدر برای جلوگیری از اسکرول اضافه صفحه اصلی
    // و استفاده از gap کمتر برای فشردگی بیشتر در دسکتاپ
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-100px)] p-1 overflow-hidden">

      {/* --- ستون راست: لیست (سایدبار) --- */}
      <div className="lg:col-span-3 h-full flex flex-col min-h-0 bg-backgroundL-500 dark:bg-backgroundD rounded-xl border border-borderL dark:border-borderD shadow-sm overflow-hidden">
        {isListError && (
          <div className="p-2">
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertTitle>خطا</AlertTitle>
              <AlertDescription>{(listError as Error)?.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* لیست با اسکرول داخلی */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <WorkPatternList
            patterns={patternsList}
            selectedPatternKey={selectedPatternKey}
            onSelectPattern={handleSelectPattern}
            isLoading={isLoadingList}
          />
        </div>

        {/* Pagination چسبیده به پایین */}
        {paginationMeta && paginationMeta.last_page > 1 && (
          <PaginationControls
            currentPage={currentPage}
            lastPage={paginationMeta.last_page}
            onPageChange={handlePageChange}
            isLoading={isLoadingList}
          />
        )}
      </div>

      {/* --- ستون وسط و چپ: محتوا و اکشن‌ها --- */}
      <div className="lg:col-span-9 h-full flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* بخش نمایش شماتیک (ویژوال) */}
        <div className="flex-1 h-full flex flex-col min-h-[400px] bg-backgroundL-500/50 dark:bg-backgroundD/50 rounded-xl border border-borderL dark:border-borderD shadow-sm overflow-hidden relative">

          {isDetailsError && selectedId && (
            <div className="absolute top-4 right-4 left-4 z-50">
              <Alert variant="destructive">
                <AlertTitle>خطا در دریافت جزئیات</AlertTitle>
                <AlertDescription>{(detailsError as Error)?.message}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* اگر هیچ الگویی انتخاب نشده */}
          {!selectedId && !isLoadingDetails && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD opacity-60">
              <LayoutDashboard className="w-16 h-16 mb-4 stroke-1" />
              <p className="text-lg font-medium">یک الگو را برای مشاهده جزئیات انتخاب کنید</p>
            </div>
          )}

          {/* کامپوننت‌های نمایش */}
          <div className="flex-1 overflow-hidden p-1">
            {selectedId && (
              isShiftScheduleSelected ? (
                <ShiftScheduleScheduleView
                  schedule={selectedShiftScheduleDetails || null}
                  isLoadingDetails={isLoadingDetails}
                />
              ) : (
                <WorkPatternScheduleView
                  selectedPattern={selectedPatternDetails || null}
                  isLoadingDetails={isLoadingDetails}
                />
              )
            )}
          </div>
        </div>

        {/* بخش اکشن‌ها (سمت چپ در دسکتاپ) */}
        <div className="lg:w-64 shrink-0">
          <WorkPatternActions
            selectedPatternId={selectedId}
            selectedPatternName={selectedPatternName}
            isShiftSchedule={isShiftScheduleSelected}
            onActionComplete={() => setSelectedPatternKey(null)}
          />
        </div>

      </div>
    </div>
  );
}