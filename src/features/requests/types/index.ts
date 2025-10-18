// features/requests/types/index.ts

// features/requests/types/index.ts

// این تایپ‌ها بر اساس فیگما شما هستند
export type RequestStatus =
  | "تایید شده"
  | "پاسخ داده نشده"
  | "در حال بررسی"
  | "رد شده";
export type RequestCategory = "ماموریت" | "مرخصی" | "تجهیزات";

export interface Requester {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
}

export interface Request {
  id: string; // شناسه یکتای درخواست
  requestNumber: string; // شماره درخواست
  requester: Requester; // درخواست دهنده
  organization: string; // سازمان
  category: RequestCategory; // دسته بندی
  requestType: string; // نوع درخواست (پاس روز، پاس شیر و...)
  status: RequestStatus; // وضعیت
  date: string; // تاریخ درخواست
}
