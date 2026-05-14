# CI/CD to Azure VM

This project builds a static Astro site into `dist/` and deploys that folder to an Ubuntu Azure VM running Nginx.

## 1. Prepare Azure networking

In the Azure Portal, open the VM networking settings and allow inbound:

- `22/tcp` for SSH.
- `80/tcp` for HTTP.
- `443/tcp` later, when TLS is configured.

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
sudo bash /tmp/bootstrap-azure-vm.sh neftali-odin.dev deploy /var/www/portfolio
```

If the domain is not pointing to the VM yet, use `_` as the first argument:

```bash
sudo bash /tmp/bootstrap-azure-vm.sh _ deploy /var/www/portfolio
```

The script installs `nginx`, `rsync`, and `ufw`, creates a `deploy` user, and serves `/var/www/portfolio/current`.

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

Push to `main`, or run the workflow manually from `Actions` -> `CI/CD Azure VM`.

The workflow:

1. Installs Node `22.12.0` and pnpm `10.27.0`.
2. Runs `pnpm install --frozen-lockfile`.
3. Runs `pnpm build`.
4. Uploads `dist/` as an artifact.
5. Deploys the artifact to `/var/www/portfolio/releases/<commit-sha>`.
6. Points `/var/www/portfolio/current` at that release.

## Notes

- The current workflow intentionally uses `pnpm build` as the deployment gate.
- `pnpm lint` currently reports pre-existing lint errors, so add it to the workflow only after those are cleaned up.
- `pnpm astro check` requires `@astrojs/check`; install it before adding that command to CI.
