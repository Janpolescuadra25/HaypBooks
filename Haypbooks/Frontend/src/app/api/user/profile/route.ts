import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPermissionsForRole, getRoleFromCookies } from '@/lib/rbac-server'

export async function GET() {
  const role = getRoleFromCookies()
  const email = cookies().get('email')?.value || 'demo@haypbooks.test'
  return NextResponse.json({
    id: 'u_1',
    name: 'Demo User',
    email,
    role,
    permissions: getPermissionsForRole(role),
    features: {
      payments: true,
      payroll: false,
      inventory: false,
      projects: false,
      budgets: false
    },
    company: {
      id: 'c_1',
      name: 'Demo Company',
      currency: 'USD'
    }
  })
}
