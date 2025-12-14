import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createInvoice(companyId: string, payload: any): Promise<import(".prisma/client").Invoice>;
    getInvoice(id: string): Promise<(import(".prisma/client").Invoice & {
        lines: import(".prisma/client").InvoiceLine[];
    }) | null>;
}
