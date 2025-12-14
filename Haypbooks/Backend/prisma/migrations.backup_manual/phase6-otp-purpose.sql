-- Phase 6: Add purpose column to Otp for RESET/VERIFY differentiation

ALTER TABLE "Otp" ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'RESET';
