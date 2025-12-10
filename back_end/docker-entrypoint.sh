#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. اصلاح خودکار کد AuthServiceProvider (یک بار برای همیشه)
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۲. تنظیم دسترسی پوشه‌ها
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# ۳. اجرای مایگریشن‌ها
echo "📦 Running migrations..."
php artisan migrate --force

# ۴. بررسی نصب اولیه (کلیدها و سیدر)
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected!"

    echo "🔑 Generating Passport keys..."
    php artisan passport:keys --force

    echo "👤 Creating Personal Access Client..."
    php artisan passport:client --personal --no-interaction

    echo "🌱 Seeding database..."
    php artisan db:seed --force

    # ایجاد فایل نشانه برای جلوگیری از اجرای مجدد
    touch storage/.passport_installed
fi

# ۵. اجرای سرویس اصلی
echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"