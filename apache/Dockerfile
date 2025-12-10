# Stage 1: Build React App
FROM node:20-alpine as build-stage
WORKDIR /app
# کپی کردن فایل‌های پکیج جیسون از روت پروژه (چون کانتکست بیلد رو روت میذاریم)
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# خروجی معمولا در پوشه dist یا build قرار میگیره

# Stage 2: Serve with Apache
FROM httpd:2.4-alpine

# کپی تنظیمات
COPY ./apache/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

# کپی کردن فایل‌های بیلد شده فرانت‌اند از مرحله قبل به پوشه پابلیک آپاچی
COPY --from=build-stage /app/dist /usr/local/apache2/htdocs/

COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# تنظیمات httpd.conf (همون کدهای sed خودت)
RUN sed -i \
    -e 's/^#\(LoadModule proxy_module modules\/mod_proxy.so\)/\1/' \
    -e 's/^#\(LoadModule proxy_fcgi_module modules\/mod_proxy_fcgi.so\)/\1/' \
    -e 's/^#\(LoadModule proxy_http_module modules\/mod_proxy_http.so\)/\1/' \
    -e 's/^#\(LoadModule proxy_wstunnel_module modules\/mod_proxy_wstunnel.so\)/\1/' \
    -e 's/^#\(LoadModule rewrite_module modules\/mod_rewrite.so\)/\1/' \
    -e 's/^#\(LoadModule ssl_module modules\/mod_ssl.so\)/\1/' \
    -e 's/^#\(LoadModule headers_module modules\/mod_headers.so\)/\1/' \
    -e 's/^#\(LoadModule socache_shmcb_module modules\/mod_socache_shmcb.so\)/\1/' \
    -e 's/^#\(Include conf\/extra\/httpd-vhosts.conf\)/\1/' \
    -e 's/^#\(Include conf\/extra\/httpd-ssl.conf\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

RUN mkdir -p /usr/local/apache2/conf/certs