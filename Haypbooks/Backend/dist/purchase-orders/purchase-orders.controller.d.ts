import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private readonly svc;
    constructor(svc: PurchaseOrdersService);
    create(req: any, payload: any): Promise<import(".prisma/client").PurchaseOrder>;
    receive(req: any, id: string, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
}
