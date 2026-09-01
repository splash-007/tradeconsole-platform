# Trade Console — Backend

This directory is reserved for the Trade Console backend API.

## Architecture

```
Browser
  ↓
Trade Console Frontend (this repo /src)
  ↓ HTTPS
Trade Console API (this directory — external development)
  ↓
PostgreSQL + Valkey
```

## Status

The backend is developed externally and deployed to our VPS.

**Do not generate mock backend code here.**
**Do not add Supabase.**
**Do not connect directly to PostgreSQL from the frontend.**

## API Contract

The frontend communicates with the backend exclusively through:

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/session
GET  /api/v1/...
```

All API calls go through `src/lib/api-client.ts` using the `NEXT_PUBLIC_API_BASE_URL` environment variable.

## Authentication

The backend will handle:
- Argon2id password hashing
- HTTP-only secure session cookies
- Session storage in Valkey
- Role and permission enforcement
- PostgreSQL user records

## Environment

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to point to the VPS API URL.
