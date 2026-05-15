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

cat > /etc/nginx/sites-available/portfolio <<'NGINX'
# Markdown for Agents: requests with Accept: text/markdown get llms.txt
# as the markdown alternate of the homepage.
map $http_accept $serve_markdown {
    default            0;
    "~*text/markdown"  1;
}

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN__;

    root __DEPLOY_ROOT__/current;
    index index.html;

    access_log /var/log/nginx/portfolio.access.log;
    error_log /var/log/nginx/portfolio.error.log;

    # Agent discovery: advertise resources via RFC 8288 Link headers on
    # every successful response (also exposed via "always" on errors).
    add_header Link '</llms.txt>; rel="service-doc"; type="text/markdown", </sitemap-index.xml>; rel="sitemap", </CV_Neftali_Odin_Garcia.pdf>; rel="alternate"; type="application/pdf", </robots.txt>; rel="describedby"' always;
    add_header Vary "Accept" always;

    location = / {
        if ($serve_markdown) {
            rewrite ^ /llms.txt last;
        }
        try_files /index.html =404;
    }

    location = /llms.txt {
        default_type text/markdown;
        charset utf-8;
        add_header Content-Type "text/markdown; charset=utf-8" always;
        add_header Link '</>; rel="canonical"; type="text/html"' always;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:css|js|mjs|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|pdf)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }
}
NGINX

sed -i "s|__DOMAIN__|${DOMAIN}|g; s|__DEPLOY_ROOT__|${DEPLOY_ROOT}|g" /etc/nginx/sites-available/portfolio

ln -sfn /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "VM ready. Add your GitHub Actions public deploy key to /home/${DEPLOY_USER}/.ssh/authorized_keys."
