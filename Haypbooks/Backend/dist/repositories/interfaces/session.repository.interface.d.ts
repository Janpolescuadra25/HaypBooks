export interface Session {
    id: string;
    userId: string;
    refreshToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    revoked?: boolean;
    lastUsedAt?: number | Date | null;
    expiresAt: number | Date;
    createdAt?: Date;
}
export interface ISessionRepository {
    create(data: Partial<Session>): Promise<Session>;
    findByRefreshToken(token: string): Promise<Session | null>;
    findByUserId(userId: string, includeRevoked?: boolean): Promise<Session[]>;
    delete(id: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<number>;
}
