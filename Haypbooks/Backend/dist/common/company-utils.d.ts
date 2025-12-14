import { PrismaClient } from '@prisma/client';
export declare function assertCompanyBelongsToTenant(prisma: PrismaClient, companyId: string | null | undefined, tenantId: string): Promise<void>;
