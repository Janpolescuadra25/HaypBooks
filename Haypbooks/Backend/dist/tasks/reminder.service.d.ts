import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class ReminderService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private timer;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkReminders(): Promise<void>;
    onModuleInit(): void;
    onModuleDestroy(): void;
}
