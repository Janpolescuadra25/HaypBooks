import { PrismaService } from '../repositories/prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
export declare class PurchaseOrdersService {
    private readonly prisma;
    private readonly inventory;
    constructor(prisma: PrismaService, inventory: InventoryService);
    createPurchaseOrder(tenantId: string, payload: any): Promise<import(".prisma/client").PurchaseOrder>;
    receivePurchaseOrder(tenantId: string, purchaseOrderId: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
}
