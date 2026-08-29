# GitHub Actions Workflows

This directory is reserved for CryonFX CI/CD workflows.

## Planned workflows

### `deploy-web.yml`
Deploys the CryonFX frontend (`apps/web`) to the VPS on push to `main`.

Steps will include:
- Install dependencies (`pnpm install`)
- Build frontend (`pnpm build:web`)
- SSH deploy to VPS target directory
- Reload Nginx / PM2

### `deploy-api.yml`
Deploys the CryonFX API (`apps/api`) to the VPS on push to `main`.

Steps will include:
- Install dependencies
- Build TypeScript
- SSH deploy to VPS target directory
- Restart API process manager

## Configuration required before activating workflows

The following GitHub repository secrets must be configured:

```
VPS_HOST          — VPS IP address or hostname
VPS_USER          — SSH user
VPS_SSH_KEY       — Private SSH key (PEM format)
VPS_WEB_DIR       — Deployment directory for frontend
VPS_API_DIR       — Deployment directory for API
```

## Current status

Workflows are NOT yet active. This file is a documentation placeholder only.

Do not activate deployment workflows until SSH secrets, deployment directories, and rollback behaviour have been reviewed and configured.
