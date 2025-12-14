import { BillsService } from './bills.service';
export declare class BillsController {
    private readonly billsService;
    constructor(billsService: BillsService);
    create(req: any, payload: any): Promise<import(".prisma/client").Bill>;
    get(id: string): Promise<import(".prisma/client").Bill & {
        lines: import(".prisma/client").BillLine[];
        payments: import(".prisma/client").BillPayment[];
    }>;
    list(req: any, query: any): Promise<(import(".prisma/client").Bill & {
        lines: import(".prisma/client").BillLine[];
        payments: import(".prisma/client").BillPayment[];
    })[]>;
    applyPayment(req: any, billId: string, payload: any): Promise<import(".prisma/client").BillPayment>;
}
