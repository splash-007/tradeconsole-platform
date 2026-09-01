# Trade Console

Professional trading terminal frontend — built with Next.js 15, TypeScript, and Tailwind CSS.

## Architecture

```
Trade Console Frontend (this repo)
        ↓ HTTPS API
Trade Console Backend (VPS — external)
        ↓
PostgreSQL + Valkey
```

The frontend **never** connects directly to PostgreSQL. All data flows through the backend API.

## Repository Structure

```
tradeconsole-platform/
│
├── src/                     ← Next.js frontend (canonical location)
├── public/
│
├── backend/
│   └── README.md            ← Reserved for VPS backend (external development)
│
├── database/
│   ├── migrations/          ← PostgreSQL migrations (backend team)
│   ├── seeds/               ← Development seed data
│   └── README.md
│
├── packages/
│   └── shared/              ← Future shared contracts (DTOs, enums, types)
│
├── docs/                    ← Architecture documentation
├── infra/                   ← Docker, Nginx, deployment templates
├── scripts/                 ← Deployment, migration, maintenance scripts
│
├── package.json
├── next.config.mjs
├── tsconfig.json
└── .env.example
```

## Getting Started

```bash
cp .env.example .env.local
# Edit .env.local with your values

pnpm install
pnpm dev
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_AUTH_MODE` | `disabled` (dev) or `api` (prod) | `disabled` |
| `NEXT_PUBLIC_DATA_MODE` | `mock` (dev) or `api` (prod) | `mock` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | — |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for realtime | — |
| `NEXT_PUBLIC_DEV_ROLE` | Dev role for UI testing | `customer` |

## Development Mode

When `NEXT_PUBLIC_AUTH_MODE=disabled`:
- All routes are directly accessible without login
- Root `/` redirects to `/trading-dashboard`
- Login/register UI is preserved but not required
- **⚠️ DEVELOPMENT ONLY — do not use with real data**

## Production Mode

When `NEXT_PUBLIC_AUTH_MODE=api`:
- Full session-based authentication via backend API
- HTTP-only secure cookies (set by backend)
- Role-based route protection enforced in middleware

## Build

```bash
pnpm install
pnpm build
```

## Docs

See `/docs` for full database architecture, API requirements, and role/permission model.