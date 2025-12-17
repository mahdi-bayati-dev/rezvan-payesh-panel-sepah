#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== شروع فرآیند اعمال تغییرات فایل .env ===${NC}"

# ۱. بررسی وجود فایل .env
if [ ! -f .env ]; then
    echo -e "${RED}خطا: فایل .env یافت نشد!${NC}"
    exit 1
fi

echo -e "${YELLOW}1. در حال بازنشانی کانتینرها با مقادیر جدید...${NC}"
docker-compose up -d

if [ "$(docker ps -q -f name=rezvan_app)" ]; then
    echo -e "${YELLOW}2. در حال پاکسازی کش‌های لاراول (Backend)...${NC}"
    docker exec rezvan_app php artisan config:clear
    docker exec rezvan_app php artisan cache:clear
    docker exec rezvan_app php artisan route:clear
    docker exec rezvan_app php artisan view:clear
    echo -e "${GREEN}✅ کش لاراول با موفقیت پاک شد.${NC}"
else
    echo -e "${RED}⚠️ هشدار: کانتینر rezvan_app در حال اجرا نیست!${NC}"
fi

echo -e "${YELLOW}3. وضعیت فرانت‌ند (Frontend)...${NC}"
echo -e "${GREEN}✅ تغییرات فرانت‌ند به دلیل استفاده از config.js خودکار اعمال شد.${NC}"

echo -e "${BLUE}=== عملیات با موفقیت به پایان رسید ===${NC}"
echo -e "${BLUE}نکته: اگر تغییرات را در مرورگر نمی‌بینید، کش مرورگر خود را پاک کنید (Ctrl+F5).${NC}"