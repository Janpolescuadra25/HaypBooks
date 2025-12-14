import { IUserRepository, User } from '../interfaces/user.repository.interface';
export declare class MockUserRepository implements IUserRepository {
    private users;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    findByResetToken(token: string): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
