export interface ISecurityEventRepository {
  create(data: {
    userId?: string
    email?: string
    type: string
    ipAddress?: string
    userAgent?: string
  }): Promise<any>

  findByUserId(userId: string, limit?: number): Promise<any[]>
  findByEmail(email: string, limit?: number): Promise<any[]>
  countRecentByEmail(email: string, minutesAgo: number): Promise<number>
  countRecentByIp(ipAddress: string, minutesAgo: number): Promise<number>
}
