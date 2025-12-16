import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import type { AccountantAccessLevel, PerkType } from '@prisma/client'
import { PrismaService } from '../repositories/prisma/prisma.service'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

@Injectable()
export class AccountantService {
  constructor(private readonly prisma: PrismaService) {}

  async createClient(accountantId: string, tenantId: string, accessLevel: AccountantAccessLevel = 'FULL' as AccountantAccessLevel) {
    // Use Prisma (RLS-aware via PrismaService connection/session) so we don't get visibility issues
    try {
      const upserted = await this.prisma.accountantClient.upsert({
        where: { accountantId_tenantId: { accountantId, tenantId } } as any,
        update: { status: 'ACTIVE', accessLevel },
        create: { accountantId, tenantId, accessLevel, status: 'ACTIVE' },
      })
      return upserted
    } catch (e) {
      // Fallback: use raw SQL as a last resort
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(
          'INSERT INTO public."AccountantClient" ("accountantId","tenantId","accessLevel","status","invitedAt") VALUES ($1,$2,$3,$4,now()) ON CONFLICT ("accountantId","tenantId") DO UPDATE SET "status" = EXCLUDED."status", "accessLevel" = EXCLUDED."accessLevel"',
          [accountantId, tenantId, accessLevel, 'ACTIVE']
        )
        const res = await client.query('SELECT * FROM public."AccountantClient" WHERE "accountantId" = $1 AND "tenantId" = $2 LIMIT 1', [accountantId, tenantId])
        await client.query('COMMIT')
        return res.rows[0]
      } finally {
        client.release()
      }
    }
  }

  async listClientsForAccountant(accountantId: string) {
    // Use Prisma to respect RLS/session settings and ensure consistent visibility
    const rows = await this.prisma.accountantClient.findMany({ where: { accountantId } })
    return rows
  }

  async removeClient(id: string) {
    await pool.query('DELETE FROM public."AccountantClient" WHERE id = $1', [id])
    return { id }
  }

  async createPerk(data: { userId: string; type: PerkType; name: string; issuer?: string }) {
    const res = await pool.query(
      'INSERT INTO public."ProAdvisorPerk" ("userId","type","name","issuer","awardedAt","metadata") VALUES ($1,$2,$3,$4,now(),NULL) RETURNING *',
      [data.userId, data.type, data.name, data.issuer]
    )
    return res.rows[0]
  }

  async listPerks(userId: string) {
    const res = await pool.query('SELECT * FROM public."ProAdvisorPerk" WHERE "userId" = $1 ORDER BY "awardedAt" DESC', [userId])
    return res.rows
  }

  async removePerk(id: string) {
    await pool.query('DELETE FROM public."ProAdvisorPerk" WHERE id = $1', [id])
    return { id }
  }
}
