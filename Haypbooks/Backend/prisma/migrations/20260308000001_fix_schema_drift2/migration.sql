-- CreateIndex (missing indexes)
CREATE INDEX IF NOT EXISTS "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeCertification_userId_level_key" ON "PracticeCertification"("userId", "level");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Session_tokenFamily_idx" ON "Session"("tokenFamily");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Session_userId_revoked_idx" ON "Session"("userId", "revoked");

-- AddForeignKey (idempotent via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Session_activeCompanyId_fkey') THEN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_activeCompanyId_fkey" FOREIGN KEY ("activeCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Company_countryId_fkey') THEN
    ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Lease_tenantId_fkey') THEN
    ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Customer"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeUnlockedTool_workspaceId_fkey') THEN
    ALTER TABLE "PracticeUnlockedTool" ADD CONSTRAINT "PracticeUnlockedTool_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeUnlockedTool_companyId_fkey') THEN
    ALTER TABLE "PracticeUnlockedTool" ADD CONSTRAINT "PracticeUnlockedTool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeXpLog_workspaceId_fkey') THEN
    ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeXpLog_userId_fkey') THEN
    ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeXpLog_companyId_fkey') THEN
    ALTER TABLE "PracticeXpLog" ADD CONSTRAINT "PracticeXpLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeCertification_workspaceId_fkey') THEN
    ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeCertification_userId_fkey') THEN
    ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='PracticeCertification_companyId_fkey') THEN
    ALTER TABLE "PracticeCertification" ADD CONSTRAINT "PracticeCertification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='OnboardingData_userId_fkey') THEN
    ALTER TABLE "OnboardingData" ADD CONSTRAINT "OnboardingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
