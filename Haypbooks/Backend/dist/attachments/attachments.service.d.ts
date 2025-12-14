import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class AttachmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, entityType: string, entityId: string): Promise<import(".prisma/client").Attachment[]>;
    create(data: {
        tenantId: string;
        entityType: string;
        entityId: string;
        fileUrl: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
        uploadedById?: string;
        description?: string;
    }): Promise<import(".prisma/client").Attachment>;
    softDelete(id: string): Promise<import(".prisma/client").Attachment>;
}
