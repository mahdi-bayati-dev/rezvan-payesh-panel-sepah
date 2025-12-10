#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. اصلاح خودکار کد AuthServiceProvider (یک بار برای همیشه)
# اگر خط کامنت نشده باشد، آن را کامنت می‌کند
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. تنظیم دسترسی پوشه‌ها (جلوگیری از خطای Permission denied)
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# ۳. اجرای مایگریشن‌ها (ساخت جداول دیتابیس)
# منتظر می‌مانیم تا دیتابیس کامل بالا بیاید
echo "📦 Running migrations..."
php artisan migrate --force

# ۴. بررسی و ساخت کلیدهای پاسپورت
# اگر کلیدها نباشند (یعنی نصب اولیه است یا والیوم پاک شده)، آن‌ها را می‌سازد
if [ ! -f storage/oauth-private.key ]; then
    echo "🔑 Generating Passport keys and client..."
    php artisan passport:keys --force
    # ساخت کلاینت شخصی برای لاگین
    php artisan passport:client --personal --no-interaction
fi

# ۵. اجرای دستور اصلی کانتینر (php-fpm)
echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"