# SHIFTLY Database Migration Runbook

## Overview
Shiftly uses Prisma as the ORM for managing PostgreSQL schema changes. Migrations are executed automatically when deploying containers.

## Execution Strategy
The `Dockerfile` is configured to run database migrations automatically upon container startup before the Node application starts. 
```sh
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

## Best Practices
1. **Never mutate old migrations:** Once a migration has been applied to production, never alter the SQL files in `prisma/migrations`.
2. **Backwards Compatibility:** Always ensure schema changes are backwards-compatible (e.g., adding a new column must allow `NULL` or provide a `DEFAULT` until code is fully updated).
3. **Do not drop columns immediately:** If deprecating a column, remove its usage in the application first, deploy, and then drop the column in a subsequent release.

## Rollback Procedure
Because `prisma migrate deploy` does not support automatic down-migrations, rolling back a schema change requires:
1. Writing a new Prisma migration containing the reverse SQL operations.
2. Generating the Prisma client.
3. Deploying the new "rollback" migration forward.

In case of a severe failure, database-level restore from snapshots should be used.

## Local Development
To create a new migration:
```bash
npx prisma migrate dev --name <descriptive_name>
```
