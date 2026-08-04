# Shiftly Local Development Setup Guide

Welcome to the Shiftly enterprise workforce platform! This guide outlines the exact steps required to set up your local development environment after cloning the repository fresh from GitHub.

## Prerequisites

Before starting, ensure you have the following installed on your macOS:

1. [Node.js](https://nodejs.org/) (v20+ recommended)
2. [pnpm](https://pnpm.io/installation) (Enable via `corepack enable pnpm` or `npm install -g pnpm`)
3. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for running the infrastructure: PostgreSQL, Kafka, Zookeeper, Redis)

---

## Initialization Steps

### 1. Restore Environment Variables

Git safely ignores `.env` files. We have created `.env.example` files containing the correct configurations for all microservices (including isolated database mappings and `PLAINTEXT_HOST` Kafka ports).

Run this command from the root of the repository to copy all `.env.example` files to `.env`:

```bash
# Finds all .env.example files in the apps directory and creates corresponding .env files
find apps -name ".env.example" -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;
```

### 2. Install Dependencies

Install all required Node.js dependencies across the Turborepo workspace.

```bash
pnpm install
```

### 3. Start Infrastructure (Docker)

Start the foundational databases and message brokers. **Docker must be running.**

```bash
docker compose up -d postgres zookeeper kafka
```

Verify that the containers are healthy:

```bash
docker ps
```

_(You should see `postgres` on port `5433`, `kafka` on ports `9092` and `29092`, and `zookeeper` on port `2181`)_

### 4. Initialize the Databases

The Postgres container is configured to automatically create the isolated databases (`shiftly_identity`, `shiftly_users`, `shiftly_jobs`, `shiftly_applications`).

Push the Prisma schemas to create the tables in your local databases:

```bash
pnpm turbo run db:push
```

### 5. Start the Development Servers

With the infrastructure up and dependencies installed, you can now start the microservices and the web UI.

```bash
pnpm turbo run dev
```

Your applications and services will now connect properly to the isolated Docker databases and the Kafka broker at `localhost:29092`.

Happy coding! 🚀
