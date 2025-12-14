import { PrismaService } from './prisma.service';
import { IUserRepository, User } from '../interfaces/user.repository.interface';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
    findByResetToken(token: string): Promise<User | null>;
}
