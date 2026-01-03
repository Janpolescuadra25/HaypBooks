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
  emailOtpVerified?: boolean
  phoneOtpVerified?: boolean
  emailOtpVerifiedAt?: number
  phoneOtpVerifiedAt?: number
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
      try {
        await this.redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds)
        return token
      } catch (e) {
        console.error('Redis set failed for PendingSignupService.create — falling back to in-memory store', e?.message || e)
        // fall through to in-memory fallback
      }
    }

    const expiresAt = createdAt + ttlSeconds * 1000
    const timeout = setTimeout(() => this.store.delete(token), ttlSeconds * 1000)
    // Allow process to exit even if the timer is pending (helps unit tests).
    ;(timeout as any)?.unref?.()
    this.store.set(token, { data: payload as PendingData, expiresAt, timeout })

    return token
  }

  async get(token: string) {
    const key = `pending_signup:${token}`
    if (this.redis) {
      try {
        const raw = await this.redis.get(key)
        if (!raw) return null
        try { return JSON.parse(raw) as PendingData } catch (e) { return null }
      } catch (e) {
        console.error('Redis get failed for PendingSignupService.get — falling back to in-memory store', e?.message || e)
        // fall through to in-memory fallback
      }
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

  async update(token: string, patch: Partial<PendingData>) {
    const key = `pending_signup:${token}`
    if (this.redis) {
      try {
        const raw = await this.redis.get(key)
        if (!raw) return null
        let existing: PendingData
        try { existing = JSON.parse(raw) as PendingData } catch (e) { return null }
        const ttl = await this.redis.ttl(key)
        if (ttl <= 0) return null
        const next = { ...existing, ...patch }
        await this.redis.set(key, JSON.stringify(next), 'EX', ttl)
        return next
      } catch (e) {
        console.error('Redis update failed for PendingSignupService.update — falling back to in-memory store', e?.message || e)
        // fall through to in-memory fallback
      }
    }

    const item = this.store.get(token)
    if (!item) return null
    if (item.expiresAt < Date.now()) {
      clearTimeout(item.timeout)
      this.store.delete(token)
      return null
    }
    const next = { ...item.data, ...patch } as PendingData
    // Preserve original expiry
    clearTimeout(item.timeout)
    const remainingMs = Math.max(0, item.expiresAt - Date.now())
    const timeout = setTimeout(() => this.store.delete(token), remainingMs)
    ;(timeout as any)?.unref?.()
    this.store.set(token, { data: next, expiresAt: item.expiresAt, timeout })
    return next
  }

  async delete(token: string) {
    const key = `pending_signup:${token}`
    if (this.redis) {
      try {
        const res = await this.redis.del(key)
        return res > 0
      } catch (e) {
        console.error('Redis del failed for PendingSignupService.delete — falling back to in-memory store', e?.message || e)
        // fall through to in-memory fallback
      }
    }

    const item = this.store.get(token)
    if (!item) return false
    clearTimeout(item.timeout)
    this.store.delete(token)
    return true
  }
}
