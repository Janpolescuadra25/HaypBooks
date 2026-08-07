import { useState, useEffect, FormEvent } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const AUTH_METHODS = [
  { key: 'authenticator', label: 'Authenticator App', description: 'Use Google Authenticator or similar apps' },
  { key: 'sms', label: 'SMS', description: 'Receive verification codes via text message' },
  { key: 'email', label: 'Email', description: 'Receive verification codes via email' },
]

export default function TwoFactorAuthPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(false)
  const [codeExpiry, setCodeExpiry] = useState('300')
  const [allowRememberDevice, setAllowRememberDevice] = useState(false)
  const [methods, setMethods] = useState<Record<string, boolean>>({
    authenticator: true,
    sms: false,
    email: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return
      setLoading(true)
      try {
        const response = await settingsService.getTwoFactorConfig(companyId)
        const data = response.data ?? {}
        setEnforceTwoFactor(data.enforceTwoFactor ?? false)
        setCodeExpiry(data.codeExpiry?.toString() || '300')
        setAllowRememberDevice(data.allowRememberDevice ?? false)
        setMethods(data.methods || { authenticator: true, sms: false, email: false })
        setErrorMessage(null)
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load two-factor configuration')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [companyId])

  const handleToggleMethod = (key: string) => {
    setMethods((current) => ({ ...current, [key]: !current[key] }))
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyId) return
    const parsedExpiry = Number(codeExpiry)
    if (Number.isNaN(parsedExpiry) || parsedExpiry <= 0) {
      setErrorMessage('Code Expiry must be a valid positive number.')
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await settingsService.updateTwoFactorConfig(companyId, {
        enforceTwoFactor,
        codeExpiry: parsedExpiry,
        allowRememberDevice,
        methods,
      })
      setSuccessMessage('Two-factor authentication settings updated successfully.')
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save two-factor configuration')
    } finally {
      setSaving(false)
    }
  }

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {companyIdError}
        </div>
      </div>
    )
  }

  if (companyIdLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Two-Factor Authentication</h2>
            <p className="mt-1 text-sm text-slate-500">Configure two-factor authentication settings for your organization</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Enforce Two-Factor Authentication</label>
                  <p className="text-xs text-slate-500">Require all users to set up two-factor authentication</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnforceTwoFactor(!enforceTwoFactor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enforceTwoFactor ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enforceTwoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Code Expiry (seconds)</label>
              <input
                type="number"
                placeholder="300"
                value={codeExpiry}
                onChange={(event) => setCodeExpiry(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-slate-500">Time before verification code expires</p>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Allow Remember Device</label>
                  <p className="text-xs text-slate-500">Allow users to trust devices for 30 days</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRememberDevice(!allowRememberDevice)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowRememberDevice ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowRememberDevice ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 mb-4"></div>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Allowed Authentication Methods</h3>
          <div className="space-y-3">
            {AUTH_METHODS.map((method) => (
              <label
                key={method.key}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={methods[method.key]}
                  onChange={() => handleToggleMethod(method.key)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">{method.label}</span>
                  <p className="text-xs text-slate-500">{method.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-6 mb-4"></div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="inline-flex items-center">
                <Loader2 size={16} className="animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          {successMessage && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
