# CI/CD to Azure VM

This project builds a static Astro site into `dist/` and deploys that folder to an Ubuntu Azure VM running Nginx.

## 1. Prepare Azure networking

In the Azure Portal, open the VM networking settings and allow inbound:

- `22/tcp` for SSH.
- `80/tcp` for HTTP (used for Let's Encrypt HTTP-01 challenges + the HTTP→HTTPS redirect).
- `443/tcp` for HTTPS.

Make sure DNS A/AAAA records for both the apex (`odingarra.dev`) and `www.odingarra.dev` resolve to the VM. SEMRUSH flags the missing subdomain as a "DNS resolution issue" and as a missing-HSTS warning until both names are reachable over TLS.

## 2. Bootstrap the VM

From this project folder on your Windows machine, copy the bootstrap script to the VM:

```powershell
scp .\ops\bootstrap-azure-vm.sh azureuser@YOUR_VM_PUBLIC_IP:/tmp/bootstrap-azure-vm.sh
```

Then SSH into the VM with your Azure admin user:

```bash
ssh azureuser@YOUR_VM_PUBLIC_IP
```

Run the script:

```bash
sudo bash /tmp/bootstrap-azure-vm.sh odingarra.dev deploy /var/www/portfolio
```

If the domain is not pointing to the VM yet, use `_` as the first argument:

```bash
sudo bash /tmp/bootstrap-azure-vm.sh _ deploy /var/www/portfolio
```

The script installs `nginx`, `rsync`, `ufw`, and `certbot`, creates a `deploy` user, renders the Nginx site from [`ops/nginx/portfolio.conf`](../ops/nginx/portfolio.conf), and installs the sudoers entry from [`ops/sudoers.d/portfolio-deploy`](../ops/sudoers.d/portfolio-deploy) so CI can later install + reload the config without an interactive password.

On a brand-new VM the bootstrap writes an HTTP-only stub until certificates exist. Issue the cert and re-render the full config:

```bash
sudo certbot --nginx -d odingarra.dev -d www.odingarra.dev \
  --redirect --hsts --staple-ocsp -m odingarra@gmail.com --agree-tos -n

sudo sed -e 's|__DOMAIN__|odingarra.dev|g' \
         -e 's|__DEPLOY_ROOT__|/var/www/portfolio|g' \
         /tmp/ops/nginx/portfolio.conf \
  | sudo tee /etc/nginx/sites-available/portfolio >/dev/null
sudo nginx -t && sudo systemctl reload nginx
```

The full template enables HSTS (`max-age=63072000; includeSubDomains; preload`), gzip for HTML/CSS/JS/JSON/SVG/fonts, a `301 /sitemap.xml → /sitemap-index.xml` alias for crawlers like SEMRUSH, and redirects `www` → apex over HTTPS.

## 3. Create a deploy SSH key

From your local machine:

```powershell
ssh-keygen -t ed25519 -C "github-actions-portfolio" -f "$env:USERPROFILE\.ssh\portfolio_azure_deploy"
Get-Content "$env:USERPROFILE\.ssh\portfolio_azure_deploy.pub"
Get-Content "$env:USERPROFILE\.ssh\portfolio_azure_deploy"
```

On the VM, add the public key to the `deploy` user:

```bash
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "PASTE_PUBLIC_KEY_HERE" | sudo tee -a /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Test the key from your local machine:

```powershell
ssh -i "$env:USERPROFILE\.ssh\portfolio_azure_deploy" deploy@YOUR_VM_PUBLIC_IP
```

## 4. Add GitHub repository secrets

In GitHub, go to `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

Create:

- `AZURE_VM_HOST`: VM public IP or DNS name.
- `AZURE_VM_USER`: `deploy`.
- `AZURE_SSH_KEY`: full private key from `portfolio_azure_deploy`.
- `AZURE_VM_PORT`: optional, use `22` if you create it.

## 5. Deploy

Push to `master`, or run the workflow manually from `Actions` -> `Deploy to Azure VM`.

The workflow:

1. Installs Node `22.12.0` and pnpm `10.27.0`.
2. Runs `pnpm install --frozen-lockfile`.
3. Runs `pnpm build`.
4. Uploads `dist/` as an artifact.
5. Deploys the artifact to `/var/www/portfolio/releases/<commit-sha>`.
6. Points `/var/www/portfolio/current` at that release.
7. Renders `ops/nginx/portfolio.conf` with `SITE_DOMAIN` + `DEPLOY_ROOT` substituted, scps it to the VM, then runs `install`, `nginx -t`, and `systemctl reload nginx` via the `portfolio-deploy` sudoers entry. Edit `ops/nginx/portfolio.conf` and push to roll out config changes — no manual SSH needed.

## Notes

- The current workflow intentionally uses `pnpm build` as the deployment gate.
- `pnpm lint` currently reports pre-existing lint errors, so add it to the workflow only after those are cleaned up.
- `pnpm astro check` requires `@astrojs/check`; install it before adding that command to CI.
- The Nginx config (now in [`ops/nginx/portfolio.conf`](../ops/nginx/portfolio.conf)) adds RFC 8288 Link headers, serves `/index.md` for homepage requests with `Accept: text/markdown`, enables gzip for text assets, and emits HSTS on both apex and `www`. The CI workflow syncs it on every push to `master`.
- Pre-existing VMs need the sudoers entry once: `sudo install -m 0440 -o root -g root ops/sudoers.d/portfolio-deploy /etc/sudoers.d/portfolio-deploy && sudo visudo -c -f /etc/sudoers.d/portfolio-deploy`. After that, every deploy keeps Nginx config in sync.
- Validate the SEO-relevant headers:
  - `curl -I https://odingarra.dev/` should show `Strict-Transport-Security`, `Content-Encoding: gzip` (when `Accept-Encoding: gzip` is sent), and the agent-discovery `Link` header.
  - `curl -I https://www.odingarra.dev/` should `301` to the apex.
  - `curl -I https://odingarra.dev/sitemap.xml` should `301` to `/sitemap-index.xml`.
  - `curl -I -H "Accept: text/markdown" https://odingarra.dev/` should return `text/markdown`.
