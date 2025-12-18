#!/bin/bash

# رنگ‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== شروع فرآیند آپدیت کد و بیلد مجدد ===${NC}"

# ۱. دریافت آخرین تغییرات از گیت (اگر کد روی سرور است و از گیت استفاده می‌کنید)
# git pull origin main

# ۲. بیلد کردن مجدد کانتینرها (بسیار مهم برای اعمال تغییرات کد)
echo -e "${YELLOW}1. در حال ساخت مجدد ایمیج‌ها (Rebuild)...${NC}"
echo -e "${YELLOW}   (این مرحله ممکن است بسته به حجم تغییرات زمان‌بر باشد)${NC}"

# این دستور هم ایمیج‌ها را می‌سازد و هم کانتینرها را با مقادیر جدید env بالا می‌آورد
docker-compose up -d --build

# ۳. پاکسازی کش‌های لاراول (الزامی بعد از آپدیت کد بک‌ند)
if [ "$(docker ps -q -f name=rezvan_app)" ]; then
    echo -e "${YELLOW}2. در حال بهینه‌سازی و پاکسازی کش لاراول...${NC}"

    # اجرای دستورات داخل کانتینر
    docker exec rezvan_app php artisan config:clear
    docker exec rezvan_app php artisan cache:clear
    docker exec rezvan_app php artisan route:clear
    docker exec rezvan_app php artisan view:clear
    docker exec -it rezvan_app php artisan passport:keys --force
    docker exec -it rezvan_app chown -R www-data:www-data /var/www/storage

    # اگر مایگریشن دیتابیس (تغییر در جداول) دارید، خط زیر را از کامنت خارج کنید:
    # docker exec rezvan_app php artisan migrate --force

    echo -e "${GREEN}✅ بک‌ند با موفقیت آپدیت شد.${NC}"
fi

# ۴. پیام برای فرانت‌ند
echo -e "${YELLOW}3. وضعیت فرانت‌ند...${NC}"
echo -e "${GREEN}✅ فرانت‌ند بیلد شد و تغییرات کد اعمال گردید.${NC}"

echo -e "${BLUE}=== تمام شد! سامانه با آخرین تغییرات کد و تنظیمات فعال است ===${NC}"