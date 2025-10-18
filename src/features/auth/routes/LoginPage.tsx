// src/features/auth/routes/LoginPage.tsx
import LoginForm from "@/features/auth/components/LoginForm";

const LoginPage = () => {
  return (
    // کامنت: این والد مثل قبل مسئولیت ایجاد فاصله و وسط‌چینی را دارد.
    <div className="flex min-h-screen w-full items-center justify-center bg-backgroundL-500 md:p-4">
      {/* کامنت: کانتینر تصویر با استراتژی ریسپانسیو جدید */}
      <div
        className="
          relative flex w-full
          // --- استایل‌های موبایل (پیش‌فرض) ---
          h-screen  items-center  // در موبایل، ارتفاع کامل و گوشه‌های گرد ساده
          
          // --- استایل‌های تبلت و دسکتاپ (از md به بالا) ---
          md:h-auto md:rounded-2xl md:items-end md:max-h-dvh md:aspect-video md:rounded-2xl // در دسکتاپ، به نسبت ابعاد ویدیو برمی‌گردیم

          // --- استایل‌های مشترک ---
           justify-center 
          bg-cover bg-center overflow-hidden
          before:absolute before:inset-0 before:bg-white/40 before:content-[''] dark:before:bg-backgroundD/30
        "
        style={{ backgroundImage: "url('img/img-login/background-login.jpg')" }}
      >
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
