import apiClient from '@/lib/api-client'

export default class VerificationService {
  async setupPin(_pin: string) {
    throw new Error('PIN feature has been removed')
  }

  async verifyPin(_pin: string) {
    throw new Error('PIN feature has been removed')
  }

  async sendEmailCode(email: string) {
    const res = await apiClient.post('/api/auth/email/send-code', { email })
    return res.data
  }

  async verifyEmailCode(email: string, code: string) {
    const res = await apiClient.post('/api/auth/email/verify-code', { email, code })
    return res.data
  }

  async sendPhoneCode(phone: string) {
    const res = await apiClient.post('/api/auth/phone/send-code', { phone })
    return res.data
  }

  async verifyPhoneCode(phone: string, code: string) {
    const res = await apiClient.post('/api/auth/phone/verify-code', { phone, code })
    return res.data
  }
}
