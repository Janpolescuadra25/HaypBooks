import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
// Accountant enums were removed from Prisma schema; use local types to avoid build errors
type AccountantAccessLevel = 'FULL' | 'VIEW_ONLY' | 'BILLING_ONLY'
type PerkType = string

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

@Injectable()
export class AccountantService {
  async createClient(accountantId: string, tenantId: string, accessLevel: AccountantAccessLevel = 'FULL' as AccountantAccessLevel) {
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

  async listClientsForAccountant(accountantId: string) {
    const res = await pool.query('SELECT * FROM public."AccountantClient" WHERE "accountantId" = $1', [accountantId])
    return res.rows
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
