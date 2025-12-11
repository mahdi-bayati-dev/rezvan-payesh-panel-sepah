#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# --- بخش جدید: ساخت پوشه‌های ضروری لاراول اگر وجود نداشته باشند ---
echo "📂 Checking storage directory structure..."
mkdir -p /var/www/storage/framework/cache/data
mkdir -p /var/www/storage/framework/app
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/framework/testing
mkdir -p /var/www/storage/logs
mkdir -p /var/www/storage/app/public
mkdir -p /var/www/storage/app/private

# ۱. اصلاح خودکار کد AuthServiceProvider (اگر لازم باشد)
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. تنظیم دسترسی پوشه‌ها
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ۳. صبر هوشمند برای دیتابیس
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
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected! Setting up..."

    php artisan passport:keys --force
    php artisan passport:client --personal --no-interaction

    echo "🌱 Seeding database..."
    php artisan db:seed --force

    touch storage/.passport_installed
fi

# ۶. کش کردن کانفیگ برای پرفرمنس (اختیاری ولی توصیه شده)
# php artisan config:cache
# php artisan route:cache
# php artisan view:cache

echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"