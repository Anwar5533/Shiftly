-- Create primary unified multi-schema database
CREATE DATABASE shiftly;

\c shiftly;

-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Pre-create schemas used across services so cross-schema queries succeed
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS workers;
CREATE SCHEMA IF NOT EXISTS employers;
CREATE SCHEMA IF NOT EXISTS recruiters;
CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS applications;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS kyc;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS subscriptions;
CREATE SCHEMA IF NOT EXISTS reviews;
CREATE SCHEMA IF NOT EXISTS messaging;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS referrals;
CREATE SCHEMA IF NOT EXISTS knowledge_base;

-- Retain service-specific databases for backward compatibility
CREATE DATABASE shiftly_identity;
CREATE DATABASE shiftly_users;
CREATE DATABASE shiftly_jobs;
CREATE DATABASE shiftly_applications;
