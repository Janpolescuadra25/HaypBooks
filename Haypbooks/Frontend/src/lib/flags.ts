// Simple client/server-safe feature flags sourced from env vars.
export const flags = {
  tags: process.env.NEXT_PUBLIC_ENABLE_TAGS === '1' || process.env.NEXT_PUBLIC_ENABLE_TAGS === 'true',
}
