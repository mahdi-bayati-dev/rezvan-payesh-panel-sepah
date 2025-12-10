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

# ۲. اضافه کردن اینستالر سریع PHP
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# ۳. نصب اکستنشن‌های اصلی (Redis را از اینجا حذف کردم)
# نکته: اگر دانلود باینری فیلتر باشد، این مرحله کمی طول می‌کشد چون کامپایل می‌کند
RUN install-php-extensions \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd

# ۴. نصب دستی Redis از طریق Git (روش مقاوم در برابر تحریم PECL)
# ما سورس را دانلود کرده و در پوشه اکستنشن‌های PHP قرار می‌دهیم تا نصب شود
RUN git clone https://github.com/phpredis/phpredis.git /usr/src/php/ext/redis \
    && docker-php-ext-install redis

# نصب Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تنظیم دایرکتوری کاری
WORKDIR /var/www

# کپی فایل‌های وابستگی
COPY composer.json composer.lock ./

# نصب پکیج‌های لاراول
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

# کپی بقیه سورس کد
COPY . .

# اجرای دستورات نهایی لاراول
RUN composer dump-autoload --optimize

# تنظیم دسترسی‌ها
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache