#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. اصلاح خودکار کد AuthServiceProvider (اگر لازم باشد)
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. تنظیم دسترسی پوشه‌ها
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# ۳. صبر هوشمند برای دیتابیس (بخش حیاتی که نداشتید) ⏳
echo "⏳ Waiting for MySQL to be ready..."
until php -r "
    try {
        \$pdo = new PDO('mysql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 3306), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
        exit(0);
    } catch (PDOException \$e) {
        exit(1);
    }
"; do
    echo "zzz... Database is not ready yet. Waiting..."
    sleep 2
done
echo "✅ Database is ready and reachable!"

# ۴. اجرای مایگریشن‌ها
echo "📦 Running migrations..."
php artisan migrate --force

# ۵. بررسی نصب اولیه (ساخت کلید، کلاینت و سیدر)
# این بخش فقط زمانی اجرا می‌شود که کلیدها نباشند (یعنی دیتابیس خالی است)
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected! Setting up..."

    # ساخت کلیدهای رمزنگاری
    php artisan passport:keys --force

    # ساخت کلاینت شخصی برای لاگین
    php artisan passport:client --personal --no-interaction

    # پر کردن دیتابیس (سیدر)
    echo "🌱 Seeding database..."
    php artisan db:seed --force

    # ایجاد فایل نشانه برای جلوگیری از اجرای مجدد
    touch storage/.passport_installed
fi

# ۶. اجرای سرویس اصلی
echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"