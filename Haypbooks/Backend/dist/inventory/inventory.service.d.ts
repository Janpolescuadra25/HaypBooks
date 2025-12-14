import { PrismaService } from '../repositories/prisma/prisma.service';
import { JournalService } from '../accounting/journal.service';
export declare class InventoryService {
    private readonly prisma;
    private readonly journal;
    constructor(prisma: PrismaService, journal: JournalService);
    createItem(tenantId: string, payload: any): Promise<import(".prisma/client").Item>;
    getItem(id: string): Promise<import(".prisma/client").Item>;
    listItems(tenantId: string, filter?: any): Promise<import(".prisma/client").Item[]>;
    createStockLocation(tenantId: string, payload: any): Promise<import(".prisma/client").StockLocation>;
    getStockLevel(tenantId: string, itemId: string, stockLocationId: string): Promise<import(".prisma/client").StockLevel | null>;
    ensureStockLevel(tx: any, tenantId: string, itemId: string, stockLocationId: string, companyId?: string | null): Promise<any>;
    receiveStock(tenantId: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    shipStock(tenantId: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    transferStock(tenantId: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    adjustStock(tenantId: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
}
