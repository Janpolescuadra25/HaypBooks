import { useCallback, useEffect, useState } from 'react'
import type { Permission } from '@/lib/rbac-shared'
import { getProfileCached } from '@/lib/profile-cache'

/**
 * usePermissions
 * Lightweight client hook to expose a stable `has(permission)` function.
 * Caches profile via getProfileCached to avoid duplicate network calls.
 */
export function usePermissions() {
  const [perms, setPerms] = useState<Set<Permission> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    getProfileCached()
      .then(p => {
        if (!alive) return
        const list = (p?.permissions || []) as Permission[]
        setPerms(new Set(list))
      })
      .catch(e => { if (alive) { setPerms(new Set()); setError(e as Error) } })
    return () => { alive = false }
  }, [])

  const has = useCallback((perm: Permission) => {
    return perms?.has(perm) ?? false
  }, [perms])

  return {
    loading: perms === null,
    error,
    has,
    raw: perms
  }
}

export type UsePermissionsResult = ReturnType<typeof usePermissions>
