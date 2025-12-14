import { hasPermission } from '@/lib/rbac-shared'

describe('Sidebar RBAC helpers', () => {
  test('hasPermission basics', () => {
    expect(hasPermission('admin' as any, 'reports:read')).toBe(true)
    expect(hasPermission('viewer' as any, 'journal:write')).toBe(false)
  })
})
