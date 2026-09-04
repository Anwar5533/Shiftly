# Shiftly Engineering Conventions

This file documents the verified engineering conventions and architectural rules of the Shiftly repository. Agents must treat these conventions as the default source of truth unless the repository's actual implementation or an explicit project instruction establishes otherwise.

## Repository Architecture

- **Monorepo Manager**: `pnpm` workspace (v9+).
- **Task Runner**: `turbo` (Turborepo).
- **Language**: TypeScript (`ES2022` target, Node 22).

## Important Directories & Package Boundaries

- `apps/web`: The React/Vite frontend application.
- `apps/api-gateway`: NestJS API Gateway.
- `apps/*-service`: Independent NestJS microservices (e.g., `identity-service`, `jobs-service`, `user-service`).
- `packages/shared-*`: Shared libraries (constants, events, types, validation) imported via `workspace:*` (e.g., `@shiftly/shared-types`).
- `infrastructure/`: Infrastructure configurations and scripts (e.g., Docker, Kafka).
- `k8s/`: Kubernetes manifests.

## Coding Conventions

### TypeScript Conventions
- **Strict Mode**: `strict: true` and `strictNullChecks: true` are enabled across all packages.
- **Linting**: `@typescript-eslint` flat config (`eslint.config.mjs`) is used. Avoid `any` (`@typescript-eslint/no-explicit-any` is configured) and `@ts-ignore` comments.
- **Path Aliases**: 
  - Backend: `@/*` maps to `./src/*`.
  - Shared packages are referenced via `@shiftly/shared-*`.

### Frontend Conventions (apps/web)
- **Framework**: React 18, Vite.
- **State Management**: Redux Toolkit & React Query (`@tanstack/react-query`).
- **Styling**: Tailwind CSS combined with Radix UI headless components. `framer-motion` for animations.
- **Form Handling**: `react-hook-form` with `zod` validation.
- **Architecture**: Feature-sliced design (`src/features/*`, `src/shared/*`, `src/layouts/*`).

### Backend/API Conventions (apps/*)
- **Framework**: NestJS (v10).
- **Communication**: Kafka (`kafkajs`) for event-driven microservice communication.
- **Architecture**: Domain-Driven Design inspired (`src/modules/*`, `src/config/*`, `src/events/*`, `src/infrastructure/*`).
- **Observability**: OpenTelemetry (`@opentelemetry/*`) and Prometheus (`prom-client`).

### Database Conventions
- **ORM**: Prisma (`@prisma/client`).
- **Database Engine**: PostgreSQL.
- **Multi-Schema**: Uses PostgreSQL schemas (e.g., `@@schema("identity")`) and `previewFeatures = ["multiSchema"]`.
- **Client Generation**: Prisma clients are output to specific `node_modules` folders (e.g., `../../../node_modules/@prisma/client-identity-service`) to prevent collisions.
- **Outbox Pattern**: `OutboxEvent` tables are present, indicating a transactional outbox pattern for reliable Kafka event publishing.

## Commands

### Testing Commands
- **Backend Unit**: `pnpm exec jest --testPathPatterns=spec --runInBand`
- **Backend Integration**: `pnpm exec jest --testPathPatterns=e2e-spec --runInBand`
- **Frontend Unit**: `vitest run`
- **Frontend E2E**: `playwright test`
- **Root**: `turbo run test`

### Build / Lint / Typecheck Commands
- **Build**: `turbo run build`
- **Lint**: `turbo run lint` (ESLint) and `pnpm run format` (Prettier).
- **Typecheck**: `turbo run typecheck` (`tsc --noEmit`).
- **Database**: `turbo run db:generate`, `turbo run db:migrate`.

### Git / Change Conventions
- **Commit Format**: Conventional Commits (`@commitlint/config-conventional`).
- **Pre-commit**: Husky runs `lint-staged` ensuring ESLint and Prettier format files automatically upon commit.

## Security Requirements
- **Authentication**: JWT strategy via Passport.js (`@nestjs/jwt`, `passport-jwt`), `bcrypt` for password hashing.
- **Headers & Rate Limiting**: `helmet` and `@nestjs/throttler` in backend apps.
- **Secrets**: Do not expose environment variables or `.env` file contents in code. 

## Files/Directories That Should Not Be Modified
- `pnpm-lock.yaml` (unless adding/removing dependencies via `pnpm`).
- `.turbo/`, `node_modules/`, `dist/`, `out/`, `coverage/`.
- Generated Prisma client directories within `node_modules/`.

## Agent Operating Rules

### 1. Inspect Before Modifying

Before changing code, agents MUST:

1. Identify the affected application/service/package.
2. Inspect the relevant existing implementation.
3. Trace related types, interfaces, API contracts, database models, and events.
4. Search for existing patterns before introducing a new pattern.
5. Determine which tests cover the affected behavior.
6. Only then implement the change.

