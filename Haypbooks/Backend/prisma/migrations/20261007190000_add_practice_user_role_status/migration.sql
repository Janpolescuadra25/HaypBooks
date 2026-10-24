-- AlterTable: Add canonical role and status columns to PracticeUser
ALTER TABLE "PracticeUser"
  ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'STAFF',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- Backfill 1: Seed OWNER role and active status for preexisting rows linked to a WorkspaceUser owner
UPDATE "PracticeUser" pu
SET "role" = 'OWNER',
    "status" = COALESCE(NULLIF(wu."status", ''), 'ACTIVE')
FROM "WorkspaceUser" wu
WHERE pu."workspaceId" = wu."workspaceId"
  AND pu."userId" = wu."userId"
  AND wu."isOwner" = true;

-- Backfill 2: Compatibility safeguard for older data — ensure every preexisting practice has at most one deterministic OWNER row
UPDATE "PracticeUser" pu
SET "role" = 'OWNER'
WHERE pu."id" IN (
  SELECT DISTINCT ON (candidate."practiceId") candidate."id"
  FROM "PracticeUser" candidate
  WHERE NOT EXISTS (
    SELECT 1
    FROM "PracticeUser" owner_pu
    WHERE owner_pu."practiceId" = candidate."practiceId"
      AND owner_pu."role" = 'OWNER'
  )
  ORDER BY
    candidate."practiceId" ASC,
    CASE WHEN candidate."status" = 'ACTIVE' THEN 0 ELSE 1 END ASC,
    candidate."id" ASC
);
