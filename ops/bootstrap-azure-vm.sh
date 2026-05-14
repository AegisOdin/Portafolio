#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-_}"
DEPLOY_USER="${2:-deploy}"
DEPLOY_ROOT="${3:-/var/www/portfolio}"

if [ "${EUID}" -ne 0 ]; then
  echo "Run this script with sudo."
  exit 1
fi

apt-get update
apt-get install -y nginx rsync ufw

if ! id -u "${DEPLOY_USER}" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "${DEPLOY_USER}"
fi

mkdir -p "${DEPLOY_ROOT}/releases/initial"
printf '%s\n' "Deployment pending." > "${DEPLOY_ROOT}/releases/initial/index.html"
ln -sfnT "${DEPLOY_ROOT}/releases/initial" "${DEPLOY_ROOT}/current"

chown -R "${DEPLOY_USER}:www-data" "${DEPLOY_ROOT}"
find "${DEPLOY_ROOT}" -type d -exec chmod 775 {} \;
find "${DEPLOY_ROOT}" -type f -exec chmod 664 {} \;

cat > /etc/nginx/sites-available/portfolio <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root ${DEPLOY_ROOT}/current;
    index index.html;

    access_log /var/log/nginx/portfolio.access.log;
    error_log /var/log/nginx/portfolio.error.log;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(?:css|js|mjs|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|pdf)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files \$uri =404;
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "VM ready. Add your GitHub Actions public deploy key to /home/${DEPLOY_USER}/.ssh/authorized_keys."
