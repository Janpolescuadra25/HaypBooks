import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class JournalService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createEntry(companyId: string, payload: {
        date: string;
        description?: string;
        lines: any[];
    }): Promise<import(".prisma/client").JournalEntry>;
}
