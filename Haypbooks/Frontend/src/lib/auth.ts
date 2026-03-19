/**
 * Auth utilities — server-side session helpers.
 * Integrate with your chosen auth provider (NextAuth, Lucia, etc.).
 */

export async function getSession() {
  // TODO: return the current server session
  return null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}
