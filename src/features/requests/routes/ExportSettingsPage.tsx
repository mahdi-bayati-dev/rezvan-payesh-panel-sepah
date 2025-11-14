//  features/requests/routes/ExportSettingsPage.tsx


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, X } from 'lucide-react';
import Input from '@/components/ui/Input'; // استفاده از کامپوننت Input ماژولار

// کامپوننت داخلی برای Checkbox (می‌توانید به فایل جدا منتقل کنید)
const CheckboxItem = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-[color:var(--color-secondaryL)] dark:bg-[color:var(--color-secondaryD)]">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded text-primaryL focus:ring-primaryL dark:text-primaryD dark:focus:ring-primaryD" // استایل checkbox
    />
    <label htmlFor={id} className="text-sm font-medium text-secondary-foregroundL dark:text-secondary-foregroundD cursor-pointer">
      {label}
    </label>
  </div>
);

const ExportSettingsPage = () => {
  const navigate = useNavigate();

  // State های فرم تنظیمات
  const [reportTitle, setReportTitle] = useState('گزارش خلاصه ماهانه');
  const [exportDate, setExportDate] = useState('1404/05/30'); // (فرمت مطابق تصویر)
  const [exportTime, setExportTime] = useState('12:30');
  const [columnsToShow, setColumnsToShow] = useState({
    details: true,
    organization: true,
    category: true,
    logo: false, // لوگو به طور پیش‌فرض خاموش
  });

  // Handler برای Checkbox ها
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    setColumnsToShow(prev => ({ ...prev, [id]: checked }));
  };

  // Handler برای دکمه‌ها
  const handleExport = () => {
    console.log("تنظیمات انتخاب شده برای خروجی:", {
      title: reportTitle,
      date: exportDate,
      time: exportTime,
      columns: columnsToShow,
    });
    alert("خروجی در حال آماده‌سازی... (شبیه‌سازی)");
    // TODO: منطق واقعی خروجی گرفتن
  };

  const handleCancel = () => {
    navigate(-1); // بازگشت به صفحه قبل (صفحه جزئیات)
  };

  return (
    <div className="p-4 sm:p-6 bg-[color:var(--color-backgroundL-500)] dark:bg-[color:var(--color-backgroundD)] rounded-2xl shadow-sm max-w-5xl mx-auto"> {/* ✅ ریسپانسیو: padding مناسب و حداکثر عرض */}
      <h2 className="text-xl font-bold text-right mb-6 pb-4 border-b border-borderL dark:border-borderD dark:text-backgroundL-500">
        تنظیمات خروجی
      </h2>

      {/* ✅ ریسپانسیو: چیدمان اصلی در موبایل ۱ ستونه و در دسکتاپ ۳ ستونه */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ستون راست: تنظیمات اصلی */}
        <div className="md:col-span-2 flex flex-col gap-y-5">
          <Input
            label="عنوان گزارش"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="عنوان گزارش را وارد کنید"
          />
          {/* ✅ ریسپانسیو: تاریخ و ساعت در موبایل ۲ ستونه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="تاریخ"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              placeholder="YYYY/MM/DD"
            />
            <Input
              label="ساعت"
              value={exportTime}
              onChange={(e) => setExportTime(e.target.value)}
              placeholder="HH:mm"
            />
          </div>

          {/* بخش Checkbox ها */}
          <div>
            <label className="block text-sm font-medium text-right mb-2 text-foregroundL dark:text-foregroundD">
              نمایش ستون ها
            </label>
            {/* ✅ ریسپانسیو: چک‌باکس‌ها در موبایل ۲ ستونه و در لپ‌تاپ ۴ ستونه */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <CheckboxItem
                id="details"
                label="مشخصات"
                checked={columnsToShow.details}
                onChange={handleCheckboxChange}
              />
              <CheckboxItem
                id="organization"
                label="سازمان"
                checked={columnsToShow.organization}
                onChange={handleCheckboxChange}
              />
              <CheckboxItem
                id="category"
                label="دسته بندی"
                checked={columnsToShow.category}
                onChange={handleCheckboxChange}
              />
              <CheckboxItem
                id="logo"
                label="لوگو"
                checked={columnsToShow.logo}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>
        </div>

        {/* ستون چپ: گروه‌ها و دکمه‌ها */}
        <div className="flex flex-col justify-between gap-6 p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
          <div>
            <h3 className="text-lg font-bold text-right mb-4">گروه ها</h3>
            {/* TODO: لیست گروه‌ها را اینجا پیاده‌سازی کنید */}
            <p className="text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD">
              (بخش گروه‌ها در آینده اضافه می‌شود)
            </p>
          </div>
          <div className="flex gap-3">

            <button
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 bg-backgroundL-500 text-foregroundL dark:bg-backgroundD dark:text-foregroundD  py-2.5 rounded-xl text-sm font-medium border border-borderL dark:border-borderD hover:bg-destructiveL hover:text-backgroundL-500 cursor-pointer"
            >
              <X size={18} />
              لغو
            </button>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD px-16 py-2.5 rounded-xl text-sm font-medium hover:bg-successD-foreground cursor-pointer"
            >
              <Download size={18} />
              خروجی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettingsPage;