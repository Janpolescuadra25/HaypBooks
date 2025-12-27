import crypto from 'crypto'

export function hmacPhone(e164: string): string {
  if (!process.env.HMAC_KEY) throw new Error('HMAC_KEY is not set')
  return crypto.createHmac('sha256', process.env.HMAC_KEY).update(e164).digest('hex')
}
