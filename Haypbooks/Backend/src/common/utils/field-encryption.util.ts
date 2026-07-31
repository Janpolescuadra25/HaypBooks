import * as crypto from 'crypto'

const KEY_ENV = 'FIELD_ENCRYPTION_KEY'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getFieldEncryptionKey(): Buffer {
  const key = process.env[KEY_ENV]
  if (!key) {
    throw new Error(`${KEY_ENV} environment variable is required for field encryption`)
  }

  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(`${KEY_ENV} must be exactly 64 hex characters (32 bytes) for AES-256-GCM`)
  }

  const keyBuffer = Buffer.from(key, 'hex')
  return keyBuffer
}

export function encryptField(value: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getFieldEncryptionKey(), iv)
  const encryptedValue = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, encryptedValue]).toString('base64')
}

export function decryptField(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, 'base64')
  const iv = buffer.slice(0, IV_LENGTH)
  const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = buffer.slice(IV_LENGTH + TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, getFieldEncryptionKey(), iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

export function safeDecryptField(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return decryptField(value)
  } catch {
    return value
  }
}
