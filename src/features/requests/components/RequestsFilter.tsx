import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, SlidersHorizontal } from "lucide-react";
import { Fragment } from "react";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import {
  mockOrganizations,
  mockCategories,
  mockRequestTypes,
  mockStatuses,
} from "@/features/requests/data/mockData";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from "react-multi-date-picker";

interface RequestsFilterProps {
  organization: SelectOption | null;
  onOrganizationChange: (value: SelectOption | null) => void;

  category: SelectOption | null;
  onCategoryChange: (value: SelectOption | null) => void;

  requestType: SelectOption | null;
  onRequestTypeChange: (value: SelectOption | null) => void;

  status: SelectOption | null;
  onStatusChange: (value: SelectOption | null) => void;

  date: DateObject | null;
  onDateChange: (value: DateObject | null) => void;
}

const RequestsFilter = ({
  organization,
  onOrganizationChange,
  category,
  onCategoryChange,
  requestType,
  onRequestTypeChange,
  status,
  onStatusChange,
  date,
  onDateChange,
}: RequestsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

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

      <SelectBox
        label="سازمان"
        placeholder="انتخاب کنید"
        options={mockOrganizations}
        value={organization}
        onChange={onOrganizationChange}
      />

      <SelectBox
        label="دسته بندی"
        placeholder="انتخاب کنید"
        options={mockCategories}
        value={category}
        onChange={onCategoryChange}
      />

      <SelectBox
        label="نوع درخواست"
        placeholder="انتخاب کنید"
        options={mockRequestTypes}
        value={requestType}
        onChange={onRequestTypeChange}
      />

      <SelectBox
        label="وضعیت درخواست"
        placeholder="انتخاب کنید"
        options={mockStatuses}
        value={status}
        onChange={onStatusChange}
      />

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
        />
      </div>
    </div>
  );

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
