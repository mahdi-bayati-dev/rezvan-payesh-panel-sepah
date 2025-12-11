FROM node:18-alpine

# تنظیم میرور NPM
RUN npm config set registry https://registry.npmmirror.com/

# نصب پیش‌نیازهای بیلد (پایتون، کامپایلرها و گیت)
# >>> کلمه git به انتهای این خط اضافه شد <<<
RUN apk add --no-cache python3 make g++ git

# نصب خود سوکتی
RUN npm install -g @soketi/soketi

# پورت پیش‌فرض
EXPOSE 6001

# دستور اجرا
CMD ["soketi", "start"]