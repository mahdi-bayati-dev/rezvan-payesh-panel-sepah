import { type DriveStep } from "driver.js";

/**
 * تنظیمات گام‌های آموزشی پنل مدیریتی
 * توسعه‌دهنده: مهدی بیاتی
 * ویژگی‌ها: متون غنی، آیکون‌های Lucide و چیدمان استاندارد
 */

export const TOUR_STEPS: Record<string, DriveStep[]> = {
  "/dashboard": [
    {
      element: "#help-guide-trigger", // دکمه راهنما در گوشه سمت چپ
      popover: {
        title: "💡 دکمه راهنمای هوشمند و سریع",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <div class="flex justify-start">
              <span class="p-2 px-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-105">
                
                <span class="text-sm font-bold">راهنما</span>
              </span>
            </div>
            <p class="text-sm text-gray-700">قبل از شروع، این ابزار حیاتی را بشناسید! در هر صفحه‌ای از اپلیکیشن که باشید، با کلیک روی این دکمه در <b>گوشه سمت چپ</b> (مشابه تصویر بالا)، راهنمای اختصاصی همان بخش برای شما باز می‌شود.</p>
            <div class="p-2 bg-blue-50 border-r-4 border-blue-500 rounded text-[11px] text-blue-800 font-medium leading-5">
              هدف ما این است که شما بدون نیاز به آموزش حضوری، به تمام قابلیت‌های سامانه مسلط شوید.
            </div>
          </div>
        `,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#stats-overview-area", // محفظه کارت‌های آمار (StatCards)
      popover: {
        title: "📊 کارت‌های آمار وضعیت لحظه‌ای",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p class="text-sm">در این بخش، وضعیت حضور و غیاب کل سازمان را در همین لحظه مشاهده می‌کنید. آمار به چهار دسته اصلی تقسیم شده است:</p>
            <ul class="list-none pr-4 space-y-2 text-[11px]">
              <li><span class="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-2"></span><b>حاضرین:</b> افرادی که ورودشان ثبت شده است.</li>
              <li><span class="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2"></span><b>تاخیرها:</b> افرادی که خارج از بازه مجاز وارد شده‌اند.</li>
              <li><span class="inline-block w-2 h-2 rounded-full bg-rose-500 ml-2"></span><b>غایبین:</b> افرادی که طبق شیفت باید حاضر می‌بودند اما ترددی ندارند.</li>
            </ul>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#attendance-trend-chart", // بخش AttendanceChart
      popover: {
        title: "📈 نمودار تحلیلی روند ترددها",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6 text-justify">این نمودار، <b>تفسیر بصری داده‌های حجیم</b> سازمان شماست. شما می‌توانید نوسانات حضور پرسنل را در بازه‌های زمانی مختلف تحلیل کنید.</p>
            <div class="p-2 bg-indigo-50 border border-indigo-100 rounded text-[11px] text-indigo-700 italic">
              <b>مثال کاربردی:</b> اگر در روزهای سه‌شنبه نمودار غیبت‌ها اوج می‌گیرد، می‌توانید برای آن روز سیاست‌های تشویقی یا مدیریتی خاصی وضع کنید.
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#dashboard-refresh-data", // دکمه آپدیت در هدر
      popover: {
        title: "🔄 دکمه بروزرسانی آنی داده‌ها",
        description: `
          <p class="text-sm text-gray-700 leading-6">داده‌های پیشخوان به صورت هوشمند کش می‌شوند. با استفاده از این دکمه، می‌توانید در لحظه آخرین ترددهای ثبت شده توسط دوربین‌ها را با داشبورد همگام‌سازی کنید.</p>
        `,
        side: "bottom",
        align: "end",
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
  // ۲. لیست اصلی درخواست‌ها
  "/requests": [
    {
      element: "#requests-filter-card",
      popover: {
        title: "🔍 پنل فیلترینگ پیشرفته",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700 font-medium text-justify">برای مدیریت انبوه درخواست‌ها، از این پنل استفاده کنید. شما می‌توانید بر اساس <b>وضعیت</b> (در انتظار، تایید شده، رد شده) و <b>نوع درخواست</b> لیست را محدود کنید.</p>
            <div class="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800">
              <span>💡</span>
              <span>مثال: فقط درخواست‌های "مرخصی استحقاقی" که "در انتظار" هستند را مشاهده کنید.</span>
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#export-requests-btn",
      popover: {
        title: "📥 دکمه خروجی اکسل و گزارش‌گیری",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <div class="flex justify-start">
              <span class="p-2 px-3 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 shadow-sm">
                <span class="text-base">📊</span>
                <span class="text-sm font-bold">خروجی اکسل</span>
              </span>
            </div>
            <p class="text-sm text-gray-700 leading-6">نیاز به گزارش چاپی دارید؟ با این دکمه، لیست فیلتر شده را در قالب فایل اکسل برای امور اداری و حسابداری دریافت کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#requests-table-settings-btn",
      popover: {
        title: "⚙️ دکمه تنظیمات پایه درخواست‌ها",
        description: `
          <div class="space-y-3">
             <p class="text-sm text-gray-700 leading-6 text-justify">قبل از هر چیز، باید انواع درخواست‌های مجاز در سازمان را تعریف کنید. با کلیک بر روی این دکمه به صفحه <b>مدیریت دسته‌بندی‌ها</b> منتقل می‌شوید.</p>
          </div>
        `,
        side: "bottom",
        align: "start",
      },
    },
  ],

  // ۳. جزئیات یک درخواست خاص
  "/requests/:id": [
    {
      element: "#request-info-card",
      popover: {
        title: "📄 شناسنامه کامل درخواست",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p class="text-sm">در این بخش، تمام جزئیات شامل <b>زمان شروع و پایان</b>، <b>مدت زمان کارکرد/غیبت</b> و علت ثبت درخواست را مشاهده می‌کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#request-actions-panel",
      popover: {
        title: "⚖️ پنل تصمیم‌گیری و تایید نهایی",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <p class="text-sm text-gray-700 font-bold text-justify">نوبت شماست! سرنوشت این درخواست را با دو دکمه زیر تعیین کنید:</p>
            <div class="flex flex-col gap-2">
               <div class="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                  <span class="font-bold">✅ تایید:</span> تایید نهایی و اعمال در کارکرد پرسنل.
               </div>
               <div class="flex items-center gap-2 p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                  <span class="font-bold">❌ رد درخواست:</span> ابطال درخواست (با امکان درج دلیل رد).
               </div>
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
  ],

  // ۴. تنظیمات انواع درخواست (Table Settings)
  "/requests/settings-table": [
    {
      element: "#add-leave-type-btn",
      popover: {
        title: "➕ دکمه تعریف نوع درخواست جدید",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <div class="flex justify-start">
              <span class="p-2 px-3 text-white bg-blue-900 rounded-lg flex items-center gap-2 shadow-md">
                <span class="text-sm font-bold">افزودن ریشه جدید</span>
              </span>
            </div>
            <p class="text-sm text-gray-700 text-justify">در این بخش می‌توانید انواع مرخصی‌ها (استحقاقی، استعلاجی، بدون حقوق) یا ماموریت‌ها را به سامانه معرفی کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: ".leave-type-row-actions",
      popover: {
        title: "🛠️ مدیریت و ویرایش دسته‌ها",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 leading-6 text-justify">شما می‌توانید در هر زمان، قوانین مربوط به هر نوع درخواست را ویرایش کرده یا دسته‌های قدیمی که دیگر استفاده نمی‌شوند را حذف نمایید.</p>
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
      element: "#reports-activity-filters",
      popover: {
        title: "🎯 شخصی‌سازی هوشمند گزارش",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">برای استخراج دیتای دقیق، از فیلترهای ترکیبی استفاده کنید. شما می‌توانید گزارش را بر اساس <b>بازه زمانی</b>، <b>واحد سازمانی</b> یا <b>فرد خاص</b> شخصی‌سازی کنید.</p>
            <div class="p-2 bg-blue-50 border-r-4 border-blue-500 rounded text-[11px] text-blue-800">
              <b>مثال:</b> مشاهده تمام ترددهای "واحد فنی" در "هفته گذشته" برای بررسی اضافه‌کاری‌ها.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#export-reports-trigger",
      popover: {
        title: "📥 دکمه خروجی  اکسل",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <div class="flex justify-start">
              <span class="p-2 px-3 text-bray-200 bg-indigo-100 rounded-lg flex items-center gap-2 shadow-md">
                <span class="text-base">📤</span>
                <span class="text-sm font-bold">خروجی اکسل</span>
              </span>
            </div>
            <p class="text-sm text-gray-700">گزارش نهایی خود را در قالب <b>Excel</b>  دریافت کنید. این فایل‌ها کاملاً استاندارد و آماده ارائه به بخش حسابداری هستند.</p>
          </div>
        `,
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "#add-manual-report-btn",
      popover: {
        title: "➕ دکمه ثبت فعالیت دستی",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <div class="flex justify-start">
              <span class="p-2 px-3 text-white border border-indigo-200 bg-borderD rounded-lg flex items-center gap-2 shadow-sm">
                <span class="text-base">📝</span>
                <span class="text-sm font-bold">ثبت فعالیت جدید</span>
              </span>
            </div>
            <p class="text-sm text-gray-700 leading-6 text-justify">اگر فعالیتی توسط دوربین‌ها ثبت نشده (مثلاً ماموریت خارج از سازمان)، از این بخش می‌توانید به صورت دستی رکورد جدیدی برای سرباز ایجاد کنید.</p>
          </div>
        `,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#reports-main-table",
      popover: {
        title: "📑 جدول پایش فعالیت‌ها",
        description: `
          <div class="space-y-3 text-sm text-gray-700">
            <p>در این جدول، جزئیات هر فعالیت (زمان، نوع، و وضعیت تایید) نمایش داده می‌شود. با کلیک بر روی هر ردیف، می‌توانید اطلاعات تکمیلی آن رکورد را مشاهده کنید.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
  ],

  // ۴. جزئیات یک گزارش یا لاگ خاص
  "/reports/:id": [
    {
      element: "#log-info-card",
      popover: {
        title: "🔍 بررسی دقیق فعالیت",
        description: `
          <div class="space-y-3 text-justify text-gray-700">
            <p class="text-sm">در این صفحه، شناسنامه کامل یک فعالیت شامل <b>موقعیت جغرافیایی</b>، <b>ساعت دقیق</b> و <b>تصویر ثبت شده</b> توسط دوربین را مشاهده می‌کنید.</p>
            <div class="p-2 bg-amber-50 border-r-4 border-amber-500 rounded text-[11px] text-amber-800">
              این بخش برای رفع ابهام در ترددهای مشکوک بسیار کاربردی است.
            </div>
          </div>
        `,
        side: "bottom",
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
        title: "📋 لیست الگوهای کاری موجود",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">این سایدبار شامل تمام <b>الگوهای ثابت (Weekly)</b> و <b>شیفت‌های چرخشی (Shift)</b> است. با انتخاب هر الگو، مشخصات فنی آن در مرکز صفحه نمایش داده می‌شود.</p>
            <div class="flex items-center gap-2 p-2 bg-indigo-50 text-indigo-700 rounded text-[11px] border border-indigo-100">
              <span>📅</span>
              <span>الگوهای آبی رنگ نشان‌دهنده ساعات کاری ثابت هفتگی هستند.</span>
            </div>
          </div>
        `,
        side: "left",
        align: "start",
      },
    },
    {
      element: "#work-pattern-visual-view",
      popover: {
        title: "🎨 شماتیک گرافیکی و خط زمان",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6">این بخش <b>قلب محاسباتی</b> الگو است. شما می‌توانید توالی روزهای کاری و استراحت را به صورت گرافیکی ببینید.</p>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div class="flex items-center gap-1 p-1 bg-blue-100 text-blue-700 rounded">🔵 بازه حضور اجباری</div>
              <div class="flex items-center gap-1 p-1 bg-amber-100 text-amber-700 rounded">🟡 بازه شناوری (Floating)</div>
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#pattern-actions-sidebar",
      popover: {
        title: "🛠️ پنل مدیریت و عملیات الگو",
        description: `
          <div class="space-y-4 text-justify leading-relaxed">
            <p class="text-sm text-gray-700 font-bold">برای مدیریت الگو از این دکمه‌ها استفاده کنید:</p>
            <div class="space-y-2">
               <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <span class="text-blue-600">✏️</span> <b>ویرایش الگو:</b> تغییر ساعات یا بازه‌های شناوری.
               </div>
               <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <span class="text-emerald-600">👥</span> <b>مدیریت سربازان:</b> مشاهده و تخصیص افراد به این الگو.
               </div>
               <div class="flex items-center gap-2 p-2 bg-rose-50 rounded-lg border border-rose-100 text-xs text-rose-700">
                  <span>🗑️</span> <b>حذف:</b> پاک کردن الگو (در صورت عدم وجود سرباز فعال).
               </div>
            </div>
          </div>
        `,
        side: "left",
        align: "center",
      },
    },
    {
      element: "#add-pattern-btn",
      popover: {
        title: "➕ دکمه تعریف ساختار زمانی جدید",
        description: `
          <p class="text-sm text-gray-700 leading-6 text-justify text-justify">اگر نیاز به تعریف یک شیفت جدید (مثلاً شیفت ۲۴-۴۸ نگهبانی یا ساعات اداری ماه رمضان) دارید، از این دکمه شروع کنید.</p>
        `,
        side: "bottom",
        align: "end",
      },
    },
  ],

  // ۳. انتخاب نوع الگو (Selector)
  "/work-patterns/new-work-patterns": [
    {
      element: "#pattern-type-selector",
      popover: {
        title: "🎭 انتخاب مدل کاری سازمان",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 leading-7">بسیار مهم: قبل از شروع، مدل الگو را انتخاب کنید:</p>
            <div class="space-y-2">
               <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <b>۱. الگوهای هفتگی (Weekly):</b> برای روزهای ثابت (مثلاً شنبه تا چهارشنبه ۸ تا ۱۶).
               </div>
               <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs">
                  <b>۲. برنامه‌های شیفتی (Shift):</b> برای چرخه‌های تکرار شونده (مثلاً ۲ روز کار، ۱ روز استراحت).
               </div>
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#daily-schedule-rows",
      popover: {
        title: "📅 تنظیم دقیق ساعات و شناوری",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-gray-700">برای هر روز، بازه <b>ورود و خروج</b> را مشخص کنید. سیستم به صورت خودکار <b>مدت زمان خالص کارکرد</b> را محاسبه می‌کند.</p>
            <div class="p-2 bg-amber-50 border-r-4 border-amber-500 rounded text-[11px] text-amber-900 leading-5">
              <b>مثال شناوری:</b> اگر ورود را ۸:۰۰ و "شناوری ورود" را ۳۰ دقیقه بگذارید، فرد تا ۸:۳۰ بدون تاخیر مجاز به ورود است.
            </div>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#floating-settings-card",
      popover: {
        title: "⏱️ مدیریت انعطاف‌پذیری (ساعات شناور)",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700 leading-6">یکی از قوی‌ترین فیچرهای سامانه! شما می‌توانید تعیین کنید سرباز تا چند دقیقه مجاز به <b>تاخیر در ورود</b> یا <b>تعجیل در خروج</b> است.</p>
            <div class="bg-amber-50 p-2 rounded border border-amber-200 text-[10px] text-amber-800 italic">
              مثال: اگر ورود را ۸:۰۰ و شناوری را ۳۰ دقیقه بگذارید، فردی که ۸:۲۰ وارد شود "تاخیری" نخواهد بود.
            </div>
          </div>
        `,
        side: "top",
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
  // ۴. فرم ایجاد و تنظیمات دقیق روزانه

  // ۵. مدیریت سربازان (Employees Assignment)
  "/work-patterns/employees/pattern/:id": [
    {
      element: "#assigned-employees-table",
      popover: {
        title: "✅ لیست پرسنل تحت پوشش",
        description: `
          <p class="text-sm text-gray-700 leading-7 text-justify">در این جدول، افرادی را می‌بینید که هم‌اکنون طبق این الگو فعالیت می‌کنند. هرگونه تغییر در ساعات این الگو، بلافاصله در کارت تردد این افراد اعمال خواهد شد.</p>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#available-employees-table",
      popover: {
        title: "➕ دکمه افزودن سرباز به الگو",
        description: `
          <div class="space-y-3">
             <p class="text-sm text-gray-700 leading-6 text-justify">سایر پرسنل سازمان را در اینجا جستجو کنید و با زدن دکمه <b>"افزودن"</b>، آن‌ها را به این نظم کاری متصل نمایید.</p>
          </div>
        `,
        side: "left",
        align: "start",
      },
    },
  ],

  // ۶. تخصیص گروهی (Bulk Assign)
  "/work-patterns/assign": [
    {
      element: "#assignment-tabs",
      popover: {
        title: "👥 تخصیص هوشمند و دسته‌جمعی",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700">نیاز دارید کل <b>"واحد فنی"</b> را به یک الگو متصل کنید؟ از تب گروه‌های کاری استفاده کنید تا صدها نفر را با یک کلیک مدیریت نمایید.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#finalize-assignment-btn",
      popover: {
        title: "🚀 دکمه ثبت و اعمال نهایی",
        description: `
          <div class="space-y-2">
             <p class="text-sm font-bold text-emerald-700">عملیات را نهایی کنید!</p>
             <p class="text-xs text-gray-600 leading-5 text-justify">با کلیک روی این دکمه، تمام پرسنل انتخاب شده از تاریخ مشخص شده، تحت پوشش الگوی جدید قرار می‌گیرند.</p>
          </div>
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
          <p class="text-sm leading-6">برای ایجاد یک دسته جدید از سربازان، این دکمه را بزنید. در مرحله بعد می‌توانید نام و الگوی کاری مشترک آن‌ها را انتخاب کنید.</p>
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
        title: "✅ سربازان فعلی گروه",
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
            <p>سایر پرسنل آزاد را در اینجا ببینید. با زدن دکمه <b>"افزودن به گروه"</b>، سرباز مورد نظر به جمع اعضای این تیم اضافه می‌شود.</p>
            <p class="text-xs text-gray-500 italic">نکته: هر سرباز در هر لحظه فقط می‌تواند عضو یک گروه کاری باشد.</p>
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
            <p class="text-sm text-gray-600">برای اینکه هوش مصنوعی سامانه بتواند سرباز را در لحظه ورود شناسایی کند، حتماً <b>حداقل ۳ تصویر متفاوت</b> بارگذاری کنید:</p>
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
            <p class="text-sm leading-6 text-gray-700"> نقش سرباز (ادمین یا کاربر عادی) را تعیین کنید. همچنین می‌توانید در هر زمان از <b>منوی سازمان</b>، پروفایل این شخص را جستجو و دسترسی‌های او را ویرایش نمایید.</p>
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
        title: "📊 سربازان و اطلاعات این سازمان",
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
        title: "📥 دکمه افزودن گروهی سربازان (Import)",
        description: `
          <div class="space-y-3 text-justify leading-relaxed">
            <p class="text-sm text-indigo-800 font-bold italic">نیاز به ثبت سریع پرسنل دارید؟</p>
            <p class="text-sm text-gray-600">به جای ثبت تکی، می‌توانید لیست تمام سربازان این واحد را در قالب یک فایل اکسل آپلود کنید. سیستم به صورت خودکار تمام آن‌ها را شناسایی و عضو این واحد می‌کند.</p>
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
      element: "#devices-page-container",
      popover: {
        title: "🖥️ مرکز پایش و مدیریت سخت‌افزارها",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p>به بخش مدیریت دستگاه‌ها خوش آمدید. در این صفحه، تمام <b>دوربین‌های تشخیص چهره</b> و سخت‌افزارهای ثبت تردد سازمان را کنترل می‌کنید.</p>
            <div class="p-3 bg-blue-50 border-r-4 border-blue-500 rounded text-xs text-blue-900 leading-5">
               <b>اهمیت این بخش:</b> پایداری کل سیستم احراز هویت به وضعیت "آنلاین" بودن دستگاه‌های این لیست بستگی دارد.
            </div>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },

    {
      element: "#devices-list-table",
      popover: {
        title: "📊 جدول وضعیت لحظه‌ای (Real-time Monitoring)",
        description: `
          <div class="space-y-4">
            <p class="text-sm text-gray-700 leading-6 text-justify">در این جدول، مشخصات فنی و وضعیت اتصال هر دوربین نمایش داده می‌شود. به ستون‌های زیر توجه ویژه داشته باشید:</p>
            <div class="grid grid-cols-1 gap-2 text-[11px]">
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                <span class="text-indigo-500 font-bold">🌐 آدرس IP:</span> نشانی دستگاه در شبکه داخلی شرکت.
              </div>
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                <span class="text-amber-500 font-bold">📍 محل استقرار:</span> تعیین دقیق موقعیت (مثلاً طبقه اول، پارکینگ).
              </div>
            </div>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: ".device-status-badge", // کلاس مربوط به نشانگر وضعیت در ستون‌های جدول
      popover: {
        title: "💡 راهنمای نشانگر سلامت دستگاه",
        description: `
          <div class="space-y-3 text-justify">
            <p class="text-sm text-gray-700">وضعیت اتصال دستگاه با رنگ‌ها مشخص می‌شود:</p>
            <div class="flex items-center gap-3 p-2 bg-emerald-50 rounded border border-emerald-100">
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[11px] text-emerald-800"><b>سبز (Online):</b> دستگاه متصل است و تصاویر را برای پردازش ارسال می‌کند.</span>
            </div>
            <div class="flex items-center gap-3 p-2 bg-rose-50 rounded border border-rose-100">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span class="text-[11px] text-rose-800"><b>قرمز (Offline):</b> اتصال قطع شده است. در این حالت ترددها ثبت نخواهند شد!</span>
            </div>
          </div>
        `,
        side: "right",
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
      element: "#pending-images-page-container",
      popover: {
        title: "📸 واحد نظارت بر تصاویر و هویت بصری",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p>به بخش مدیریت تصاویر معلق خوش آمدید. این صفحه <b>فیلتر نهایی</b> برای تضمین کیفیت و صحت تصاویر سامانه است.</p>
            <div class="p-3 bg-blue-50 border-r-4 border-blue-500 rounded text-xs text-blue-900 leading-5">
               <b>منابع تصاویر این لیست:</b>
               <ul class="list-disc pr-4 mt-1 space-y-1">
                 <li>تصاویری که هوش مصنوعی در تشخیص آن‌ها شک داشته است.</li>
                 <li><b>تصاویری که سرباز شخصاً در پروفایل خود آپلود کرده است.</b></li>
               </ul>
            </div>
            <p class="text-xs text-gray-500 italic mt-2">وظیفه شما در اینجا تایید این است که عکس بارگذاری شده واقعاً متعلق به همان سرباز بوده و از کیفیت کافی برخوردار باشد.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: ".image-request-card",
      popover: {
        title: "🖼️ کارت درخواست بررسی هویت",
        description: `
          <div class="space-y-3 text-justify leading-relaxed text-gray-700">
            <p class="text-sm text-gray-700 leading-6">در هر کارت، تصویر جدید ثبت شده (توسط دوربین یا آپلود سرباز) در کنار نام فرد نمایش داده می‌شود.</p>
            <div class="p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-800 font-medium">
              <b>مثال:</b> اگر سربازی عکس غیررسمی یا اشتباهی از خود در پروفایلش بگذارد، شما در اینجا با "رد کردن" آن، از ورود داده‌های غلط به دیتابیس هوش مصنوعی جلوگیری می‌کنید.
            </div>
          </div>
        `,
        side: "right",
        align: "start",
      },
    },
    {
      element: "#image-comparison-area",
      popover: {
        title: "🔍 پنل مقایسه و اعتبارسنجی بصری",
        description: `
          <div class="space-y-4">
            <p class="text-sm text-gray-700 leading-6 text-justify">در این بخش، <b>تصویر مرجع</b> (عکسی که قبلاً تایید شده) را با <b>تصویر جدید</b> مقایسه کنید تا از صحت هویت سرباز مطمئن شوید.</p>
          </div>
        `,
        side: "top",
        align: "center",
      },
    },
    {
      element: "#approve-image-btn",
      popover: {
        title: "✅ دکمه تایید و ثبت نهایی تصویر",
        description: `
          <div class="space-y-3">
            <p class="text-sm text-gray-700 leading-6 text-justify">با تایید شما، این تصویر به عنوان یک منبع معتبر در پروفایل سرباز ذخیره شده و دوربین‌ها از این پس با استفاده از آن، فرد را با دقت بیشتری شناسایی می‌کنند.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#reject-image-btn",
      popover: {
        title: "❌ دکمه رد تصویر (عدم احراز هویت)",
        description: `
          <div class="space-y-3 text-sm text-gray-700">
            <p class="text-justify leading-6">اگر تصویر متعلق به فرد دیگری است، کیفیت پایینی دارد و یا توسط سرباز به اشتباه آپلود شده، آن را رد کنید تا امنیت سامانه حفظ شود.</p>
          </div>
        `,
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#socket-notification-indicator",
      popover: {
        title: "🔔 سیستم اطلاع‌رسانی لحظه‌ای (Real-time)",
        description: `
          <div class="space-y-2 text-sm text-gray-700">
            <p>به محض اینکه سربازی عکس جدیدی آپلود کند یا دوربین تصویری را برای بررسی بفرستد، شما به صورت آنی مطلع خواهید شد.</p>
          </div>
        `,
        side: "left",
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
