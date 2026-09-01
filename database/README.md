# Trade Console — Database

This directory is reserved for PostgreSQL migration and seed files.

## Structure

```
database/
├── migrations/   ← PostgreSQL migration scripts (managed by backend team)
├── seeds/        ← Development seed data
└── README.md
```

## Status

Migration files will be added by the backend development team.

**Do not generate Supabase migrations here.**
**Do not connect a database from the frontend.**
**The frontend never accesses PostgreSQL directly.**

## Reference

See `/docs` for the full database architecture documentation:

- `DATABASE_RECOMMENDATION.md`
- `DATABASE_TABLES_AND_FIELDS.md`
- `DATABASE_RELATIONSHIPS.md`
- `ROLE_PERMISSION_DATABASE_MODEL.md`
- `ENUMS_AND_STATUSES.md`
- `database-reference.json`
