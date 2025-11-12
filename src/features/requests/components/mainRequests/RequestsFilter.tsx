// features/requests/components/mainRequests/RequestsFilter.tsx
import { useState } from "react";
import { X, SlidersHorizontal, CirclePlus, Settings2 } from "lucide-react"; // ✅ ایمپورت X وجود داشت، عالی
import { Link } from 'react-router-dom';
import { Fragment } from "react";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";

// ✅ ۱. ایمپورت هوک با مسیر صحیح
import { useLeaveTypes } from '@/features/requests/hook/useLeaveTypes';
import { Spinner } from "@/components/ui/Spinner";
import { Dialog, Transition } from "@headlessui/react";

// ✅ ۲. ایمپورت‌های مربوط به تاریخ (فقط یک بار)
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from "react-multi-date-picker";

// (اینترفیس پراپ‌ها - بدون تغییر)
interface RequestsFilterProps {
  organization: SelectOption | null;
  onOrganizationChange: (value: SelectOption | null) => void;
  category: SelectOption | null;
  onCategoryChange: (value: SelectOption | null) => void;
  leaveType: SelectOption | null;
  onLeaveTypeChange: (value: SelectOption | null) => void;
  status: SelectOption | null;
  onStatusChange: (value: SelectOption | null) => void;
  date: DateObject | null;
  onDateChange: (value: DateObject | null) => void;
}

// (داده‌های Mock - بدون تغییر)
const mockOrganizations: SelectOption[] = [
  { id: "org1", name: "سازمان الف" },
];
const mockCategories: SelectOption[] = [
  { id: "cat2", name: "مرخصی" },
];
const mockStatuses: SelectOption[] = [
  { id: "pending", name: "در انتظار" },
  { id: "approved", name: "تایید شده" },
  { id: "rejected", name: "رد شده" },
];

const RequestsFilter = ({
  organization,
  onOrganizationChange,
  category,
  onCategoryChange,
  leaveType,
  onLeaveTypeChange,
  status,
  onStatusChange,
  date,
  onDateChange,
}: RequestsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // (دریافت داده‌ها از هوک - بدون تغییر)
  const { data: leaveTypesData, isLoading: isLoadingLeaveTypes } = useLeaveTypes();

  // ✅✅✅ ۳. تعریف متغیر جا افتاده
  // تبدیل داده‌های درختی API به گزینه‌های SelectBox
  const leaveTypeOptions = leaveTypesData
    ? leaveTypesData.map(lt => ({ id: lt.id, name: lt.name })) // (نسخه ساده)
    : [];


  const filterContent = (
    <div className="flex flex-col gap-y-6 p-4 bg-backgroundL-500 mx-auto dark:bg-backgroundD rounded-2xl border border-borderL dark:border-borderD h-fit">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-right text-foregroundL dark:text-foregroundD">
          فیلتر
        </h3>
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* (سازمان - فعلاً Mock) */}
      <SelectBox
        label="سازمان"
        placeholder="انتخاب کنید"
        options={mockOrganizations}
        value={organization}
        onChange={onOrganizationChange}
      />

      {/* (دسته‌بندی - فعلاً Mock) */}
      <SelectBox
        label="دسته بندی"
        placeholder="انتخاب کنید"
        options={mockCategories}
        value={category}
        onChange={onCategoryChange}
      />

      {/* (اتصال SelectBox "نوع درخواست" به API - حالا درست کار می‌کند) */}
      <SelectBox
        label="نوع درخواست (مرخصی)"
        placeholder={isLoadingLeaveTypes ? "درحال بارگذاری..." : "انتخاب کنید"}
        options={leaveTypeOptions} // <-- حالا این متغیر تعریف شده است
        value={leaveType}
        onChange={onLeaveTypeChange}
        disabled={isLoadingLeaveTypes}
      />
      {isLoadingLeaveTypes && <Spinner size="sm" />}

      {/* (وضعیت - Mock اما مقادیر آپدیت شده) */}
      <SelectBox
        label="وضعیت درخواست"
        placeholder="انتخاب کنید"
        options={mockStatuses}
        value={status}
        onChange={onStatusChange}
      />

      {/* (تاریخ - بدون تغییر) */}
      <div>
        <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">
          تاریخ درخواست
        </label>
        <PersianDatePickerInput
          value={date}
          onChange={onDateChange}
          placeholder="انتخاب کنید"
          inputClassName="py-2.5 pr-10 pl-3"
          containerClassName="w-full"
          label="تاریخ" // (این پراپ در کامپوننت شما وجود دارد؟)
        />
      </div>

      {/* (دکمه‌ها - بدون تغییر - کلاس‌های ... را بعداً تکمیل کنید) */}
      <Link to='/requests/new' className="bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-blue hover:text-backgroundL-500 text-sm justify-center">
        <CirclePlus size={20} /> درخواست جدید
      </Link>
      <Link
        to='/requests/settings-table'
        className="bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-blue hover:text-backgroundL-500 text-sm justify-center"
      >
        <Settings2 size={20} /> تنظیمات
      </Link>

    </div>
  );

  // (بقیه کامپوننت - بدون تغییر)
  return (
    <>
      {/* دکمه برای موبایل */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          نمایش فیلترها
        </button>
      </div>

      {/* فیلتر ثابت در دسکتاپ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 sticky ">
        {filterContent}
      </aside>

      {/* Drawer برای موبایل با انیمیشن نرم */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* بک‌گراند محو */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          {/* اسلاید نرم از سمت راست */}
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-full opacity-0"
          >
            <div className="fixed inset-y-0 right-0 w-5/6 max-w-sm bg-backgroundL-500 dark:bg-backgroundD shadow-xl p-4 overflow-y-auto rounded-l-2xl">
              {filterContent}
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default RequestsFilter;