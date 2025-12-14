import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTask(tenantId: string, payload: any): Promise<import(".prisma/client").Task>;
    listTasks(tenantId: string, opts?: any): Promise<import(".prisma/client").Task[]>;
    getTask(tenantId: string, id: string): Promise<(import(".prisma/client").Task & {
        comments: import(".prisma/client").TaskComment[];
    }) | null>;
    updateTask(tenantId: string, id: string, payload: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addComment(tenantId: string, taskId: string, userId: string, comment: string): Promise<import(".prisma/client").TaskComment>;
    markReminderSent(taskId: string): Promise<import(".prisma/client").Task>;
}
