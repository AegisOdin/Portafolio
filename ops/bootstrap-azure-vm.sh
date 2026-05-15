#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-_}"
DEPLOY_USER="${2:-deploy}"
DEPLOY_ROOT="${3:-/var/www/portfolio}"

if [ "${EUID}" -ne 0 ]; then
  echo "Run this script with sudo."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_TEMPLATE="${SCRIPT_DIR}/nginx/portfolio.conf"
SUDOERS_SRC="${SCRIPT_DIR}/sudoers.d/portfolio-deploy"

if [ ! -f "${NGINX_TEMPLATE}" ]; then
  echo "Missing nginx template at ${NGINX_TEMPLATE}"
  exit 1
fi

apt-get update
apt-get install -y nginx rsync ufw certbot python3-certbot-nginx

if ! id -u "${DEPLOY_USER}" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "${DEPLOY_USER}"
fi

mkdir -p "${DEPLOY_ROOT}/releases/initial"
printf '%s\n' "Deployment pending." > "${DEPLOY_ROOT}/releases/initial/index.html"
ln -sfnT "${DEPLOY_ROOT}/releases/initial" "${DEPLOY_ROOT}/current"

chown -R "${DEPLOY_USER}:www-data" "${DEPLOY_ROOT}"
find "${DEPLOY_ROOT}" -type d -exec chmod 775 {} \;
find "${DEPLOY_ROOT}" -type f -exec chmod 664 {} \;

mkdir -p /var/www/letsencrypt

# Render nginx template with domain + deploy root substituted.
sed -e "s|__DOMAIN__|${DOMAIN}|g" \
    -e "s|__DEPLOY_ROOT__|${DEPLOY_ROOT}|g" \
    "${NGINX_TEMPLATE}" \
    > /etc/nginx/sites-available/portfolio

ln -sfn /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default

# Install sudoers entry that lets CI sync the nginx config later.
if [ -f "${SUDOERS_SRC}" ]; then
  install -m 0440 -o root -g root "${SUDOERS_SRC}" /etc/sudoers.d/portfolio-deploy
  visudo -c -f /etc/sudoers.d/portfolio-deploy >/dev/null
fi

# If the cert is not present yet, fall back to an HTTP-only stub so
# `nginx -t` does not fail on first bootstrap. Re-render after certbot.
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  cat > /etc/nginx/sites-available/portfolio <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${DOMAIN} www.${DOMAIN} _;
    root ${DEPLOY_ROOT}/current;
    index index.html;
    location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { try_files \$uri \$uri/ /index.html; }
}
NGINX
fi

nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

cat <<EOF

VM bootstrap complete.

Next steps:

  1. Point DNS A/AAAA records for ${DOMAIN} AND www.${DOMAIN} to this VM.
  2. Request TLS certificates for both names:

       sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \\
         --redirect --hsts --staple-ocsp -m odingarra@gmail.com --agree-tos -n

  3. Re-render the full nginx config once the cert exists:

       sudo sed -e 's|__DOMAIN__|${DOMAIN}|g' \\
                -e 's|__DEPLOY_ROOT__|${DEPLOY_ROOT}|g' \\
                ${NGINX_TEMPLATE} \\
         | sudo tee /etc/nginx/sites-available/portfolio >/dev/null
       sudo nginx -t && sudo systemctl reload nginx

  4. Add the GitHub Actions deploy public key to /home/${DEPLOY_USER}/.ssh/authorized_keys.
EOF
