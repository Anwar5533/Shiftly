# SHIFTLY Disaster Recovery & Incident Response Runbook

## 1. Database Failure & Restoration

Shiftly uses PostgreSQL managed by an infrastructure provider (e.g., AWS RDS).
**RTO:** 1 hour | **RPO:** 5 minutes

### Procedure:

1. Identify if the outage is hardware-level or data-corruption.
2. For hardware failures, trigger an automated Multi-AZ failover in the AWS console.
3. For data corruption, restore from the latest automated snapshot.
4. Update the `DATABASE_URL` in the centralized secret manager.
5. Perform a rolling restart of all services.

## 2. Kafka / Event Bus Outage

The Outbox pattern guarantees no events are lost if Kafka goes down, but messages will accumulate in the `outbox_events` table.

### Procedure:

1. Restart the unhealthy Kafka brokers.
2. Once Kafka is healthy, the `OutboxService` cron jobs in each microservice will automatically resume publishing the backlogged events in order.
3. Monitor the Outbox pending count. If it exceeds 10,000, temporarily increase the cron frequency or batch size in the environment variables and redeploy to flush the queue faster.

## 3. Bad Deployment Rollback

If a deployment introduces a critical regression:

### Procedure:

1. Revert the commit in GitHub to restore the previous state.
2. The CI/CD pipeline will automatically build and deploy the reverted image.
3. **If a database migration caused the issue:** Refer to `migration-runbook.md` to safely write and deploy a down-migration. Do not manually manipulate production schema without Prisma.
