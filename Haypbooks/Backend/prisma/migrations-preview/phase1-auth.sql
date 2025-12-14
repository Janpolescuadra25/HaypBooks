-- Phase 1 migration: Authentication + OTP
-- Run with: psql $DATABASE_URL -f phase1-auth.sql

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL UNIQUE,
  name TEXT NULL,
  passwordHash TEXT NOT NULL,
  isEmailVerified BOOLEAN NOT NULL DEFAULT false,
  resetToken TEXT NULL,
  resetTokenExpiry BIGINT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_session_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_idx ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "Otp" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL,
  "otpCode" VARCHAR(16) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS otp_email_idx ON "Otp"(email);
