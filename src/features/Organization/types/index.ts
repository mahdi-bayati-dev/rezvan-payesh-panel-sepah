/**
 * اینترفیس اصلی آبجکت سازمان
 * این شکل داده‌ای است که API در همه‌جا (Index, Show, Store, Update)
 * در داخل فیلد 'data' برمی‌گرداند.
 */
export interface Organization {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;

  // --- روابطی که API لود می‌کند ---

  // (در صورت لود شدن در متد Show)
  employees_count?: number;
  employees?: any[]; // (می‌توانید تایپ Employee را بعداً بسازید)

  // (در صورت لود شدن در متد Index یا Show)
  // children شامل آرایه‌ای از خود آبجکت‌های Organization است
  children?: Organization[];

  // (در صورت لود شدن در متد Index ادمین L2)
  // descendants نیز شامل آرایه‌ای از آبجکت‌های Organization است
  descendants?: Organization[];
}

/**
 * تایپ پاسخی که API در متد Index (لیست) برای Super Admin برمی‌گرداند
 * (یک آرایه از سازمان‌ها)
 */
export interface OrganizationCollectionResponse {
  data: Organization[];
}

/**
 * تایپ پاسخی که API در متد Show (تکی) یا در Index برای ادمین L2/L3 برمی‌گرداند
 * (یک آبجکت تکی سازمان)
 */
export interface OrganizationResourceResponse {
  data: Organization;
}


// --- ۱. اصلاحیه: اینترفیس درخت به اینجا منتقل شد ---
// این تایپ، داده‌های سفارشی ما برای هر آیتم درخت را مشخص می‌کند
export interface OrganizationTreeItem {
  name: string;
  // آبجکت کامل سازمان را نگه می‌داریم تا برای منوی سه‌نقطه در دسترس باشد
  originalData: Organization | null;
}
