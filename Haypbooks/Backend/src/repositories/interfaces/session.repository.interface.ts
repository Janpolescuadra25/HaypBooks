export interface Session {
  id: string
  userId: string
  refreshToken: string
  ipAddress?: string | null
  userAgent?: string | null
  revoked?: boolean
  lastUsedAt?: number | Date | null
  expiresAt: number | Date
  createdAt?: Date
  // Enhanced session fields
  deviceName?: string | null
  revokedReason?: string | null
  tokenFamily?: string | null
  activeCompanyId?: string | null
}

export interface ISessionRepository {
  create(data: Partial<Session>): Promise<Session>
  findById(id: string): Promise<Session | null>
  findByRefreshToken(token: string): Promise<Session | null>
  findByUserId(userId: string, includeRevoked?: boolean): Promise<Session[]>
  update(id: string, data: Partial<Session>): Promise<Session>
  delete(id: string): Promise<boolean>
  deleteByUserId(userId: string): Promise<number>
}
