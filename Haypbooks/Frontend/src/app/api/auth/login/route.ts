import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPermissionsForRole } from '@/lib/rbac-server'
import type { Role } from '@/lib/rbac-shared'
import { db } from '@/mock/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body
  
  if (!email) {
    return NextResponse.json({ error: 'Email required', code: 'invalid_credentials' }, { status: 400 })
  }

  // Find user in mock DB
  const user = db.users?.find((u) => u.email === email)

  // If password is provided, validate it
  if (password !== undefined) {
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password', code: 'invalid_credentials' }, { status: 401 })
    }
    // In production, use bcrypt.compare or argon2.verify
    // For mock, direct comparison (NEVER do this in production!)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password', code: 'invalid_credentials' }, { status: 401 })
    }
  }

  // Mock token
  const token = `mock-jwt-${user?.id || 'demo'}`
  const userId = user?.id || 'u_1'
  const userName = user?.name || 'Demo User'
  
  // Derive role
  const role = (user?.role || (
    email.includes('manager') ? 'manager' : 
    email.includes('ap') ? 'ap-clerk' : 
    email.includes('view') ? 'viewer' : 
    'admin'
  )) as Role

  // Set session cookies
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  cookies().set('email', email, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  cookies().set('userId', userId, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  cookies().set('role', role, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })

  return NextResponse.json({
    token,
    user: {
      id: userId,
      name: userName,
      email,
      role,
      permissions: getPermissionsForRole(role),
      onboardingCompleted: (user as any)?.onboardingCompleted ?? true
    }
  })
}
