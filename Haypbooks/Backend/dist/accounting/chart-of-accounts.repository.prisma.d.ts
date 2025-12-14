import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class ChartOfAccountsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, payload: any): Promise<import(".prisma/client").Account>;
    listForCompany(companyId: string): Promise<import(".prisma/client").Account[]>;
    findById(id: string): Promise<import(".prisma/client").Account | null>;
}
