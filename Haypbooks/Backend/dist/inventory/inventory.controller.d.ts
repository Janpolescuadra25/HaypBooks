import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly service;
    constructor(service: InventoryService);
    createItem(req: any, payload: any): Promise<import(".prisma/client").Item>;
    getItem(id: string): Promise<import(".prisma/client").Item>;
    listItems(req: any, query: any): Promise<import(".prisma/client").Item[]>;
    createLocation(req: any, payload: any): Promise<import(".prisma/client").StockLocation>;
    receive(req: any, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    ship(req: any, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    transfer(req: any, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
    adjust(req: any, payload: any): Promise<import(".prisma/client").InventoryTransaction>;
}
