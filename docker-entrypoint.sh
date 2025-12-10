#!/bin/sh

echo "Generating config.js..."

cat <<EOF > /usr/local/apache2/htdocs/config.js
window.globalConfig = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}",
  VITE_STORAGE_BASE_URL: "${VITE_STORAGE_BASE_URL}",
  VITE_PUSHER_APP_KEY: "${VITE_PUSHER_APP_KEY}",
  VITE_PUSHER_APP_CLUSTER: "${VITE_PUSHER_APP_CLUSTER}",
  VITE_PUSHER_HOST: "${VITE_PUSHER_HOST}",
  VITE_PUSHER_PORT: "${VITE_PUSHER_PORT}",
  VITE_PUSHER_FORCE_TLS: "${VITE_PUSHER_FORCE_TLS}",
  VITE_AUTH_MODE: "${VITE_AUTH_MODE}"
};
EOF

echo "Config generated successfully."

exec httpd-foreground