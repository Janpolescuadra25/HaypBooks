export interface Otp {
  id: string
  email: string
  otpCode: string
  attempts: number
  purpose?: string
  createdAt?: Date
  expiresAt: number | Date
}

export interface IOtpRepository {
  create(data: Partial<Otp>): Promise<Otp>
  findLatestByEmail(email: string, purpose?: string): Promise<Otp | null>
  incrementAttempts(id: string): Promise<Otp>
  delete(id: string): Promise<boolean>
  countRecentByEmail(email: string, minutes: number): Promise<number>
}
