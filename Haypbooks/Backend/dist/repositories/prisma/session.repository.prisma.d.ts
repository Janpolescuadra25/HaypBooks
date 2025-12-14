import { PrismaService } from './prisma.service';
import { ISessionRepository, Session } from '../interfaces/session.repository.interface';
export declare class PrismaSessionRepository implements ISessionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Session>): Promise<Session>;
    findByRefreshToken(token: string): Promise<Session | null>;
    findByUserId(userId: string, includeRevoked?: boolean): Promise<Session[]>;
    delete(id: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<number>;
}
