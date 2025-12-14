import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class BillsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createBill(tenantId: string, payload: any): Promise<import(".prisma/client").Bill>;
    getBill(id: string): Promise<import(".prisma/client").Bill & {
        lines: import(".prisma/client").BillLine[];
        payments: import(".prisma/client").BillPayment[];
    }>;
    listBills(tenantId: string, filter?: any): Promise<(import(".prisma/client").Bill & {
        lines: import(".prisma/client").BillLine[];
        payments: import(".prisma/client").BillPayment[];
    })[]>;
    applyPayment(tenantId: string, billId: string, amount: number, payload: any): Promise<import(".prisma/client").BillPayment>;
}
