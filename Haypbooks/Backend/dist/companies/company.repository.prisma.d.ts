import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class CompanyRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<import(".prisma/client").Tenant>;
    findById(id: string): Promise<import(".prisma/client").Tenant | null>;
    findForUser(userId: string): Promise<import(".prisma/client").Tenant[]>;
    update(id: string, data: any): Promise<import(".prisma/client").Tenant>;
}
