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
# Markdown for Agents: requests with Accept: text/markdown get index.md
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

    set $agent_link_header '</.well-known/api-catalog>; rel="api-catalog service-desc"; type="application/linkset+json", </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="service-doc describedby"; type="text/markdown", </sitemap-index.xml>; rel="describedby"; type="application/xml"';

    # Agent discovery: advertise resources via RFC 8288 Link headers.
    add_header Link $agent_link_header always;
    add_header Vary "Accept" always;

    location = / {
        if ($serve_markdown) {
            rewrite ^ /index.md last;
        }
        try_files /index.html =404;
    }

    location = /index.html {
        if ($serve_markdown) {
            rewrite ^ /index.md last;
        }
        try_files /index.html =404;
    }

    location = /index.md {
        types {}
        default_type text/markdown;
        charset utf-8;
        add_header Link $agent_link_header always;
        add_header Vary "Accept" always;
        add_header x-markdown-tokens "1184" always;
        try_files /index.md =404;
    }

    location = /llms.txt {
        types {}
        default_type text/markdown;
        charset utf-8;
        try_files /llms.txt =404;
    }

    location = /.well-known/api-catalog {
        types {}
        default_type application/linkset+json;
        charset utf-8;
        try_files /.well-known/api-catalog =404;
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
