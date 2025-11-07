// ساختار داده‌ای پایه برای یک دستگاه
export interface Device {
  id: number;
  name: string;
  registration_area: string; // 💡 اصلاح شده
  type: string; // 💡 اصلاح شده (می‌توانید دقیق‌تر تایپ کنید)
  status: string; // 💡 اصلاح شده (در Postman "online" است)
  last_heartbeat_at: string | null;
  last_known_ip: string | null;
  created_at: string;
  updated_at: string;
}

// ساختار داده‌ای مورد انتظار از پاسخ API برای لیست صفحه‌بندی شده (Laravel Pagination)
// این یک Type استاندارد برای داده‌های صفحه‌بندی شده است.
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
