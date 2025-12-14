import { mockApi } from '@/lib/mock-api'
import { hasPermission, getPermissionsForRole } from '@/lib/rbac'

describe('Customer/Vendor update flows and RBAC', () => {
  describe('Customers', () => {
    it('updates a customer successfully and records audit', async () => {
      const created = await mockApi<any>('/api/customers', { method: 'POST', body: JSON.stringify({ name: 'Acme', email: 'a@a.com', phone: '555' }) })
      const id = created.customer.id
      const updated = await mockApi<any>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify({ name: 'Acme Updated', email: 'a@a.com', phone: '555' }) })
      expect(updated.customer.name).toBe('Acme Updated')
      const audit = await mockApi<any>(`/api/audit?entity=customer&entityId=${id}&limit=5`, { method: 'GET' })
      expect(audit.events.find((e: any) => e.action === 'customer:update')).toBeTruthy()
    })

    it('fails validation when name is empty', async () => {
      const created = await mockApi<any>('/api/customers', { method: 'POST', body: JSON.stringify({ name: 'Temp' }) })
      const id = created.customer.id
      await expect(mockApi<any>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify({ name: '' }) }))
        .rejects.toThrow(/400 Bad Request: name is required/i)
    })
  })

  describe('Vendors', () => {
    it('updates a vendor successfully and records audit', async () => {
      const created = await mockApi<any>('/api/vendors', { method: 'POST', body: JSON.stringify({ name: 'Vendor X', terms: 'Net 30' }) })
      const id = created.vendor.id
      const updated = await mockApi<any>(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify({ name: 'Vendor X Updated', terms: 'Net 15' }) })
      expect(updated.vendor.name).toBe('Vendor X Updated')
      const audit = await mockApi<any>(`/api/audit?entity=vendor&entityId=${id}&limit=5`, { method: 'GET' })
      expect(audit.events.find((e: any) => e.action === 'vendor:update')).toBeTruthy()
    })

    it('fails validation when name is empty', async () => {
      const created = await mockApi<any>('/api/vendors', { method: 'POST', body: JSON.stringify({ name: 'Temp', terms: 'Net 30' }) })
      const id = created.vendor.id
      await expect(mockApi<any>(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify({ name: '' }) }))
        .rejects.toThrow(/400 Bad Request: name is required/i)
    })
  })

  describe('RBAC gating expectations', () => {
    it('viewer cannot write customers or vendors', () => {
      const perms = getPermissionsForRole('viewer')
      expect(perms.includes('customers:write')).toBe(false)
      expect(perms.includes('vendors:write')).toBe(false)
      expect(hasPermission('viewer', 'customers:write')).toBe(false)
      expect(hasPermission('viewer', 'vendors:write')).toBe(false)
    })

    it('ap-clerk can write vendors but not customers', () => {
      expect(hasPermission('ap-clerk', 'vendors:write')).toBe(true)
      expect(hasPermission('ap-clerk', 'customers:write')).toBe(false)
    })

    it('admin can write both', () => {
      expect(hasPermission('admin', 'customers:write')).toBe(true)
      expect(hasPermission('admin', 'vendors:write')).toBe(true)
    })
  })
})
