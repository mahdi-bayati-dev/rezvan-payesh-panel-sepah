import { type DriveStep } from "driver.js";

/**
 * تنظیمات گام‌های آموزشی پنل مدیریتی
 * توسعه‌دهنده: مهدی بیاتی
 * ویژگی‌ها: متون غنی، آیکون‌های Lucide و چیدمان استاندارد
 */

export const TOUR_STEPS: Record<string, DriveStep[]> = {
  "/dashboard": [
    // تنظیمات راهنمای بخش پیشخوان (Dashboard Tour)
    {
      element: "#stats-cards-area",
      popover: {
        title: "📊 تحلیل وضعیت لحظه‌ای نیروی انسانی",
        description: `
      <div class="space-y-4 text-justify leading-relaxed">
        <p>در این بخش، <b>دید ۳۶۰ درجه</b> از وضعیت حضور و غیاب پرسنل در لحظه حاضر را مشاهده می‌کنید:</p>
        
        <ul class="list-none p-0 space-y-2 text-sm">
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <b>حاضرین امروز:</b> تعداد افرادی که ورود آن‌ها در سامانه ثبت شده است.
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
            <b>تاخیرها و تعجیل‌ها:</b> شناسایی دقیق افرادی که خارج از بازه استاندارد تردد داشته‌اند.
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <b>غایبین / بدون شیفت:</b> افرادی که وضعیت تردد آن‌ها با برنامه کاری مطابقت ندارد.
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <b>کل پرسنل:</b> مجموع ظرفیت نیروی انسانی تحت مدیریت شما.
          </li>
        </ul>

        <hr class="border-gray-200 my-2" />

        <div class="bg-blue-50 p-2 rounded-md border-r-4 border-blue-400">
          <p class="text-xs text-blue-800">
             <b>💡 نکته مدیریتی:</b> با استفاده از دکمه <span class="font-bold">"بروزرسانی نمودار"</span>، می‌توانید آخرین داده‌های دریافتی از دستگاه‌های حضور و غیاب را بدون نیاز به رفرش صفحه، در نمودار زیرین همگام‌سازی کنید.
          </p>
        </div>
      </div>
    `,
        side: "bottom",
        align: "start",
      },
    },
    // تحلیل بصری و نمودار آماری
    {
      element: "#main-attendance-chart",
      popover: {
        title: "📈 تحلیل استراتژیک و پایش روندها",
        description: `
      <div class="space-y-3 text-justify">
        <p>این نمودار، <b>تفسیر بصری داده‌های خام</b> است. شما در اینجا می‌توانید نوسانات حضور و غیاب را در بازه‌های زمانی مختلف رصد کنید.</p>
        
        <div class="grid grid-cols-1 gap-2 mt-3">
          <div class="flex items-start gap-2 text-sm">
            <span class="mt-1 text-blue-600">●</span>
            <span><b>شناسایی الگوها:</b> تشخیص زمان‌های اوج ورود و خروج برای مدیریت بهتر ترافیک انسانی.</span>
          </div>
          <div class="flex items-start gap-2 text-sm">
            <span class="mt-1 text-blue-600">●</span>
            <span><b>پایش لحظه‌ای:</b> همگام‌سازی مستقیم با خروجی دستگاه‌های ثبت تردد.</span>
          </div>
        </div>

        <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p class="text-xs text-gray-600">
            <i class="opacity-70">نکته:</i> اگر نمودار خالی است، از دکمه <b>"بروزرسانی نمودار"</b> در سمت چپ استفاده کنید
          </p>
        </div>
      </div>
    `,
        side: "top",
        align: "center",
      },
    },
  ],

  "/my-profile": [
    {
      element: "#profile-info-card",
      popover: {
        title: "👤 مرکز مدیریت حساب",
        description: `
          <p>تمام اطلاعات هویتی، اسناد احراز هویت و تنظیمات امنیتی شما در این بخش متمرکز شده است. اطمینان حاصل کنید که <b>تاییدیه دو مرحله‌ای</b> شما فعال باشد.</p>
        `,
        side: "bottom",
        align: "center",
      },
    },
  ],

  // تنظیمات راهنمای بخش مدیریت درخواست‌ها
  "/requests": [
    // مرحله اول: پنل فیلترینگ و تنظیمات پایه
    {
      element: "#filter-sidebar",
      popover: {
        title: "🔍 جستجو و مدیریت دسته‌بندی‌ها",
        description: `
        <div class="space-y-3 text-justify leading-relaxed text-gray-700">
          <p>در این بخش می‌توانید با فیلترهای هوشمند، سریع‌تر به درخواست مورد نظر برسید. امکان تفکیک بر اساس <b>وضعیت</b> و <b>بازه زمانی</b> فراهم شده است.</p>
          
          <div class="bg-blue-50 border-r-4 border-blue-500 p-3 rounded-l-lg shadow-sm">
            <div class="flex items-center gap-2 mb-1 text-blue-800 font-bold text-sm">
              <span>⚙️ تنظیمات پیشرفته:</span>
            </div>
            <p class="text-xs text-blue-700 leading-5">
              با کلیک روی دکمه <b>"تنظیمات"</b>، ساختار اصلی درخواست‌ها شامل گروه‌ها و زیرمجموعه‌ها را تعریف یا ویرایش کنید.
            </p>
          </div>
        </div>
      `,
        side: "right",
        align: "start",
      },
    },

    // مرحله دوم: کارت اصلی و مدیریت لیست
    {
      element: "#requests-main-card",
      popover: {
        title: "📋 پایش هوشمند درخواست‌ها",
        description: `
        <div class="space-y-4">
          <p class="text-gray-600 text-sm leading-6">تمامی درخواست‌های ثبت شده توسط کاربران در این جدول قابل مشاهده هستند. برای درک بهتر وضعیت، به رنگ‌ها توجه کنید:</p>
          
          <div class="grid grid-cols-2 gap-2 text-xs font-medium">
            <div class="flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded border border-amber-100">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              در انتظار بررسی
            </div>
            <div class="flex items-center gap-2 p-2 bg-rose-50 text-rose-700 rounded border border-rose-100">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              رد شده
            </div>
          </div>

          <div class="flex items-start gap-2 bg-gray-50 p-2 rounded text-xs text-gray-500">
            <span class="mt-0.5">💡</span>
            <span>با کلیک روی سرستون‌ها، می‌توانید لیست را بر اساس اولویت خود مرتب‌سازی کنید.</span>
          </div>
        </div>
      `,
        side: "bottom",
        align: "center",
      },
    },

    // مرحله سوم: خروجی گرفتن و گزارش‌دهی (بر اساس تصویر دکمه اکسل بالای جدول)
    {
      element: "#export-excel-btn",
      popover: {
        title: "📊 خروجی هوشمند اکسل",
        description: `
        <div class="space-y-3 text-gray-700">
          <p class="text-sm leading-relaxed">با استفاده از این قابلیت، می‌توانید یک گزارش دقیق و طبقه‌بندی شده از تمامی درخواست‌های موجود در جدول (بر اساس فیلترهای اعمال شده) دریافت کنید.</p>
          
          <div class="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-700 font-medium">
            <span class="text-lg">📥</span>
            <span>خروجی شامل تمامی فیلدها، وضعیت‌ها و زمان ثبت درخواست است.</span>
          </div>
          
          <p class="text-[11px] text-gray-400 italic font-light">نکته: فایل اکسل دریافتی مستقیماً برای نرم‌افزارهای حسابداری و آفیس بهینه شده است.</p>
        </div>
      `,
        side: "bottom",
        align: "end",
      },
    },

    // مرحله چهارم: عملیات تکی بر روی هر درخواست
    {
      element: ".action-menu-trigger",
      popover: {
        title: "🛠 مدیریت و پاسخگویی",
        description: `
        <div class="space-y-3">
          <p class="text-sm leading-6">در انتهای هر ردیف با کلیک روی منوی <b class="text-lg">⋮</b> می‌توانید:</p>
          <ul class="space-y-2 text-xs">
            <li class="flex items-center gap-2 text-gray-700">
              <span class="p-1 bg-blue-100 text-blue-600 rounded">👁️</span> 
              <b>مشاهده جزئیات:</b> بررسی متن کامل و پیوست‌ها.
            </li>
            <li class="flex items-center gap-2 text-gray-700">
              <span class="p-1 bg-emerald-100 text-emerald-600 rounded">✔️</span> 
              <b>تایید یا رد:</b> تعیین وضعیت نهایی درخواست.
            </li>
            <li class="flex items-center gap-2 text-gray-700">
              <span class="p-1 bg-rose-100 text-rose-600 rounded">🗑️</span> 
              <b>حذف:</b> پاک کردن رکوردهای اضافی.
            </li>
          </ul>
        </div>
      `,
        side: "left",
        align: "center",
      },
    },
  ],
  "/requests/:id": [
    // گام اول: خلاصه وضعیت و اطلاعات پایه
    {
      element: "#request-header-card", // آیدی کارت بالایی شامل نام کاربر و نوع درخواست
      popover: {
        title: "👤 شناسنامه درخواست",
        description: `
        <div class="space-y-3 text-gray-700">
          <p class="text-sm leading-6">در این بخش، مشخصات فردی متقاضی، <b>نوع درخواست</b> (مرخصی، ماموریت و ...) و اولویت آن را مشاهده می‌کنید.</p>
          <div class="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 font-medium">
            <span>ℹ️</span>
            <span>همه جزییات در خواست و درخواست کننده رو میتوانید ببینید در اینجا</span>
          </div>
        </div>
      `,
        side: "bottom",
        align: "start",
      },
    },

    // گام دوم: شرح و مستندات
    {
      element: "#request-content-area", // بخش توضیحات متنی درخواست
      popover: {
        title: "📝 جزئیات و دلایل",
        description: `
        <div class="space-y-3">
          <p class="text-sm text-gray-600">علت ثبت درخواست و توضیحات تکمیلی کاربر در  قسمت </b><b> توضیحات درج شده است</p>
        </div>
      `,
        side: "top",
        align: "center",
      },
    },

    // گام سوم: خط زمان و جریان تایید (Timeline)
    {
      element: "#request-timeline", // بخشی که نشان می‌دهد درخواست دست چه کسانی بوده
      popover: {
        title: "⏳ گردش کار (Workflow)",
        description: `
        <div class="space-y-3">
          <p class="text-sm text-gray-700 leading-relaxed">درخواست‌ها در سازمان شما یک مسیر تایید را طی می‌کنند. اینجا می‌توانید ببینید درخواست در چه مرحله‌ای است:</p>
          <ul class="space-y-2 text-[11px]">
            <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500"></span> تایید شده توسط مدیر مستقیم</li>
            <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> در انتظار بررسی منابع انسانی</li>
          </ul>
        </div>
      `,
        side: "right",
        align: "start",
      },
    },

    // گام چهارم: پنل عملیات نهایی
    {
      element: "#request-actions-panel", // دکمه‌های تایید، رد و ثبت نظر
      popover: {
        title: "⚖️ تصمیم‌گیری نهایی",
        description: `
        <div class="space-y-4">
          <p class="text-sm text-gray-700">اکنون نوبت شماست! می‌توانید با استفاده از دکمه‌های زیر عمل کنید:</p>
          
          <div class="grid grid-cols-1 gap-2">
            <div class="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded text-xs">
              <b>✅ تایید:</b> تایید درخواست و ارجاع به مرحله بعد.
            </div>
            <div class="flex items-center gap-2 p-2 bg-rose-50 text-rose-700 rounded text-xs">
              <b>❌ رد درخواست:</b> رد کردن با امکان درج دلیل (جهت اطلاع کاربر).
            </div>
          </div>

          <div class="p-2 bg-gray-100 rounded text-[11px] text-gray-500 italic">
            نکته: پس از ثبت نظر، سیستم به صورت خودکار از طریق نوتیفیکیشن یا پیامک به کاربر اطلاع‌رسانی می‌کند.
          </div>
        </div>
      `,
        side: "left",
        align: "center",
      },
    },
  ],
  // --- بخش جدید: تنظیمات ساختار درخواست‌ها ---
  "/requests/settings-table": [
    {
      element: "#settings-table-container",
      popover: {
        title: "⚙️ پیکربندی زیرساخت درخواست‌ها",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p>این صفحه قلب تپنده بخش درخواست‌هاست. شما در اینجا <b>منطق و انواع مرخصی‌ها یا ماموریت‌های</b> مجاز در سازمان را تعریف می‌کنید.</p>
            <div class="p-2 bg-amber-50 border-r-4 border-amber-400 text-xs text-amber-800">
              تغییر در این بخش مستقیماً روی فرم‌های ثبت درخواست تمامی پرسنل تاثیر می‌گذارد.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#add-new-category-btn",
      popover: {
        title: "➕ افزودن ریشه جدید",
        description: `
          <div class="space-y-2 text-sm text-gray-700">
            <p>برای ایجاد یک دسته اصلی (مثلاً <b>"مرخصی"</b> یا <b>"خدمات فنی"</b>) از این دکمه استفاده کنید.</p>
            <p class="text-xs text-blue-600 italic">پس از ایجاد، می‌توانید بی‌نهایت زیرمجموعه برای آن تعریف کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: ".main-category-row", // کلاسی برای سطرهای اصلی جدول
      popover: {
        title: "📂 مدیریت دسته‌بندی‌های اصلی",
        description: `
          <p class="text-sm leading-6">هر سطر نمایانگر یک گروه اصلی است. شما می‌توانید تعداد <b>زیرمجموعه‌های فعال</b> و وضعیت نمایش آن‌ها را در یک نگاه بررسی کنید.</p>
        `,
        side: "top",
        align: "start",
      },
    },
    {
      element: ".manage-sub-items-btn", // دکمه مدیریت زیرمجموعه‌ها در هر سطر
      popover: {
        title: "🔗 هر ایتم ریشه مثل (استعلاجی)",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 leading-6">با کلیک روی هر ایتم، وارد لایه دوم تنظیمات می‌شوید تا مواردی مثل <b>"استحقاقی"</b>، <b>"استعلاجی"</b> یا <b>"بدون حقوق"</b> را ذیل عنوان اصلی تعریف کنید.</p>
            <div class="flex items-center gap-2 p-2 bg-indigo-50 rounded text-[11px] text-indigo-700 border border-indigo-100">
              <span>💡</span>
              <span>دقت کنید که تنظیمات قوانین (مثل سقف مجاز) در سطح زیرمجموعه‌ها اعمال می‌شود.</span>
            </div>
          </div>
        `,
        side: "right",
        align: "center",
      },
    },
    {
      element: ".settings-action-group", // گروه دکمه‌های ویرایش و حذف
      popover: {
        title: "🛠 عملیات ویرایشی",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700">کنترل کامل روی عناوین در دستان شماست:</p>
            <ul class="space-y-2 text-xs">
              <li class="flex items-center gap-2 text-blue-600 font-bold">
                <span>✏️</span> ویرایش: تغییر نام یا اصلاح تنظیمات سیستمی.
              </li>
              <li class="flex items-center gap-2 text-rose-600 font-bold">
                <span>🗑️</span> حذف: پاک کردن دسته (تنها در صورتی که درخواستی با این عنوان ثبت نشده باشد).
              </li>
            </ul>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
  ],

  "/requests/new": [
    {
      element: "#request-form-container",
      popover: {
        title: "📝 جزئیات درخواست جدید",
        description: `
          <p>دقت در انتخاب <b>نوع مرخصی (استحقاقی/استعلاجی)</b> و بازه زمانی، به سیستم کمک می‌کند تا مانده مرخصی شما را دقیق‌تر محاسبه کرده و فرآیند تایید را تسریع بخشد.</p>
        `,
        side: "right",
        align: "start",
      },
    },
  ],

  "/reports": [
    {
      element: "#report-filter-sidebar",
      popover: {
        title: "🎯 شخصی‌سازی هوشمند گزارش",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">برای رسیدن به دیتای دقیق، ابتدا باید محدوده خود را مشخص کنید. شما می‌توانید بر اساس ، <b>شخص خاص</b> یا <b>بازه زمانی</b> (روز، ماه، سال) لیست را محدود کنید.</p>
            <div class="p-2 bg-blue-50 border-r-4 border-blue-500 rounded text-[11px] text-blue-800">
              <b>نکته:</b> فیلتر کردن   به شما در شناسایی سریع ناهماهنگی‌ها کمک می‌کند.
            </div>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#report-summary-widgets", // آیدی مربوط به باکس‌های خلاصه بالای گزارش (اگر وجود دارد)
      popover: {
        title: "📊 پیش‌نمایش آماری",
        description: `
          <div class="space-y-2">
            <p class="text-sm text-gray-600 font-medium">قبل از بررسی تک‌تک رکوردها، در این بخش مجموع <b>ساعات کارکرد</b>، <b>اضافه‌کاری</b> و <b>تاخیرات</b> کل بازه انتخابی را به صورت یکجا مشاهده می‌کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#attendance-main-table",
      popover: {
        title: "📑 جدول پایش دقیق تردد",
        description: `
          <div class="space-y-4">
            <p class="text-sm text-gray-700 leading-6">در این جدول، جزئی‌ترین اطلاعات هر تردد ثبت شده است. به ستون‌های زیر توجه ویژه داشته باشید:</p>
            <div class="grid grid-cols-1 gap-2 text-xs">
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 dark:text-backgroundD">
                <span class="text-indigo-500 font-bold">⏱️ ورود و خروج:</span> ثبت شده توسط دستگاه یا اپلیکیشن.
              </div>
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 dark:text-backgroundD">
                <span class="text-rose-500 font-bold">🚨 تاخیر/تعجیل:</span> محاسبات خودکار بر اساس شیفت کاری تعریف شده.
              </div>
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 dark:text-backgroundD">
                <span class="text-emerald-500 font-bold">💼 کارکرد خالص:</span> مجموع حضور مفید پرسنل در سازمان.
              </div>
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: ".status-cell-highlight",
      popover: {
        title: "💡 مدیریت و موجه‌سازی ترددهای خاص",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <p class="text-sm text-gray-700 italic">سیستم به صورت هوشمند ترددهای ناقص یا دارای تاخیر را با رنگ‌های متمایز نشان می‌دهد.</p>
            
            <div class="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded-l-lg shadow-sm">
              <div class="flex items-center gap-2 mb-1 text-emerald-800 font-bold text-xs">
                <span>✅ تایید و موجه‌سازی:</span>
              </div>
              <p class="text-[11px] text-emerald-700 leading-5">
                شما می‌توانید با کلیک روی <b>دکمه تایید</b> یا از طریق <b>منوی سه نقطه (⋮)</b>، تاخیر یا تعجیل‌های ثبت شده را <b>موجه</b> کنید. 
              </p>
            </div>

            <div class="flex items-start gap-2 bg-indigo-50 p-2 rounded text-[11px] text-indigo-700 border border-indigo-100">
              <span>💎</span>
              <span>با انجام این کار، در گزارش نهایی برای فرد "تأخیر" محاسبه نمی‌شود و وضعیت تردد به "تأیید شده" تغییر می‌یابد.</span>
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
    {
      element: "#export-report-btn",
      popover: {
        title: "📥 خروجی (اکسل)",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700">گزارش شما آماده است! با کلیک روی این دکمه، فایل اکسل حاوی تمامی محاسبات را برای <b>سیستم حسابداری</b> یا <b>بایگانی اداری</b> دریافت کنید.</p>
            <div class="bg-emerald-50 p-2 rounded border border-emerald-100 text-[11px] text-emerald-700">
               خروجی اکسل دقیقاً مطابق با فیلترهای اعمال شده در مرحله اول تولید می‌شود.
            </div>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
  ],
  "/reports/new": [
    {
      element: "#manual-entry-form-container",
      popover: {
        title: "✍️ ثبت دستی و اصلاح تردد",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">ممکن است کارمندی فراموش کند تردد خود را ثبت کند یا دستگاه دچار اختلال شود. در این صفحه، شما می‌توانید به عنوان <b>مدیر سیستم</b>، رکوردهای حضور و غیاب را به صورت دستی اضافه یا اصلاح کنید.</p>
            <div class="p-2 bg-rose-50 border-r-4 border-rose-500 rounded text-[11px] text-rose-800 font-medium">
              <b>توجه:</b> تمام ترددهای ثبت شده در این بخش، با برچسب "ثبت توسط مدیر" در گزارش‌ها متمایز می‌شوند.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#employee-select-field",
      popover: {
        title: "👤 انتخاب کارمند",
        description: `
          <div class="space-y-2">
            <p class="text-sm text-gray-700">ابتدا فرد مورد نظر را از لیست پرسنل انتخاب کنید. می‌توانید از قابلیت <b>جستجوی سریع</b> بر اساس نام یا کد پرسنلی استفاده کنید.</p>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#attendance-datetime-picker",
      popover: {
        title: "⏰ تعیین دقیق زمان",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 leading-relaxed">تاریخ و ساعت دقیق تردد را مشخص کنید. دقت در این بخش بسیار حیاتی است، زیرا مستقیماً در محاسبات <b>تاخیر، تعجیل و اضافه‌کاری</b> تاثیر می‌گذارد.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#entry-type-toggle", // بخش انتخاب ورود یا خروج
      popover: {
        title: "🔄 نوع تردد",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700">مشخص کنید که این رکورد مربوط به <b>ورود</b> است یا <b>خروج</b>. انتخاب اشتباه در این بخش باعث ایجاد اختلال در تراز کارکرد روزانه می‌شود.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#entry-reason-textarea",
      popover: {
        title: "📝 درج دلیل و مستندات",
        description: `
          <div class="space-y-2 text-sm text-gray-700">
            <p>علت ثبت دستی تردد را بنویسید (مثلاً: خرابی دستگاه، ماموریت خارج از شرکت). این توضیحات در <b>حسابرسی‌های اداری</b> بسیار کاربردی خواهد بود.</p>
          </div>
        `,
        side: "left",
        align: "start",
      },
    },
    {
      element: "#submit-manual-entry-btn",
      popover: {
        title: "🚀 نهایی‌سازی و ثبت",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 font-bold">پس از بررسی نهایی اطلاعات، دکمه ثبت را بزنید.</p>
            <div class="bg-indigo-50 p-2 rounded border border-indigo-100 text-[11px] text-indigo-700 italic leading-5">
              رکورد بلافاصله در کارت تردد کارمند اعمال شده و محاسبات کارکرد ماهانه به‌روزرسانی می‌گردد.
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۱. صفحه اصلی مدیریت الگوها
  // ۱. صفحه اصلی مدیریت الگوها (لیست ترکیبی)
  "/work-patterns": [
    {
      element: "#work-patterns-list-container",
      popover: {
        title: "📋 لیست الگوهای کاری و برنامه‌های شیفتی",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p>در این بخش، تمام <b>الگوهای ثابت هفتگی</b> و <b>برنامه‌های شیفتی (چرخشی)</b> تعریف شده در سازمان را مشاهده می‌کنید.</p>
            <div class="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 font-medium">
              <span>💡</span>
              <span>الگوهای ثابت با آیکون تقویم و برنامه‌های شیفتی با آیکون چرخش متمایز شده‌اند.</span>
            </div>
          </div>
        `,
        side: "left",
        align: "start",
      },
    },
    {
      element: "#add-pattern-btn",
      popover: {
        title: "➕ دکمه ایجاد الگوی جدید",
        description: `
          <p class="text-sm leading-6">برای تعریف یک ساختار زمانی جدید (مثلاً شیفت نگهبانی، پرستاری یا ساعات اداری)، از این دکمه شروع کنید.</p>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#assign-bulk-btn",
      popover: {
        title: "👥 دکمه تخصیص به کاربران",
        description: `
          <p class="text-sm leading-6 text-justify">نیاز دارید یک الگو را به <b>ده‌ها کارمند</b> یا یک <b>گروه کاری</b> به صورت همزمان متصل کنید؟ این دکمه میانبر شما برای مدیریت انبوه است.</p>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#work-pattern-visual-view",
      popover: {
        title: "🎨 شماتیک گرافیکی الگو",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6">این بخش <b>تفسیر بصری</b> الگوی انتخابی شماست. قبل از تخصیص به پرسنل، می‌توانید توالی روزهای کاری، تعطیلات و هم‌پوشانی ساعات را روی خط زمان رصد کنید.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#pattern-actions-sidebar",
      popover: {
        title: "🛠️ پنل عملیات مدیریت",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 font-medium">ابزارهای مدیریتی الگو در اینجا متمرکز شده‌اند:</p>
            <div class="grid grid-cols-1 gap-2 text-[11px]">
              <div class="p-2 bg-gray-50 rounded"><b>✏️ ویرایش الگو:</b> اصلاح زمان‌بندی و تنظیمات سیستمی.</div>
              <div class="p-2 bg-gray-50 rounded"><b>👥 مدیریت کارمندان:</b> پایش لیست دقیق پرسنل متصل به این الگو.</div>
              <div class="p-2 bg-gray-50 rounded"><b>❌ حذف الگو</b> اگر ان الکو که قصد حذف ان را دارید کارمندانی داشته باشد باید ابتدا ان ها را منتقل کنید و سپس ان الگو را حذف کنید</div>
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
    // گام جدید اضافه شده برای تولید اتوماتیک شیفت
    {
      element: ".generate-shifts-btn-wrapper", // فرض بر اینکه دکمه تولید شیفت این کلاس را دارد یا از آیدی مرتبط استفاده شده
      popover: {
        title: "⚙️ دکمه تولید اتوماتیک شیفت‌ها",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6">یک قابلیت استراتژیک! اگر الگوی انتخابی شما از نوع <b>«برنامه شیفتی»</b> باشد، این گزینه ظاهر می‌شود.</p>
            <div class="p-3 bg-amber-50 border-r-4 border-amber-500 rounded text-xs text-amber-900 leading-5">
              با کلیک روی این دکمه، می‌توانید برای یک <b>بازه زمانی مشخص</b> (مثلاً یک ماه آینده)، تقویم کاری تمام کارمندانی که به این شیفت متصل هستند را به صورت خودکار تولید و رزرو کنید.
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
  ],

  // ۲. صفحه انتخاب نوع الگو
  "/work-patterns/new-work-patterns": [
    {
      element: "#pattern-type-selector",
      popover: {
        title: "🎭 انتخاب نوع ساختار زمانی",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm leading-7">سازمان شما از چه نوع نظمی پیروی می‌کند؟</p>
            <div class="space-y-2">
              <div class="p-3 border rounded-xl border-blue-200 bg-blue-50 text-xs text-blue-800">
                <b>۱. الگوی هفتگی ثابت:</b> برای پرسنلی که روزهای کاری و تعطیل آن‌ها در هفته تکرار می‌شود (مثل بخش اداری).
              </div>
              <div class="p-3 border rounded-xl border-purple-200 bg-purple-50 text-xs text-purple-800">
                <b>۲. برنامه شیفتی چرخشی:</b> برای شیفت‌های پیچیده مثل ۱۲-۲۴، ۲۴-۴۸ یا چرخه‌های چند هفته‌ای (مثل نگهبانی و پرستاری).
              </div>
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
  ],

  // ۳. مدیریت و ویرایش برنامه شیفتی (مدیریت چرخه و تولید)
  "/shift-schedules/edit/:id": [
    {
      element: "#settings-table-container", // محفظه اصلی جدول اسلات‌ها
      popover: {
        title: "📅 مدیریت ساختار چرخه (Slots)",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">در این جدول، <b>توالی روزهای چرخه</b> را تعریف می‌کنید. هر ردیف نشان‌دهنده یک روز از چرخه است (مثلاً در چرخه ۳ روزه: روز اول کار، روز دوم کار، روز سوم استراحت).</p>
            <div class="p-2 bg-indigo-50 border-r-4 border-indigo-400 text-[11px] text-indigo-800">
              با کلیک روی آیکون ویرایش در هر ردیف، می‌توانید نوع الگو یا ساعات شروع و پایان آن روز خاص را تغییر دهید.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#general-settings-sidebar", // سایدبار تنظیمات عمومی
      popover: {
        title: "⚙️ تنظیمات عمومی و مبدا تاریخ",
        description: `
          <div class="space-y-3 text-justify text-sm text-gray-700">
            <p><b>مبدا تاریخ چرخه:</b> این تاریخ بسیار مهم است! سیستم از این روز شروع به شمردن روزهای چرخه می‌کند تا بفهمد امروز برای پرسنل روز چندم چرخه است.</p>
            <p><b>نادیده گرفتن تعطیلات:</b> اگر تیک این گزینه فعال باشد، تعطیلات رسمی تقویم تاثیری روی چرخه ندارند (مناسب برای شیفت‌های ۲۴/۷).</p>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#floating-settings-card",
      popover: {
        title: "⏱️ آستانه شناوری (Floating Time)",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-indigo-900 leading-6 text-justify">در اینجا میزان <b>گذشت مجاز</b> را برای ورود و خروج تعیین کنید. اگر فردی کمتر از این مقدار تاخیر داشته باشد، سیستم کسر کار محاسبه نمی‌کند.</p>
            <div class="bg-amber-50 p-2 rounded text-[10px] text-amber-800 border border-amber-100">
              نکته: اگر تاخیر از این مقدار بیشتر شود، کل زمان تاخیر در گزارش‌ها ثبت خواهد شد.
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#generate-shifts-action-card", // کارت دکمه تولید شیفت
      popover: {
        title: "🚀 دکمه تولید و زمان‌بندی شیفت‌ها",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 font-bold leading-6">مهم‌ترین گام! پس از تعریف چرخه، باید آن را به تقویم واقعی تبدیل کنید.</p>
            <p class="text-xs text-gray-600">با کلیک روی این دکمه و انتخاب بازه زمانی (مثلاً ماه آینده)، سیستم به صورت خودکار برای تمامی پرسنل متصل، شیفت‌های کاری را در دیتابیس ایجاد می‌کند.</p>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
    {
      element: "#generated-shifts-list-section", // بخش لیست شیفت‌های تولید شده
      popover: {
        title: "📑 تقویم کاری تولید شده",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700">در اینجا می‌توانید نتیجه نهایی تولید شیفت‌ها را مشاهده کنید. این همان دیتایی است که در <b>گزارش‌های تردد</b> و <b>محاسبات حقوق</b> ملاک قرار می‌گیرد.</p>
            <p class="text-[11px] text-blue-600 italic">نکته: روزهای "OFF" با رنگ متمایز در لیست مشخص شده‌اند.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۴. مدیریت کارمندان یک الگو (روت داینامیک)
  "/work-patterns/employees/:type/:id": [
    {
      element: "#assigned-employees-table",
      popover: {
        title: "✅ لیست کارمندان متصل",
        description: `
          <p class="text-sm leading-7 text-justify">در این جدول، افرادی را می‌بینید که هم‌اکنون از این الگو استفاده می‌کنند. محاسبات حضور و غیاب این افراد دقیقاً طبق قوانین این الگو انجام می‌شود.</p>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#available-employees-table",
      popover: {
        title: "➕ افزودن کارمند جدید",
        description: `
          <p class="text-sm leading-7 text-justify">سایر پرسنل سازمان در اینجا هستند. می‌توانید با جستجوی نام یا کد پرسنلی، آن‌ها را یافته و با یک کلیک به این الگوی کاری متصل کنید.</p>
        `,
        side: "left",
        align: "start",
      },
    },
  ],

  // ۵. تخصیص گروهی (Bulk Assignment)
  "/work-patterns/assign": [
    {
      element: "#pattern-selector-dropdown",
      popover: {
        title: "۱. انتخاب الگوی هدف",
        description: `<p class="text-sm">ابتدا مشخص کنید قصد دارید افراد یا گروه‌ها را به کدام الگو متصل کنید.</p>`,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#assignment-tabs",
      popover: {
        title: "۲. تعیین نوع تخصیص",
        description: `<p class="text-sm leading-6">بین <b>کارمندان (انفرادی)</b> یا <b>گروه‌های کاری (دپارتمانی)</b> جابجا شوید و موارد مورد نظر را انتخاب کنید.</p>`,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#finalize-assignment-btn",
      popover: {
        title: "🚀 دکمه ثبت و تخصیص نهایی",
        description: `
          <p class="text-sm font-bold text-justify">با کلیک روی این دکمه، تمامی افراد انتخاب شده به الگوی جدید متصل می‌شوند. سیستم به صورت خودکار تداخل‌های احتمالی با الگوهای قبلی را مدیریت می‌کند.</p>
        `,
        side: "top",
        align: "end",
      },
    },
  ],
  // ۲. مدیریت گروه‌های کاری (Work Groups)
  "/work-groups": [
    {
      element: "#work-groups-list-card",
      popover: {
        title: "👥 لیست گروه‌های کاری سازمان",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">در این صفحه، گروه‌های منطقی سازمان (مثل <b>تیم فنی</b>، <b>بخش فروش</b> یا <b>پرسنل حراست</b>) را مدیریت می‌کنید.</p>
            <p class="text-xs text-blue-600 font-medium">مزیت اصلی: با اختصاص یک الگو به "گروه"، تمام اعضای آن گروه به صورت خودکار از آن الگو پیروی خواهند کرد.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#add-work-group-btn",
      popover: {
        title: "➕ دکمه افزودن گروه کاری",
        description: `
          <p class="text-sm leading-6">برای ایجاد یک دسته جدید از کارمندان، این دکمه را بزنید. در مرحله بعد می‌توانید نام و الگوی کاری مشترک آن‌ها را انتخاب کنید.</p>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#work-group-name-input",
      popover: {
        title: "🏷️ فیلد نام گروه کاری",
        description: `
          <p class="text-sm">نامی انتخاب کنید که نشان‌دهنده دپارتمان یا تیم باشد. مثال: <b>"تیم شب‌کار انبار"</b> یا <b>"اداری مرکزی"</b>.</p>
        `,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#work-group-pattern-select", // فیلد انتخاب الگو در فرم گروه
      popover: {
        title: "🔗 انتخاب الگوی کاری مشترک",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 text-justify">در اینجا مشخص می‌کنید که این گروه از چه قانونی تبعیت می‌کند. شما می‌توانید یک <b>الگوی هفتگی</b> یا یک <b>برنامه شیفتی</b> را به کل گروه متصل کنید.</p>
            <div class="p-2 bg-emerald-50 text-emerald-700 rounded text-[11px] border border-emerald-100">
              مثال: اگر گروه "حراست" را به الگوی "۲۴-۴۸" متصل کنید، تمام نگهبانانی که به این گروه اضافه شوند، بلافاصله در چرخه ۲۴-۴۸ قرار می‌گیرند.
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۳. فرم ایجاد/ویرایش گروه کاری
  "/work-groups/:id": [
    {
      element: "#work-group-name-input",
      popover: {
        title: "🏷️ فیلد نام گروه کاری",
        description: `
          <p class="text-sm">نامی انتخاب کنید که نشان‌دهنده دپارتمان یا تیم باشد. مثال: <b>"تیم شب‌کار انبار"</b> یا <b>"اداری مرکزی"</b>.</p>
        `,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#work-group-pattern-select", // فیلد انتخاب الگو در فرم گروه
      popover: {
        title: "🔗 انتخاب الگوی کاری مشترک",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 text-justify">در اینجا مشخص می‌کنید که این گروه از چه قانونی تبعیت می‌کند. شما می‌توانید یک <b>الگوی هفتگی</b> یا یک <b>برنامه شیفتی</b> را به کل گروه متصل کنید.</p>
            <div class="p-2 bg-emerald-50 text-emerald-700 rounded text-[11px] border border-emerald-100">
              مثال: اگر گروه "حراست" را به الگوی "۲۴-۴۸" متصل کنید، تمام نگهبانانی که به این گروه اضافه شوند، بلافاصله در چرخه ۲۴-۴۸ قرار می‌گیرند.
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۴. مدیریت اعضای گروه (Assignment)
  "/work-groups/:id/:groupId": [
    {
      element: "#assigned-members-card",
      popover: {
        title: "✅ کارمندان فعلی گروه",
        description: `
          <p class="text-sm leading-7">لیست افرادی که هم‌اکنون عضو این گروه هستند. این افراد به صورت خودکار تحت مدیریت الگوی کاری انتخاب شده برای گروه قرار دارند.</p>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#available-members-card",
      popover: {
        title: "➕ دکمه افزودن عضو به گروه",
        description: `
          <div class="space-y-2 text-sm text-gray-700 text-justify">
            <p>سایر پرسنل آزاد را در اینجا ببینید. با زدن دکمه <b>"افزودن به گروه"</b>، کارمند مورد نظر به جمع اعضای این تیم اضافه می‌شود.</p>
            <p class="text-xs text-gray-500 italic">نکته: هر کارمند در هر لحظه فقط می‌تواند عضو یک گروه کاری باشد.</p>
          </div>
        `,
        side: "left",
        align: "start",
      },
    },
  ],
  // ۱. صفحه اصلی چارت سازمانی
  "/organizations": [
    {
      element: "#org-tree-wrapper",
      popover: {
        title: "🌳 نمای کلی چارت سازمانی",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700 font-medium">به مرکز فرماندهی و چیدمان نیروها خوش آمدید!</p>
            <p class="text-sm text-gray-600 leading-6">در این صفحه، بدنه اصلی شرکت خود را به صورت یک <b>درخت سلسله‌مراتبی</b> تعریف می‌کنید. این چارت مشخص می‌کند که هر کاربر در کجای سازمان قرار می‌گیرد.</p>
            <div class="p-2 bg-blue-50 border-r-4 border-blue-500 rounded text-[11px] text-blue-800">
              <b>مثال:</b> ابتدا "دپارتمان فروش" را می‌سازید تا بعداً بتوانید "کارشناسان فروش" را به آن متصل کنید.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#add-root-unit-btn",
      popover: {
        title: "➕ دکمه افزودن واحد اصلی (Root)",
        description: `
          <div class="space-y-2">
            <p class="text-sm text-gray-700 leading-6">برای تعریف بالاترین سطح (مثل <b>دفتر مرکزی</b>) از این دکمه استفاده کنید. تمام واحدهای دیگر زیرمجموعه این بخش خواهند بود.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: ".org-node-actions",
      popover: {
        title: "🛠️ دکمه‌های عملیاتی واحد",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700">با این ابزارها، چارت را گسترش دهید:</p>
            <div class="grid grid-cols-1 gap-2 text-[10px]">
              <div class="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 italic"><b>(+) افزودن:</b> ایجاد زیرشاخه (مثلاً ساخت واحد "IT" زیرنظر "فنی").</div>
              <div class="p-2 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 italic"><b>(👁️) مشاهده اعضا:</b> دیدن لیست پرسنلی که در این واحد شاغل هستند.</div>
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
  ],

  // ۳. فرم ایجاد کاربر (نقطه تلاقی کاربر و سازمان)
  "/organizations/:id/create-user": [
    {
      element: "#personal-details-section",
      popover: {
        title: "👤 فرم اطلاعات فردی و شناسنامه‌ای",
        description: `
          <div class="space-y-2 text-justify">
            <p class="text-sm leading-7 text-gray-700">در این قدم، مشخصات پایه همکار جدید شامل <b>نام، کدملی و شماره پرسنلی</b> را با دقت وارد کنید.</p>
            <p class="text-[11px] text-gray-500 italic">نکته: شماره پرسنلی کلید اصلی اتصال این فرد به دستگاه‌های حضور و غیاب است.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#user-image-upload-section", // آیدی بخش آپلود عکس در کامپوننت FormImageUploader
      popover: {
        title: "📸 ثبت تصاویر احراز هویت هوشمند",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-rose-700 font-bold">بسیار مهم: دقت دوربین‌های تشخیص چهره!</p>
            <p class="text-sm text-gray-600">برای اینکه هوش مصنوعی سامانه بتواند کارمند را در لحظه ورود شناسایی کند، حتماً <b>حداقل ۳ تصویر متفاوت</b> بارگذاری کنید:</p>
            <ul class="list-disc pr-5 text-[11px] text-gray-700 space-y-1">
              <li><b>تصویر اول:</b> کاملاً از روبرو و با نور مناسب.</li>
              <li><b>تصویر دوم:</b> نیم‌رخ با زاویه ۴۵ درجه به سمت چپ.</li>
              <li><b>تصویر سوم:</b> نیم‌رخ با زاویه ۴۵ درجه به سمت راست.</li>
            </ul>
            <div class="p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-800 italic">
              عدم رعایت این مورد باعث اختلال در ثبت خودکار تردد توسط دوربین‌ها می‌شود.
            </div>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#organizational-form-section",
      popover: {
        title: "🏢 تعیین جایگاه در چارت سازمانی",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 font-bold">اتصال به بدنه سازمان:</p>
            <p class="text-sm text-gray-600 leading-6 text-justify">واحد سازمانی بر اساس مسیری که آمدید انتخاب شده است، اما می‌توانید <b>سمت شغلی</b> و <b>مدیر مستقیم</b> فرد را در این بخش نهایی کنید.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۴. پروفایل کاربر
  "/organizations/users/:id": [
    {
      element: "#user-profile-sidebar",
      popover: {
        title: "🆔 کارت هویت شغلی",
        description: `
          <p class="text-sm leading-6">در این بخش، خلاصه‌ای از وضعیت استخدامی فرد و جایگاه او در <b>ساختار درختی سازمان</b> نمایش داده می‌شود.</p>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#profile-tabs-container",
      popover: {
        title: "📂 تب‌های اطلاعاتی پرونده",
        description: `
          <div class="space-y-2 text-sm text-gray-700 leading-6">
            <p>تمام اطلاعات مربوط به کاربر در دسته‌بندی‌های مختلف (تماس، سوابق، اسناد) در اینجا قابل ویرایش و بازبینی است.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#access-management-section",
      popover: {
        title: "🔑 مدیریت سطح دسترسی در این بخش",
        description: `
          <div class="space-y-3">
            <p class="text-sm leading-6 text-gray-700"> نقش کارمند (ادمین یا کاربر عادی) را تعیین کنید. همچنین می‌توانید در هر زمان از <b>منوی سازمان</b>، پروفایل این شخص را جستجو و دسترسی‌های او را ویرایش نمایید.</p>
            <div class="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded text-[11px] border border-emerald-100">
              <span>✔️</span>
              <span>دقت در این بخش مانع از دسترسی‌های غیرمجاز به بخش‌های حساس پنل می‌شود.</span>
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],
    // ۴. بخش تقویم کاری سالانه (Work Calendar)
  "/work-calender": [
    {
      element: "#calendar-view-container",
      popover: {
        title: "📅 مدیریت هوشمند تقویم سازمانی",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p>به بخش تنظیمات تقویم خوش آمدید. این تقویم، <b>مرجع اصلی محاسبات حضور و غیاب</b> سازمان شماست.</p>
            <div class="p-3 bg-indigo-50 border-r-4 border-indigo-500 rounded text-xs text-indigo-900 leading-5">
               <b>چرا این بخش مهم است؟</b> سیستم بر اساس روزهایی که شما به عنوان "تعطیل" یا "کاری" علامت می‌زنید، ساعات موظفی پرسنل را در انتهای ماه محاسبه می‌کند.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#calendar-navigation-controls", // بخش انتخاب ماه و سال
      popover: {
        title: "🔍 ابزار جابجایی در زمان",
        description: `
          <div class="space-y-2 text-sm text-gray-700">
            <p>با استفاده از این بخش، می‌توانید به ماه‌ها یا سال‌های مختلف بروید تا تقویم آینده سازمان را برنامه‌ریزی کنید.</p>
            <p class="text-[11px] text-blue-600 italic">مثال: می‌توانید از همین حالا روزهای تعطیل نوروز سال آینده را در سیستم ثبت کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#calendar-grid-wrapper", // بدنه اصلی تقویم (روزها)
      popover: {
        title: "🖱️ دکمه‌های تغییر وضعیت روزها",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6">با کلیک روی هر روز، می‌توانید وضعیت آن را تغییر دهید. سیستم بین سه حالت جابجا می‌شود:</p>
            <div class="grid grid-cols-1 gap-2 text-[11px]">
              <div class="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                <span class="w-3 h-3 rounded-full bg-white border border-gray-300"></span>
                <b>روز کاری عادی:</b> مطابق با شیفت پرسنل.
              </div>
              <div class="flex items-center gap-2 p-1.5 bg-rose-50 rounded border border-rose-100 text-rose-700">
                <span class="w-3 h-3 rounded-full bg-rose-500 font-bold"></span>
                <b>تعطیل رسمی/داخلی:</b> کسر کار برای هیچ‌کس محاسبه نمی‌شود.
              </div>
              <div class="flex items-center gap-2 p-1.5 bg-amber-50 rounded border border-amber-100 text-amber-700">
                <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                <b>روز خاص/نیمه‌وقت:</b> اعمال تنظیمات سفارشی برای ساعات موظفی.
              </div>
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#sync-calendar-btn", // دکمه ذخیره یا همگام‌سازی
      popover: {
        title: "🚀 دکمه نهایی‌سازی و اعمال تقویم",
        description: `
          <div class="space-y-2 text-sm text-gray-700">
            <p>پس از انجام تغییرات، با کلیک روی این دکمه، تنظیمات تقویم در کل پایگاه داده سازمان اعمال می‌شود.</p>
            <div class="p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[10px] leading-4 italic">
              <b>مثال:</b> اگر ۲۲ بهمن را تعطیل اعلام کنید، بلافاصله در کارت تردد تمامی پرسنل، این روز به عنوان تعطیل رسمی علامت‌گذاری می‌شود.
            </div>
          </div>
        `,
        side: "top",
        align: "end",
      },
    },
  ],

  // ۵. جزئیات واحد سازمانی
  "/organizations/:id": [
    {
      element: "#org-detail-card",
      popover: {
        title: "📊 کارمندان و اطلاعات این سازمان",
        description: `
          <p class="text-sm leading-7 text-justify text-gray-700">در این بخش، اطلاعات کلی و تعداد پرسنل این واحد را مشاهده می‌کنید. تمامی تنظیمات حضور و غیاب برای اعضای این واحد از همین‌جا قابل پایش است.</p>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#bulk-import-org-btn",
      popover: {
        title: "📥 دکمه افزودن گروهی کارمندان (Import)",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-indigo-800 font-bold italic">نیاز به ثبت سریع پرسنل دارید؟</p>
            <p class="text-sm text-gray-600">به جای ثبت تکی، می‌توانید لیست تمام کارمندان این واحد را در قالب یک فایل اکسل آپلود کنید. سیستم به صورت خودکار تمام آن‌ها را شناسایی و عضو این واحد می‌کند.</p>
            <div class="p-2 bg-indigo-50 border border-indigo-100 rounded text-[11px] text-indigo-700">
              <b>مثال:</b> برای راه‌اندازی سریع "واحد انبار" با ۴۰ پرسنل، فقط کافیست لیست اکسل آن‌ها را اینجا بارگذاری کنید.
            </div>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#org-members-list",
      popover: {
        title: "👥 لیست اعضای دپارتمان",
        description: `
          <p class="text-sm text-gray-700 leading-6">در این جدول، تمامی همکارانی که در این واحد شاغل هستند لیست شده‌اند. با کلیک روی هر شخص، می‌توانید پروفایل و وضعیت تردد او را بررسی کنید.</p>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#user-list-card",
      popover: {
        title: "👥 مدیریت متمرکز پرسنل",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700">تمام افرادی که در چارت سازمانی شما جای دارند، در این جدول لیست می‌شوند. شما می‌توانید بر اساس <b>واحد سازمانی</b> یا <b>نام</b>، افراد را فیلتر کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#create-user-btn",
      popover: {
        title: "➕ دکمه ایجاد کاربرمند جدید",
        description: `
          <div class="space-y-2 text-sm text-gray-700 leading-6 text-justify">
            <p>برای اضافه کردن یک همکار جدید به سازمان، از این دکمه استفاده کنید. در مرحله بعد باید مشخص کنید او در کدام دپارتمان چارت شما فعالیت خواهد کرد.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },

  ],
  "/device-management": [
    {
      element: "#devices-grid",
      popover: {
        title: "📱 پایش سخت‌افزارها",
        description: `
          <p>وضعیت اتصال و سلامت دستگاه‌های حضور و غیاب را به صورت <b>Real-time</b> چک کنید. در صورت قطع شدن دستگاه، سیستم بلافاصله هشدار صادر می‌کند.</p>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  "/admin-management": [
    {
      element: "#admins-table",
      popover: {
        title: "🔑 کنترل سطح دسترسی",
        description: `
          <p>امنیت سامانه در این بخش رقم می‌خورد. <b>نقش‌های کاربری (Roles)</b> را تعریف کرده و دسترسی هر ادمین را به بخش‌های حساس محدود یا آزاد کنید.</p>
        `,
        side: "bottom",
        align: "center",
      },
    },
  ],

  "/confirm-photos/pending-images": [
    {
      element: "#pending-photos-grid",
      popover: {
        title: "📸 بازبینی هوش مصنوعی",
        description: `
          <p>تصاویری که توسط الگوریتم‌های تشخیص چهره با درصد خطای بالا ثبت شده‌اند، جهت <b>تایید نهایی توسط اپراتور</b> در این صف قرار می‌گیرند.</p>
        `,
        side: "top",
        align: "center",
      },
    },
  ],


  "/license": [
    {
      element: "#license-status-card",
      popover: {
        title: "📜 مدیریت لایسنس و ظرفیت",
        description: `
          <p>مشاهده تاریخ انقضا و <b>ارتقای تعداد کاربران مجاز</b>. برای تداوم خدمات و استفاده از آپدیت‌های جدید، وضعیت اشتراک خود را بررسی کنید.</p>
        `,
        side: "bottom",
        align: "center",
      },
    },
  ],
};