Do not guess repository structure, APIs, types, event names, database models, or configuration.

### 2. Respect Package Boundaries

- Do not import application-specific code across service boundaries.
- Shared contracts/types must live in the appropriate `packages/shared-*` package.
- Do not duplicate shared types when an existing shared package should be used.
- Microservices communicate through defined APIs/events rather than directly accessing another service's database.
- Do not introduce circular dependencies between packages.

### 3. Database Changes

Before modifying Prisma schemas:

1. Inspect the existing schema and migration history.
2. Check whether the model belongs to the correct PostgreSQL schema.
3. Check existing relations, indexes, constraints, and naming conventions.
4. Determine whether the change requires a migration.
5. Regenerate the appropriate Prisma client after schema changes.

Never manually modify generated Prisma client files.

### 4. Kafka / Event-Driven Architecture

Before creating or modifying an event:

- Search existing event definitions first.
- Reuse existing event contracts where appropriate.
- Shared event contracts belong in the appropriate shared package.
- Preserve existing topic naming conventions.
- Preserve event payload compatibility unless the task explicitly requires a breaking change.
- Consider idempotency and duplicate delivery.
- Respect the transactional outbox pattern where applicable.

Do not introduce direct synchronous service-to-service database access to replace an existing event-driven flow without explicit architectural justification.

### 5. API Changes

Before modifying an API:

- Inspect existing controllers, DTOs, guards, pipes, interceptors, and services.
- Reuse existing validation patterns.
- Preserve authentication and authorization behavior.
- Validate external input using the repository's established Zod/class-validator patterns.
- Consider backward compatibility.
- Update relevant tests.

### 6. Frontend Changes

For `apps/web`:

- Follow the existing feature-sliced architecture.
- Reuse existing components before creating new ones.
- Reuse the existing design system and Radix primitives.
- Follow existing Tailwind conventions.
- Use React Query for server-state concerns where appropriate.
- Use Redux Toolkit only where application/global state is appropriate.
- Use `react-hook-form` + Zod for forms.
- Preserve accessibility.
- Do not introduce a new UI library without explicit approval.
- Do not create duplicate components that already exist elsewhere.

### 7. Error Handling

- Never silently swallow errors.
- Do not use `@ts-ignore` to bypass type errors.
- Do not use `any` to bypass type safety.
- Do not suppress lint rules unless there is a documented reason.
- Preserve meaningful error context.
- Follow existing application error/exception patterns.

### 8. Testing Requirements

Every implementation agent must verify its changes.

At minimum:

- Run the most relevant targeted tests.
- Run typecheck for affected packages.
- Run lint for affected packages.
- Run the relevant build when practical.

For significant cross-package changes, run the appropriate Turbo commands.

Agents MUST distinguish between:

- `VERIFIED` — command executed successfully.
- `FAILED` — command executed and failed.
- `NOT RUN` — intentionally not executed.
- `BLOCKED` — could not execute because of an environment/dependency issue.

Never claim a test, build, lint, or typecheck passed unless it was actually executed.

### 9. Git Safety

Agents must:

- Inspect `git status` before making significant changes.
- Review `git diff` after modifications.
- Avoid modifying unrelated files.
- Never reset, revert, or discard user changes unless explicitly instructed.
- Never force-push.
- Never rewrite Git history unless explicitly instructed.
- Use Conventional Commits when creating commits.

### 10. Secrets and Sensitive Configuration

Agents must never:

- Print `.env` contents.
- Commit secrets, tokens, passwords, private keys, or credentials.
- Hard-code credentials.
- Include secrets in logs, test output, screenshots, or generated documentation.

If a task requires a secret or unavailable environment configuration, report the dependency instead of inventing a value.

### 11. Dependency Changes

Before adding a dependency:

1. Check whether an existing dependency already provides the required capability.
2. Check package ownership and scope.
3. Use the repository's package manager (`pnpm`).
4. Update only the necessary package.
5. Verify the resulting lockfile changes.

Do not add dependencies merely for convenience.

### 12. Scope Control

Agents must make the smallest coherent change required to satisfy the task.

Do not:

- Perform unrelated refactors.
- Rename unrelated files.
- Rewrite working architecture.
- Reformat unrelated files.
- Upgrade dependencies without explicit justification.
- Modify infrastructure unless required by the task.

### 13. Verification Before Completion

Before declaring a task complete, the implementation agent must verify:

- The requested behavior was implemented.
- Existing behavior was not unnecessarily broken.
- Types compile.
- Relevant tests pass.
- Relevant lint checks pass.
- The final diff contains only intentional changes.

The final response must summarize:

1. What changed.
2. Files/packages affected.
3. Verification performed.
4. Any remaining risks or limitations.
