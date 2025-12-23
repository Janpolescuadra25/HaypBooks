import { Injectable } from '@nestjs/common'
import { IUserRepository, User } from '../interfaces/user.repository.interface'

@Injectable()
export class MockUserRepository implements IUserRepository {
  private users: User[] = [
    {
      id: 'user-demo-1',
      email: 'demo@haypbooks.test',
      name: 'Demo User',
      // In production, this would be bcrypt.hash('password', 10)
      password: '$2b$10$YourHashedPasswordHere', // We'll handle this in auth service
      role: 'admin',
      createdAt: new Date(),
      onboardingComplete: false,
      onboardingMode: 'full',
    },
  ]

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email)
    return user || null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id)
    return user || null
  }

  async create(data: Partial<User>): Promise<User> {
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: data.email!,
      name: data.name!,
      password: data.password!,
      role: (data.role as any) || 'owner',
      isAccountant: !!data.isAccountant,
      preferredHub: (data.preferredHub as any) || undefined,
      createdAt: new Date(),
      onboardingComplete: false,
      onboardingMode: data.onboardingMode || 'full',
    }
    this.users.push(user)
    return user
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }
    this.users[index] = { ...this.users[index], ...data }
    return this.users[index]
  }

  async findByResetToken(token: string): Promise<User | null> {
    const now = Date.now()
    const user = this.users.find(u => u.resetToken === token && (u.resetTokenExpiry || 0) > now)
    return user || null
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) {
      return false
    }
    this.users.splice(index, 1)
    return true
  }
}
