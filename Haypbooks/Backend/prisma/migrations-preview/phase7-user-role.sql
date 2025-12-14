-- Phase 7: add role column to User so auth service can persist user roles

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
