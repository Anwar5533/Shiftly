# 🏗️ Build, Docker, and CI/CD Pipeline Walkthrough

## What I accomplished

I have successfully resolved all outstanding TypeScript compilation and Prisma validation errors, fully dockerized the applications, and set up a robust CI/CD pipeline! 🎉

### 1. Fixed Prisma `multiSchema` Validation
- Re-added `multiSchema` back to `previewFeatures`.
- Reformed the `schemas = [...]` array to be on a single line in `apps/api/prisma/schema.prisma` to work around a parser bug.
- Executed a script to programmatically inject the `@@schema("...")` attribute into all 22 Prisma `enum` declarations, resolving the `P1012` schema validation errors.

### 2. Resolved API TypeScript & Linting Errors
- Fixed type issues in `HealthController`, `GlobalExceptionFilter`, and `@shiftly/shared-validation`.
- Fixed formatting issues across the codebase so `pnpm format:check` and `pnpm lint` pass cleanly.

### 3. Dockerized the Monorepo
- Optimized `Dockerfile.api` and `Dockerfile.web` using `turbo prune`.
- Fixed the `pnpm install` failure in Docker by moving `prisma generate` to the `apps/api` local `postinstall` script and copying the `schema.prisma` file early in the Docker build process.
- Fixed the `turbo run build` failure in Docker by explicitly declaring the shared workspace packages (`@shiftly/shared-types`, etc.) as dependencies in `apps/api/package.json`.

### 4. CI/CD Pipeline Configuration
- Set up a robust **CI Pipeline** (`.github/workflows/ci.yml`) that runs linting, type checks, unit tests, integration tests, security scans, and builds the Docker images using `buildx`.
- Set up an automated **CD Pipeline** (`.github/workflows/deploy.yml`) utilizing a strict, branch-based environment promotion strategy.
- Created and pushed the environment branches to GitHub:
  - `release-dev` -> Deploys to DEV
  - `release-uat` -> Deploys to UAT
  - `release-mo` -> Deploys to Model Office (MO)
  - `release-prod` -> Deploys to Production (PROD)

> [!TIP]
> To deploy new code, simply merge a Pull Request into one of the `release-*` branches. GitHub Actions will automatically handle the build and deployment process!
