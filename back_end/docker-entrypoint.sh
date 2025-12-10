#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. اصلاح کد (اگر لازم باشد)
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. تنظیم پرمیشن‌ها
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# ۳. صبر برای دیتابیس (بخش جدید و حیاتی)
echo "⏳ Waiting for MySQL to be ready..."
# تلاش برای اتصال به دیتابیس تا زمانی که موفق شود
until php artisan db:monitor > /dev/null 2>&1; do
  echo "zzz... Database is not ready yet. Waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# ۴. اجرای مایگریشن‌ها
echo "📦 Running migrations..."
php artisan migrate --force

# ۵. بررسی نصب اولیه
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected!"

    echo "🔑 Generating Passport keys..."
    php artisan passport:keys --force

    echo "👤 Creating Personal Access Client..."
    php artisan passport:client --personal --no-interaction

    echo "🌱 Seeding database..."
    php artisan db:seed --force

    touch storage/.passport_installed
fi

# ۶. اجرای برنامه
echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"