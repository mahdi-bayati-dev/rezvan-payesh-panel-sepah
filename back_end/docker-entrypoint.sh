#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. اصلاح خودکار کد (یک بار برای همیشه)
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. صبر برای دیتابیس با PHP خالص (بدون تولید لاگ خطا)
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

# ۳. اجرای دستورات اصلی
echo "📦 Running migrations..."
php artisan migrate --force

# ۴. بررسی نصب اولیه (کلیدها و سیدر)
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected! Setting up..."

    php artisan passport:keys --force
    php artisan passport:client --personal --no-interaction
    php artisan db:seed --force

    touch storage/.passport_installed
fi

# ۵. اصلاح نهایی پرمیشن‌ها (بسیار مهم برای جلوگیری از خطای لاگ)
# چون دستورات بالا با روت اجرا شدند، باید مالکیت فایل‌های تولید شده را به www-data برگردانیم
echo "🔒 Fixing final permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# ۶. اجرا
echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"