import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { AssignmentControls } from '@/features/work-pattern/components/assignment/AssignmentControls';
import { useAssignmentLogic } from '@/features/work-pattern/hooks/logic/useAssignmentLogic';

export default function AddToWorkPatternPage() {
  const navigate = useNavigate();

  // تمام لاجیک‌ها از هوک اختصاصی می‌آیند
  const {
    selectedPattern, setSelectedPattern,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    isGlobalLoading,
    patternOptions,
    employeesCount, groupsCount,
    employeesTable, workGroupsTable,
    handleAssign, hasSelection
  } = useAssignmentLogic();

  // هندلر تغییر تب (برای پاک کردن سرچ)
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-backgroundL-500 min-h-screen dark:bg-backgroundD transition-colors" dir="rtl">

      {/* --- ۱. هدر صفحه --- */}
      <div className="flex items-center justify-between border-b border-borderL dark:border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/work-patterns')}
            className="h-10 w-10 hover:bg-secondaryL/50 dark:hover:bg-white/5 dark:text-muted-foregroundD"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">تخصیص الگوی کاری</h1>
            <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD/70 mt-1">مدیریت اتصال انبوه سربازان یا گروه‌ها به الگوها</p>
          </div>
        </div>
      </div>

      {/* --- ۲. کنترل‌ها (انتخاب الگو و تب‌ها) --- */}
      <AssignmentControls
        selectedPattern={selectedPattern}
        onPatternSelect={(opt) => setSelectedPattern(opt as any)}
        patternOptions={patternOptions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        employeesCount={employeesCount}
        groupsCount={groupsCount}
        isLoading={isGlobalLoading}
      />

      {/* --- ۳. جدول داده‌ها --- */}
      {/* بهبود: اضافه کردن رنگ پس‌زمینه متفاوت در دارک مود برای تفکیک جدول از صفحه */}
      <div className="bg-backgroundL-500 border rounded-xl border-borderL dark:border-white/10 dark:bg-white/[0.02] min-h-[400px] flex flex-col shadow-sm overflow-hidden">
        {isGlobalLoading && (employeesCount === 0 && groupsCount === 0) ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3 text-muted-foregroundL dark:text-muted-foregroundD">
            <Loader2 className="h-8 w-8 animate-spin text-primaryL dark:text-primaryD" />
            <span>در حال دریافت اطلاعات...</span>
          </div>
        ) : (
          <>
            {activeTab === 'EMPLOYEES' ? (
              <>
                <div className="flex-1 overflow-x-auto">
                  <DataTable table={employeesTable} notFoundMessage="هیچ سربازی یافت نشد." isLoading={isGlobalLoading} />
                </div>
                <div className="p-2 border-t border-borderL dark:border-white/10 bg-secondaryL/5 dark:bg-white/[0.02]">
                  <DataTablePagination table={employeesTable} />
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-x-auto">
                  <DataTable table={workGroupsTable} notFoundMessage="هیچ گروه کاری یافت نشد." isLoading={isGlobalLoading} />
                </div>
                <div className="p-2 border-t border-borderL dark:border-white/10 bg-secondaryL/5 dark:bg-white/[0.02]">
                  <DataTablePagination table={workGroupsTable} />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* --- ۴. اکشن بار (فوتر) --- */}
      <div className="flex justify-between items-center pt-4 border-t border-borderL dark:border-white/10 sticky bottom-0 bg-backgroundL-500/95 backdrop-blur-md dark:bg-backgroundD/95 py-4 z-20 transition-all">
        <span className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD px-2 bg-secondaryL/20 dark:bg-white/5 py-1 rounded-md">
          {hasSelection
            ? `${activeTab === 'EMPLOYEES'
              ? employeesTable.getSelectedRowModel().flatRows.length
              : workGroupsTable.getSelectedRowModel().flatRows.length} مورد انتخاب شده`
            : 'موردی انتخاب نشده'}
        </span>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/work-patterns')}
            disabled={isGlobalLoading}
            className="dark:border-white/20 dark:hover:bg-white/10 dark:text-white"
          >
            انصراف
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedPattern || isGlobalLoading || !hasSelection}
            className="shadow-md shadow-primaryL/20 dark:shadow-none min-w-[140px]"
          >
            {isGlobalLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <UserPlus className="ml-2 h-4 w-4" />}
            تخصیص نهایی
          </Button>
        </div>
      </div>
    </div>
  );
}