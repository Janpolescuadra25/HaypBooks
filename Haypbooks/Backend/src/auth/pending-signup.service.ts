import { Injectable, Inject, Optional } from '@nestjs/common'
import { randomBytes } from 'crypto'
import type Redis from 'ioredis'

type PendingData = {
  email: string
  hashedPassword: string
  name?: string
  role?: string
  phone?: string
  phoneCountry?: string
  createdAt: number
}

/**
 * PendingSignupService supports a Redis-backed store (recommended for production)
 * and falls back to an in-memory map when a Redis client is not provided. Methods
 * are async to accommodate Redis operations.
 */
@Injectable()
export class PendingSignupService {
  private store = new Map<string, { data: PendingData; expiresAt: number; timeout: NodeJS.Timeout }>()

  constructor(@Optional() @Inject('REDIS') private readonly redis?: Redis) {}

  async create(data: Omit<PendingData, 'createdAt'>, ttlSeconds = 60 * 30) {
    const token = randomBytes(16).toString('hex')
    const createdAt = Date.now()
    const payload = { ...data, createdAt }
    const key = `pending_signup:${token}`

    if (this.redis) {
      await this.redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds)
    } else {
      const expiresAt = createdAt + ttlSeconds * 1000
      const timeout = setTimeout(() => this.store.delete(token), ttlSeconds * 1000)
      this.store.set(token, { data: payload as PendingData, expiresAt, timeout })
    }

    return token
  }

  async get(token: string) {
    const key = `pending_signup:${token}`
    if (this.redis) {
      const raw = await this.redis.get(key)
      if (!raw) return null
      try { return JSON.parse(raw) as PendingData } catch (e) { return null }
    }

    const item = this.store.get(token)
    if (!item) return null
    if (item.expiresAt < Date.now()) {
      clearTimeout(item.timeout)
      this.store.delete(token)
      return null
    }
    return item.data
  }

  async delete(token: string) {
    const key = `pending_signup:${token}`
    if (this.redis) {
      const res = await this.redis.del(key)
      return res > 0
    }

    const item = this.store.get(token)
    if (!item) return false
    clearTimeout(item.timeout)
    this.store.delete(token)
    return true
  }
}
