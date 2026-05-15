interface EnvVarSpec {
  key: string
  required: boolean
  description: string
}

const REQUIRED_VARS: EnvVarSpec[] = [
  { key: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET', required: true, description: 'JWT signing secret' },
  { key: 'HMAC_KEY', required: true, description: 'HMAC key used for phone hashing' },
  { key: 'FIELD_ENCRYPTION_KEY', required: true, description: 'AES-256 key for PII field encryption (64 hex characters)' },
  { key: 'FRONTEND_URL', required: false, description: 'Frontend URL for CORS (defaults to http://localhost:3000)' },
  { key: 'REDIS_URL', required: false, description: 'Redis URL for rate limiting (optional, uses in-memory fallback)' },
]

export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = []
  const warnings: string[] = []

  for (const spec of REQUIRED_VARS) {
    if (spec.required && !process.env[spec.key]) {
      missing.push(`${spec.key} — ${spec.description}`)
    }
    if (!spec.required && !process.env[spec.key]) {
      warnings.push(`${spec.key} not set — ${spec.description}`)
    }
  }

  if (process.env.FIELD_ENCRYPTION_KEY) {
    const key = process.env.FIELD_ENCRYPTION_KEY
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
      missing.push('FIELD_ENCRYPTION_KEY must be exactly 64 hex characters (32-byte AES key)')
    }
  }

  if (missing.length > 0) {
    console.error('\n========================================')
    console.error('  MISSING REQUIRED ENVIRONMENT VARIABLES')
    console.error('========================================')
    missing.forEach(m => console.error(`  ❌ ${m}`))
    console.error('========================================\n')
  }

  return { valid: missing.length === 0, missing, warnings }
}
