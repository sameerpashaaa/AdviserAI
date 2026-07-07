# Database Backup & Restore Procedure Guide

Adviser AI utilizes **Supabase Managed Postgres** for data storage. Schema migrations are managed via **Drizzle ORM**. This document details the backup and restore protocols to safeguard database integrity and ensure disaster recovery readiness.

---

## 1. Automated Backups (Supabase)

Supabase performs automatic daily backups for all projects.
- **Free Tier**: Daily backups are retained for **7 days**.
- **Pro Tier**: Daily backups are retained for **7 days**, with an option to enable **Point-in-Time Recovery (PITR)** (recommended for production).
- **Enterprise Tier**: Customizable backup retention policies (up to 30 days or more) and default PITR.

To view or restore an automated daily backup:
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings** -> **Database** -> **Backups**.
3. Under the **Daily Backups** section, you will see a list of available snapshots.
4. Select a backup and click **Restore** (Note: Restoring will overwrite the current database state).

---

## 2. Manual Backup (pg_dump)

Manual backups should be taken before running large DDL migrations, schema changes, or manually altering data in production.

Run the following command to export a compressed SQL file containing schema and data:

```bash
# Set password variable to avoid prompts
$env:PGPASSWORD="your-database-password" # Powershell
# OR
export PGPASSWORD="your-database-password" # Bash

pg_dump -h db.<project-ref>.supabase.co -U postgres -d postgres -p 5432 -F c -b -v -f ./backups/adviserai-backup-$(date +%F).dump
```

*Arguments used:*
- `-F c`: Custom format (compressed binary format, recommended for `pg_restore`).
- `-b`: Include large objects.
- `-v`: Verbose mode.

---

## 3. Manual Restore (pg_restore / psql)

### Restoring to a Local / Scratch Database (Recommended for verification)
To test a backup, restore it to a local container or staging instance first. **Never restore directly to production without verifying the backup file.**

#### Step A: Terminate active connections
Before restoring, terminate any open pools (e.g., pgBouncer, Next.js serverless connections) to avoid resource lockups:
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'postgres' AND pid <> pg_backend_pid();
```

#### Step B: Restore schema and data
For custom format binary files (`.dump`), use `pg_restore`:
```bash
$env:PGPASSWORD="your-target-db-password"

pg_restore -h localhost -U postgres -d adviserai_scratch -p 5432 -v --clean --no-owner --no-privileges ./backups/adviserai-backup-2026-07-07.dump
```
*Arguments used:*
- `--clean`: Clean (drop) database objects before recreating them.
- `--no-owner`: Do not output commands to set ownership of objects to match the original database.
- `--no-privileges`: Prevent restoration of access privileges (grants/revokes).

---

## 4. Disaster Recovery Drill (Verification Run)

To verify the backup-restore pipeline, perform this drill quarterly:

1. **Step 1 (Export)**: Run the manual `pg_dump` command against the Staging database.
2. **Step 2 (Local Spin-up)**: Start a clean Postgres instance locally (e.g., `docker run --name pg-test -e POSTGRES_PASSWORD=test -p 5433:5432 -d postgres`).
3. **Step 3 (Import)**: Create a blank DB named `adviserai_test` in the local instance and run `pg_restore` against it.
4. **Step 4 (Test Connectivity)**: Update local `.env.local` to point to the local test database:
   `DATABASE_URL="postgresql://postgres:test@localhost:5433/adviserai_test"`
5. **Step 5 (Verify)**: Run `npm run type-check` and launch the app locally to ensure all seed tables, user settings, and chats load correctly.
6. **Step 6 (Clean up)**: Destroy the test docker container.
