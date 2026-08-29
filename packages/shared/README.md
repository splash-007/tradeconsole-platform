# @cryonfx/shared

Shared contracts package for the CryonFX platform.

## Purpose

This package will eventually contain safe contracts shared by the CryonFX frontend (`apps/web`) and backend (`apps/api`).

## Planned contents

- **DTOs** — Data Transfer Objects for API request/response shapes
- **Zod schemas** — Runtime validation schemas shared across frontend and backend
- **Role constants** — Platform role keys (e.g. `ROLE_ADMIN`, `ROLE_BROKER`)
- **Permission constants** — Permission key definitions
- **Enums** — Canonical status/type enumerations
- **API contracts** — Typed endpoint definitions

## Current status

Foundation only. No types have been migrated yet.

Types will be migrated progressively once the real CryonFX API is connected and the backend contracts are stabilised.

## Rules

- Do **not** place secrets or backend-only code here
- Do **not** import Node.js-only modules here
- Do **not** import browser-only APIs here
- This package must remain isomorphic (safe to import in both environments)
