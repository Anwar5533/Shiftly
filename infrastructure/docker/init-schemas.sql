-- SHIFTLY Database Schema Initialisation
-- Creates all PostgreSQL schemas for domain isolation

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS workers;
CREATE SCHEMA IF NOT EXISTS employers;
CREATE SCHEMA IF NOT EXISTS recruiters;
CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS messaging;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS reviews;
CREATE SCHEMA IF NOT EXISTS kyc;
CREATE SCHEMA IF NOT EXISTS referrals;
CREATE SCHEMA IF NOT EXISTS subscriptions;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS knowledge_base;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram index for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
