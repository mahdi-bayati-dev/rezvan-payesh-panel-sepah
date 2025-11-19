// features/requests/components/mainRequests/RequestsFilter.tsx
import { useState, Fragment } from "react";
import { X, SlidersHorizontal, CirclePlus, Settings2 } from "lucide-react";
import { Link } from 'react-router-dom';
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";

// --- ایمپورت‌های ---
// import { useLeaveTypes } from '../../hook/useLeaveTypes';
// import { useOrganizations } from '@/features/Organization/hooks/useOrganizations'; // مسیر اصلاح شد
// import { type Organization } from '@/features/Organization/types/index';
import type { User } from '../../types'; // (اصلاح مسیر)
import { Dialog, Transition } from "@headlessui/react";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from "react-multi-date-picker";


/**
 * (تابع flattenOrganizations - فعلا کامنت شد چون استفاده نمی‌شود)
 */
/*
const flattenOrganizations = (
  orgs: Organization[],
  level = 0
): SelectOption[] => {
  let flatList: SelectOption[] = [];
  for (const org of orgs) {
    flatList.push({
      id: org.id,
      name: `${'— '.repeat(level)}${org.name}`,
    });
    if (org.children && org.children.length > 0) {
      flatList = flatList.concat(
        flattenOrganizations(org.children, level + 1)
      );
    }
    if (org.descendants && org.descendants.length > 0) {
      flatList = flatList.concat(
        flattenOrganizations(org.descendants, level + 1)
      );
    }
  }
  return flatList;
};
*/

// (تابع processLeaveTypes - فعلا کامنت شد)
/*
const processLeaveTypes = (types: LeaveType[]) => {
  const categories: SelectOption[] = [];
  const allTypes: SelectOption[] = [];
  types.forEach(category => {
    if (!category.parent_id) {
      categories.push({ id: category.id, name: category.name });
      allTypes.push({ id: category.id, name: category.name });
    }
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        allTypes.push({ id: child.id, name: `— ${child.name}` });
      });
    }
  });
  return { categories, allTypes };
};
*/


interface RequestsFilterProps {
  currentUser: User | null;
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

const mockStatuses: SelectOption[] = [
  { id: "pending", name: "در انتظار" },
  { id: "approved", name: "تایید شده" },
  { id: "rejected", name: "رد شده" },
];

const RequestsFilter = ({
  currentUser,
  // organization, // فعلا استفاده نمیشود
  // onOrganizationChange,
  // category,
  // onCategoryChange,
  // leaveType,
  // onLeaveTypeChange,
  status,
  onStatusChange,
  date,
  onDateChange,
}: RequestsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // --- بررسی دسترسی‌ها ---
  const canCreateRequest = !!currentUser?.employee;

  const isSuperAdmin = currentUser?.roles?.includes('super_admin') ?? false;
  // const isManager = isSuperAdmin ||
  //   (currentUser?.roles?.includes('org-admin-l2') ?? false) ||
  //   (currentUser?.roles?.includes('org-admin-l3') ?? false);


  // --- اتصال فیلترها به API ---
  
  /* TODO: این بخش‌ها به دلیل عدم پشتیبانی API فعلاً غیرفعال شدند.
    پس از پیاده‌سازی فیلترهای organization_id و leave_type_id در بک‌اند،
    این کدها را از کامنت خارج کنید.
  */

  /*
  // تنها در صورتی که مدیر باشد، به انواع مرخصی نیاز داریم.
  const { data: leaveTypesData, isLoading: isLoadingLeaveTypes } = useLeaveTypes({
    enabled: isManager,
  });

  // تنها در صورتی که مدیر باشد، به سازمان‌ها نیاز داریم.
  const { data: orgData, isLoading: isLoadingOrgs } = useOrganizations();

  const organizationOptions = useMemo(() => {
    if (!orgData) return [];
    return flattenOrganizations(orgData);
  }, [orgData]);

  const { categories: categoryOptions, allTypes: leaveTypeOptions } = useMemo(() => {
    if (!leaveTypesData) return { categories: [], allTypes: [] };
    return processLeaveTypes(leaveTypesData);
  }, [leaveTypesData]);
  */


  const filterContent = (
    <div className="flex flex-col gap-y-6 p-4 sm:p-6 bg-backgroundL-500 mx-auto dark:bg-backgroundD rounded-2xl border border-borderL dark:border-borderD h-fit">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-right text-foregroundL dark:text-foregroundD">
          فیلترها
        </h3>
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ۱. فیلترهای مدیریتی (فقط برای مدیران) - فعلا غیرفعال */}
      {/* {isManager && (
        <>
          <SelectBox
            label="سازمان"
            placeholder={isLoadingOrgs ? "درحال بارگذاری..." : "همه سازمان‌ها"}
            options={organizationOptions}
            value={organization || null}
            onChange={onOrganizationChange}
            disabled={isLoadingOrgs}
          />

          <SelectBox
            label="دسته بندی"
            placeholder={isLoadingLeaveTypes ? "درحال بارگذاری..." : "همه دسته‌بندی‌ها"}
            options={categoryOptions}
            value={category || null}
            onChange={onCategoryChange}
            disabled={isLoadingLeaveTypes}
          />

          <SelectBox
            label="نوع درخواست"
            placeholder={isLoadingLeaveTypes ? "درحال بارگذاری..." : "همه انواع"}
            options={leaveTypeOptions}
            value={leaveType || null}
            onChange={onLeaveTypeChange}
            disabled={isLoadingLeaveTypes}
          />
        </>
      )} */}
      
      {/* پیام موقت برای مدیران (اختیاری) */}
      {/* {isManager && (
          <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD bg-gray-100 dark:bg-zinc-800 p-2 rounded">
              فیلترهای پیشرفته به زودی فعال خواهند شد.
          </p>
      )} */}

      {/* ۲. فیلتر وضعیت (برای همه) */}
      <SelectBox
        label="وضعیت درخواست"
        placeholder="همه وضعیت‌ها"
        options={mockStatuses}
        value={status || null}
        onChange={onStatusChange}
      />

      {/* ۳. فیلتر تاریخ (برای همه) */}
      <PersianDatePickerInput
        value={date}
        onChange={onDateChange}
        label="تاریخ درخواست"
        placeholder="انتخاب تاریخ"
        inputClassName="py-2.5 pr-10 pl-3"
        containerClassName="w-full"
        title="این فیلتر تاریخ را در نتایج لود شده جستجو می‌کند."
      />

      {/* دکمه‌ها */}
      {canCreateRequest && (
        <Link
          to='/requests/new'
          className="bg-primaryL dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-primaryL/90 text-sm justify-center items-center"
        >
          <CirclePlus size={20} />
          ثبت درخواست جدید
        </Link>
      )}

      {isSuperAdmin && (
        <Link
          to='/requests/settings-table'
          className="bg-secondaryL dark:bg-secondaryD text-secondary-foregroundL dark:text-secondary-foregroundD px-4 py-2 rounded-xl transition-colors flex gap-1 cursor-pointer hover:bg-secondaryL/80 text-sm justify-center items-center"
        >
          <Settings2 size={20} />
          تنظیمات انواع درخواست
        </Link>
      )}

    </div>
  );

  return (
    <>
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          نمایش فیلترها
        </button>
      </div>
      <aside className="hidden md:flex md:w-64 lg:w-72 sticky top-4 self-start">
        {filterContent}
      </aside>
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50 md:hidden">
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
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-full opacity-0"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-backgroundL-500 dark:bg-backgroundD shadow-xl overflow-y-auto rounded-l-2xl p-4">
              {filterContent}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default RequestsFilter;