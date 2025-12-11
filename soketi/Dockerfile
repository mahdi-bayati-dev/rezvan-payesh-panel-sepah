FROM node:18-alpine

# تنظیم میرور NPM برای سرعت بالا
RUN npm config set registry https://registry.npmmirror.com/

# نصب پیش‌نیازهای بیلد (برای uWebSockets)
RUN apk add --no-cache python3 make g++

# نصب خود سوکتی
RUN npm install -g @soketi/soketi

# پورت پیش‌فرض
EXPOSE 6001

# دستور اجرا
CMD ["soketi", "start"]