import apiClient from '@/lib/api-client';
import type { AxiosRequestConfig } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
  // When present, the backend may suggest redirect for accountant hub
  loginAsAccountant?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  // Optional role: 'business' | 'accountant' | 'both'
  role?: string;
  // Optional phone (E.164 normalized or local string handled by UI)
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  firstName: string;
  lastName: string;
  role: string;
  onboardingCompleted: boolean;
  ownerOnboardingCompleted?: boolean;
  accountantOnboardingCompleted?: boolean;
  preferredHub?: 'OWNER' | 'ACCOUNTANT';
}

export interface AuthResponse {
  user: User;
  // backend may return either `token` or `access_token` depending on implementation
  token?: string;
  access_token?: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials, config?: AxiosRequestConfig): Promise<AuthResponse> {
    // credentials may include loginAsAccountant flag to request accountant landing
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials, config);
    const data = response.data;
    // Validate response to avoid UI getting stuck on unexpected payloads
    if (!data || !data.user || !data.user.email) {
      const err = new Error('Invalid login response') as any
      err.response = { status: 500, data: { error: 'Invalid login response' } }
      throw err
    }
    return data;
  }

  /**
   * Signup new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    // Backend expects a single `name` property. Support both companyName or first+last.
    const name = data.companyName?.trim() || [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(' ').trim()
    const payload: any = { email: data.email, password: data.password, name }
    if (data.role) payload.role = data.role
    if (data.phone) payload.phone = data.phone
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', payload);
    
    // Don't persist the user yet — the signup response can represent a newly
    // created account that still needs verification. Persisting `user` in
    // localStorage would cause the UI to think the user is fully signed-in
    // before they've completed verification. The frontend should wait until
    // a real login/verify action before saving the user to local storage.
    
    return response.data;
  }

  /**
   * Create a pending signup and send an OTP to the user (does not create DB user)
   */
  async preSignup(data: SignupData): Promise<{ signupToken: string; otp?: string; otpEmail?: string; otpPhone?: string }> {
    const name = data.companyName?.trim() || [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(' ').trim()
    const payload: any = { email: data.email, password: data.password, name }
    if (data.role) payload.role = data.role
    if (data.phone) payload.phone = data.phone
    const response = await apiClient.post('/api/auth/pre-signup', payload)
    return response.data as { signupToken: string; otp?: string; otpEmail?: string; otpPhone?: string }
  }

  /**
   * Complete a pending signup by verifying OTP and creating the real user (sets cookies)
   */
  async completeSignup(signupToken: string, code: string, method?: 'email'|'phone'): Promise<AuthResponse & { token?: string }> {
    const response = await apiClient.post('/api/auth/complete-signup', { signupToken, code, method })
    return response.data as any
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Clear local data first for immediate UI update
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    
    try {
      // Then notify server (best effort)
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Log but don't throw - user is already logged out on client
      console.error('Server logout error:', error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me', {
      timeout: 8000 // Faster timeout for session checks
    });
    
    // Validate response structure
    const user = response.data;
    if (!user || !user.id || !user.email) {
      throw new Error('Invalid user data received from server');
    }
    
    return user;
  }

  /**
   * Request password reset for an email (backend logs token in dev)
   */
  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data as { success: boolean };
  }

  async verifyOtp(email: string, otpCode: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/api/auth/verify-otp', { email, otpCode })
    return response.data as { success: boolean }
  }

  async sendVerification(email: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/api/auth/send-verification', { email })
    return response.data as { success: boolean }
  }

  /**
   * Reset a password using a reset token
   */
  async resetPassword(
    tokenOrEmail: string,
    password: string,
    otpCode?: string
  ): Promise<{ success: boolean }> {
    // If otpCode is provided, treat tokenOrEmail as email
    if (otpCode) {
      const response = await apiClient.post('/api/auth/reset-password', { email: tokenOrEmail, otpCode, password })
      return response.data as { success: boolean }
    }
    // otherwise treat first arg as token
    const response = await apiClient.post('/api/auth/reset-password', { token: tokenOrEmail, password })
    return response.data as { success: boolean }
  }

  /**
   * List refresh sessions for current user (requires cookie auth)
   */
  async listSessions(): Promise<any[]> {
    const res = await apiClient.get('/api/auth/sessions')
    return res.data || []
  }

  /**
   * Revoke a session by id or refresh token
   */
  async revokeSession(sessionId?: string, refreshToken?: string): Promise<{ success: boolean }> {
    const res = await apiClient.post('/api/auth/sessions/revoke', { sessionId, refreshToken })
    return res.data
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          // Validate the user object has required fields
          if (parsed && typeof parsed === 'object' && 
              parsed.id && parsed.email && 
              (typeof parsed.onboardingCompleted === 'boolean' || typeof parsed.ownerOnboardingCompleted === 'boolean' || typeof parsed.accountantOnboardingCompleted === 'boolean')) {
            return parsed as User;
          }
          // Invalid structure - clear corrupted data
          localStorage.removeItem('user');
          return null;
        } catch {
          // Failed to parse - clear corrupted data
          localStorage.removeItem('user');
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('user');
    }
    return false;
  }
}

export const authService = new AuthService();
