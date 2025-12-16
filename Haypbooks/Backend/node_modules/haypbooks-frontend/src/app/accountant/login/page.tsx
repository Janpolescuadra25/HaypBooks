"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function AccountantLoginPage() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      if (!authService.isAuthenticated()) return
      try {
        await authService.getCurrentUser()
        if (!mounted) return
        router.replace('/accountant/clients')
      } catch (e) {
        if (typeof window !== 'undefined') localStorage.removeItem('user')
      }
    }
    checkSession()
    return () => { mounted = false }
  }, [router])

  const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(1, 'Password required') })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: any) {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login({ email: values.email, password: values.password })
      if (typeof window !== 'undefined' && response?.user) localStorage.setItem('user', JSON.stringify(response.user))
      router.replace('/accountant/clients')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sign in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white relative overflow-hidden">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Hayp Accountant — Sign in</h1>
          <p className="text-slate-600">Access your clients and firm tools.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border rounded-xl" placeholder="you@firm.com" />
            {errors.email && <p className="text-sm text-red-600">{String(errors.email?.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input {...register('password')} type="password" className="w-full px-4 py-3 border rounded-xl" placeholder="Password" />
            {errors.password && <p className="text-sm text-red-600">{String(errors.password?.message)}</p>}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>}

          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm">New to Hayp Accountant? <a href="/accountant/signup" className="text-emerald-600">Create an account</a></p>
        </div>
      </div>
    </div>
  )
}
