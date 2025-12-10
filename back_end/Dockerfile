FROM php:8.2-fpm

# نصب پکیج‌های ضروری و اکستنشن‌ها
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libhiredis-dev \
    default-mysql-client

# نصب اکستنشن‌های PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# نصب و فعال‌سازی Redis
RUN pecl install redis && docker-php-ext-enable redis

# نصب Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# تنظیم دایرکتوری کاری
WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts


# کپی کردن سورس کد
COPY . .

# نصب وابستگی‌های لاراول
RUN composer dump-autoload --optimize

# تنظیم پرمیشن‌های پوشه‌های ذخیره‌سازی
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache