# Trade Console Platform

Trade Console is a full-stack trading and CRM platform for forex/crypto brokerages.

This repository is structured as a **pnpm monorepo**.

---

## Repository Structure

```
tradeconsole-platform/
│
├── apps/
│   ├── web/                  # Trade Console frontend (Next.js 15 / React 19)
│   └── api/                  # Trade Console backend API (imported separately)
│
├── packages/
│   └── shared/               # Shared contracts, DTOs, schemas, enums
│
├── docs/                     # Architecture, database & API documentation
│   ├── DATABASE_RECOMMENDATION.md
│   ├── DATABASE_TABLES_AND_FIELDS.md
│   ├── DATABASE_RELATIONSHIPS.md
│   ├── ROLE_PERMISSION_DATABASE_MODEL.md
│   ├── API_REQUIREMENTS.md
│   ├── FRONTEND_BACKEND_MAPPING.md
│   ├── ENUMS_AND_STATUSES.md
│   ├── REALTIME_REQUIREMENTS.md
│   ├── DATABASE_OPEN_QUESTIONS.md
│   └── database-reference.json
│
├── infra/                    # Deployment & infrastructure configuration
│
├── .github/
│   └── workflows/            # CI/CD workflows (configured separately)
│
├── pnpm-workspace.yaml       # pnpm workspace definition
├── package.json              # Root workspace package
├── .gitignore
└── README.md
```

---

## Applications

### `apps/web` — Trade Console Web Application

Rocket-built customer, staff and admin web application.

Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

Includes:
- Customer trading dashboard, markets, portfolio, watchlist
- Admin Panel with full CRM, operations, finance, compliance, marketing
- Staff role dashboards (Broker, Agent, Manager, Compliance, Finance, etc.)
- Real-time market data via Binance WebSocket + CoinGecko
- Internal staff chat and customer support chat
- KYC / verification flows
- Role-based access control (23 roles)

### `apps/api` — Trade Console Backend API

Trade Console Node.js / TypeScript backend — imported separately.

See `apps/api/README.md`.

---

## Packages

### `packages/shared` — Shared Contracts

Will contain DTOs, Zod schemas, role/permission constants, enums, and API contracts shared between frontend and backend.

See `packages/shared/README.md`.

---

## Documentation

All architecture and database documentation lives in `/docs`.

Key documents:
- `DATABASE_RECOMMENDATION.md` — 62-table PostgreSQL architecture overview
- `DATABASE_TABLES_AND_FIELDS.md` — Complete field definitions for all tables
- `API_REQUIREMENTS.md` — Full REST API specification
- `ROLE_PERMISSION_DATABASE_MODEL.md` — 23 roles, 3-layer permission model
- `FRONTEND_BACKEND_MAPPING.md` — Every page mapped to its API calls and DB tables

---

## Infrastructure

Deployment configuration lives in `/infra`.

See `infra/README.md` for planned contents.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

Install pnpm if not already installed:

```bash
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

### Start the frontend (development)

```bash
pnpm dev
```

This starts the Trade Console web application at [http://localhost:4028](http://localhost:4028).

### Build the frontend

```bash
pnpm build
```

### Additional workspace scripts

```bash
pnpm dev:web          # Start frontend dev server
pnpm build:web        # Build frontend for production
pnpm start:web        # Start frontend production server
pnpm lint:web         # Lint frontend
pnpm type-check:web   # TypeScript check frontend
```

---

## Environment Variables

Copy the example environment file and configure for your environment:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Key variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Trade Console backend API URL |
| `NEXT_PUBLIC_APP_BASE_URL` | Frontend application URL |
| `NEXT_PUBLIC_DATA_MODE` | `mock` for development, `api` for production |

**Never commit `.env` files with real secrets.**

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 |
| UI library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts, Lightweight Charts |
| Real-time market data | Binance WebSocket, CoinGecko API |
| Backend (planned) | Node.js / TypeScript |
| Database (planned) | PostgreSQL 17 |
| Cache / Presence (planned) | Valkey |
| Infrastructure | Ubuntu VPS, Docker, Nginx |

---

Built with [Rocket.new](https://rocket.new)