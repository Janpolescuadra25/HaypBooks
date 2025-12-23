export interface User {
  id: string
  email: string
  name: string
  password: string // hashed
  isEmailVerified?: boolean
  isAccountant?: boolean
  role: 'owner' | 'admin' | 'manager' | 'ar-clerk' | 'ap-clerk' | 'viewer' | 'accountant' | 'both'
  createdAt: Date
  onboardingComplete?: boolean
  onboardingMode?: 'quick' | 'full'
  // Per-hub onboarding flags
  ownerOnboardingComplete?: boolean
  accountantOnboardingComplete?: boolean
  // Preferred hub for directing users at login
  preferredHub?: 'OWNER' | 'ACCOUNTANT'
  // Password reset fields (dev/test only)
  resetToken?: string | null
  resetTokenExpiry?: number | null
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: Partial<User>): Promise<User>
  update(id: string, data: Partial<User>): Promise<User>
  delete(id: string): Promise<boolean>
  findByResetToken?(token: string): Promise<User | null>
}
