# 02 Technology Stack

The Shiftly platform relies on a modern, robust, and highly scalable technology stack. This document provides a visual breakdown of the tools, frameworks, and infrastructure used across the monorepo.

## Full Stack Mind Map

![Mermaid Diagram](https://mermaid.ink/svg/eyJjb2RlIjoibWluZG1hcFxuICByb290KChTaGlmdGx5IFRlY2ggU3RhY2spKVxuICAgIEZyb250ZW5kXG4gICAgICBGcmFtZXdvcmtcbiAgICAgICAgUmVhY3QgMThcbiAgICAgICAgVml0ZVxuICAgICAgU3RhdGUgTWFuYWdlbWVudFxuICAgICAgICBSZWR1eCBUb29sa2l0XG4gICAgICAgIFJlYWN0IFF1ZXJ5IChUYW5TdGFjaylcbiAgICAgIFN0eWxpbmcgJiBVSVxuICAgICAgICBUYWlsd2luZCBDU1NcbiAgICAgICAgUmFkaXggVUkgKEhlYWRsZXNzKVxuICAgICAgICBGcmFtZXIgTW90aW9uIChBbmltYXRpb25zKVxuICAgICAgRm9ybXMgJiBWYWxpZGF0aW9uXG4gICAgICAgIFJlYWN0IEhvb2sgRm9ybVxuICAgICAgICBab2RcbiAgICBCYWNrZW5kXG4gICAgICBDb3JlIEZyYW1ld29ya1xuICAgICAgICBOZXN0SlMgKHYxMClcbiAgICAgIEFyY2hpdGVjdHVyZVxuICAgICAgICBEb21haW4tRHJpdmVuIERlc2lnblxuICAgICAgICBNaWNyb3NlcnZpY2VzXG4gICAgICBDb21tdW5pY2F0aW9uXG4gICAgICAgIFJFU1QgQVBJcyAodmlhIEFQSSBHYXRld2F5KVxuICAgICAgICBLYWZrYSAoRXZlbnQtRHJpdmVuKVxuICAgIERhdGEgTGF5ZXJcbiAgICAgIERhdGFiYXNlXG4gICAgICAgIFBvc3RncmVTUUwgKE11bHRpLVNjaGVtYSlcbiAgICAgIE9STVxuICAgICAgICBQcmlzbWFcbiAgICAgIENhY2hpbmdcbiAgICAgICAgUmVkaXNcbiAgICAgIFNlYXJjaFxuICAgICAgICBPcGVuU2VhcmNoXG4gICAgSW5mcmFzdHJ1Y3R1cmVcbiAgICAgIE1vbm9yZXBvIE1hbmFnZW1lbnRcbiAgICAgICAgVHVyYm9yZXBvXG4gICAgICAgIHBucG1cbiAgICAgIENJIC8gQ0RcbiAgICAgICAgR2l0SHViIEFjdGlvbnNcbiAgICAgICAgRG9ja2VyIC8gRG9ja2VyIENvbXBvc2VcbiAgICAgIFRlc3RpbmdcbiAgICAgICAgVml0ZXN0IChGcm9udGVuZClcbiAgICAgICAgSmVzdCAoQmFja2VuZClcbiAgICAgICAgUGxheXdyaWdodCAoRTJFKSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In19)

## Component Breakdown

| Category               | Technology                  | Purpose in Shiftly                                                                                          |
| :--------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Monorepo / Build**   | `pnpm` workspace, Turborepo | Manages dependencies across `apps/*` and `packages/*` and caches builds for extreme speed.                  |
| **Language**           | TypeScript (Node 22)        | Strict type safety enforced across both frontend and backend (`strict: true`).                              |
| **Frontend Framework** | React 18 (via Vite)         | Fast compilation and rendering. Uses Feature-Sliced Design architecture (`src/features/*`).                 |
| **Backend Framework**  | NestJS                      | Enterprise-grade backend structure. Uses decorators, dependency injection, and modular architecture.        |
| **Database**           | PostgreSQL                  | Primary persistent storage. Separated by schemas (e.g., `@@schema("identity")`) for microservice isolation. |
| **ORM**                | Prisma                      | Type-safe database client. Clients are generated into specific `node_modules` paths to avoid collisions.    |
| **Event Broker**       | Apache Kafka                | Handles async service-to-service communication (e.g., `UserCreated`, `JobApplied` events).                  |
| **Search Engine**      | OpenSearch                  | Powers complex search queries, filtering, and full-text search across job listings and candidate profiles.  |
| **Validation**         | Zod                         | Used heavily on both frontend (forms) and backend (shared DTOs).                                            |
| **Cloud Emulation**    | LocalStack                  | Runs locally via Docker to emulate AWS S3 (documents), SES (emails), and SNS (push notifications).          |
