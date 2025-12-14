import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly svc;
    constructor(svc: AttachmentsService);
    list(tenantId: string, entityType: string, entityId: string): Promise<import(".prisma/client").Attachment[]>;
    create(body: any): Promise<import(".prisma/client").Attachment>;
    remove(id: string): Promise<import(".prisma/client").Attachment>;
}
