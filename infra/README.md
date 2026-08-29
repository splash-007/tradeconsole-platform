# Infrastructure

This directory will contain CryonFX platform infrastructure configuration and deployment tooling.

## Planned contents

### Docker Compose templates
- `docker-compose.yml` — Local development stack
- `docker-compose.prod.yml` — Production stack (PostgreSQL 17, Valkey, Nginx, API)

### Nginx templates
- `nginx/cryonfx-web.conf` — Web frontend reverse proxy configuration
- `nginx/cryonfx-api.conf` — API reverse proxy configuration
- `nginx/ssl.conf` — SSL/TLS configuration template

### Deployment scripts
- `scripts/deploy-web.sh` — Frontend deployment to VPS
- `scripts/deploy-api.sh` — API deployment to VPS
- `scripts/rollback.sh` — Rollback to previous deployment

### Database backup scripts
- `scripts/backup-postgres.sh` — PostgreSQL backup script
- `scripts/restore-postgres.sh` — PostgreSQL restore script

### Monitoring configuration
- `monitoring/` — Prometheus / Grafana / alerting configuration

## Current status

Placeholder only. The existing VPS infrastructure will be reconciled and documented here separately.

Do NOT create production Docker/Nginx configuration until the infrastructure has been reviewed and approved.
