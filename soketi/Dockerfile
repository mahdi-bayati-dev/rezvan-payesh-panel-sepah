# استفاده از نسخه Debian Slim به جای Alpine برای رفع مشکل ld-linux
FROM node:18-slim

WORKDIR /app

# نصب ابزارهای بیلد که گاهی برای کامپایل ماژول‌های native نیاز است
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# نصب سوکتی
RUN npm install -g @soketi/soketi

# پورت داخلی کانتینر (همیشه ۶۰۰۱ است)
EXPOSE 6001

CMD ["soketi", "start"]