-- Remove extra FK not defined in schema.prisma (OnboardingData has no User relation field)
ALTER TABLE "OnboardingData" DROP CONSTRAINT IF EXISTS "OnboardingData_userId_fkey";
