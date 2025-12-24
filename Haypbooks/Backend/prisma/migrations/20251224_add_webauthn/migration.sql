-- Migration: 20251224_add_webauthn
-- Reconstructed from existing DB schema (safe, idempotent)

CREATE TABLE IF NOT EXISTS "WebAuthnChallenge" (
  id text NOT NULL DEFAULT md5(((random())::text || (clock_timestamp())::text)),
  "userId" text NOT NULL,
  challenge text NOT NULL,
  purpose text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "expiresAt" timestamp NOT NULL,
  CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY (id),
  CONSTRAINT "WebAuthnChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "WebAuthnCredential" (
  id text NOT NULL DEFAULT md5(((random())::text || (clock_timestamp())::text)),
  "userId" text NOT NULL,
  "credentialId" text NOT NULL,
  "publicKey" text NOT NULL,
  transports text,
  "signCount" integer NOT NULL DEFAULT 0,
  name text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "WebAuthnCredential_pkey" PRIMARY KEY (id),
  CONSTRAINT "WebAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);
