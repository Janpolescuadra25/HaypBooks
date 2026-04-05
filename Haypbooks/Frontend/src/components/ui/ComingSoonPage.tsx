'use client'
import { Clock } from 'lucide-react'

interface ComingSoonProps {
  featureName: string
  featureDescription?: string
  icon?: React.ReactNode
  estimatedTime?: string
}

export default function ComingSoon({
  featureName,
  featureDescription,
  icon,
  estimatedTime,
}: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center text-4xl">
          {icon ?? '🚀'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{featureName}</h2>
        <p className="text-base font-semibold text-emerald-600 mb-4">Coming Soon</p>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {featureDescription ??
            `We're working hard to bring you ${featureName}. It will be available in a future update.`}
        </p>
        {estimatedTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-600">
            <Clock size={12} />
            <span>Expected: {estimatedTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
