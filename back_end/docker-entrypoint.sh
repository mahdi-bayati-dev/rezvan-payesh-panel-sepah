#!/bin/sh
set -e

echo "🚀 Starting deployment tasks..."

# ۱. ساخت پوشه‌های ضروری (اگر نباشند)
echo "📂 Checking storage directory structure..."
mkdir -p /var/www/storage/framework/cache/data
mkdir -p /var/www/storage/framework/app
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/framework/testing
mkdir -p /var/www/storage/logs
mkdir -p /var/www/storage/app/public
mkdir -p /var/www/storage/app/private

# ۲. اصلاح خودکار کد AuthServiceProvider
if grep -q "Passport::loadKeysFrom" app/Providers/AuthServiceProvider.php; then
    echo "🔧 Fixing AuthServiceProvider..."
    sed -i 's|Passport::loadKeysFrom|// Passport::loadKeysFrom|g' app/Providers/AuthServiceProvider.php
fi

# ۳. تنظیم دسترسی پوشه‌ها
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ۴. صبر هوشمند برای دیتابیس
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

# ۵. منطق هوشمند مایگریشن (بخش حیاتی اصلاح شده) 🔥
# اگر فایل‌های کلید نیستند، یعنی نصب تازه است یا دیتابیس خراب است
if [ ! -f storage/oauth-private.key ] || [ ! -f storage/.passport_installed ]; then
    echo "✨ Fresh install detected! Rebuilding database from scratch..."

    # اینجا به جای migrate معمولی، از fresh استفاده می‌کنیم تا جدول‌ها حتما ساخته شوند
    php artisan migrate:fresh --force

    echo "🔑 Generating keys..."
    php artisan passport:keys --force

    echo "👤 Creating client..."
    php artisan passport:client --personal --no-interaction

    echo "🌱 Seeding database..."
    php artisan db:seed --force

    # ساخت فایل نشانه برای دفعه بعد
    touch storage/.passport_installed
else
    # اگر نصب قبلا انجام شده، فقط تغییرات جدید را اعمال کن
    echo "🔄 Existing install detected. Running standard migrations..."
    php artisan migrate --force
fi

echo "✅ Setup complete. Starting PHP-FPM..."
exec "$@"