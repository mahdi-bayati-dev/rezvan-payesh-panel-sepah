FROM php:8.2-fpm

# ۱. تغییر مخازن به میرِر (برای رفع کندی apt در ایران)
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    default-mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ۲. اضافه کردن اینستالر سریع PHP (جادوی سرعت!)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# ۳. نصب تمام اکستنشن‌ها (هم PHP و هم Redis) با یک دستور
# این دستور نسخه‌های کامپایل شده را نصب می‌کند و نیازی به pecl نیست
RUN install-php-extensions \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    redis

# نصب Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تنظیم دایرکتوری کاری
WORKDIR /var/www

# کپی فایل‌های وابستگی برای استفاده از کش لایه داکر
COPY composer.json composer.lock ./

# نصب پکیج‌های لاراول (بدون اجرای اسکریپت‌ها در این مرحله)
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

# کپی بقیه سورس کد
COPY . .

# اجرای دستورات نهایی لاراول
RUN composer dump-autoload --optimize

# تنظیم دسترسی‌ها
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache