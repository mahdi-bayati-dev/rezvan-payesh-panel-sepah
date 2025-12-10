FROM php:8.2-fpm

# استفاده از اسکریپت نصب‌کننده (برای حل مشکل نصب Redis و اکستنشن‌ها)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# نصب پکیج‌های سیستمی و اکستنشن‌های PHP با هم
# نکته: این دستور خودش وابستگی‌های لینوکسی (مثل libpng و...) را مدیریت می‌کند
RUN install-php-extensions \
    pdo_mysql mbstring exif pcntl bcmath gd redis \
    zip unzip git

# نصب کلاینت MySQL (اگر برای بکاپ‌گیری یا تست لازم دارید)
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

# نصب Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تنظیم دایرکتوری کاری
WORKDIR /var/www

# کپی فایل‌های وابستگی برای استفاده از کش داکر
COPY composer.json composer.lock ./

# نصب پکیج‌های لاراول
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

# کپی کردن سورس کد پروژه
COPY . .

# تنظیم پرمیشن‌های پوشه‌های ذخیره‌سازی
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache