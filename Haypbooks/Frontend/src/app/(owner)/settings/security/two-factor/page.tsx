'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Two-Factor Authentication"
      module="SETTINGS"
      breadcrumb="Settings / Security / Two-Factor Authentication"
      purpose="Two-Factor Authentication (2FA) management provides the administrator's view of 2FA enrollment across all users. Administrators can see which users have enabled 2FA, reset 2FA for users who have lost their authenticator device, enforce mandatory 2FA enrollment for specific roles, and view 2FA enrollment rate as a security metric. Individual users manage their own 2FA setup in their personal account settings; this admin page provides oversight and enforcement capability."
      components={[
        { name: '2FA Enrollment Status', description: 'All users with 2FA enabled/disabled status and enrollment date.' },
        { name: 'Enforcement Settings', description: 'Set mandatory 2FA for specific roles (e.g., Admin, Accountant) or company-wide.' },
        { name: 'Reset 2FA', description: "Reset a specific user's 2FA when they lose their authenticator app — sends re-enrollment email." },
        { name: 'Enrollment Methods', description: 'Configure which 2FA methods are available: TOTP (Google Authenticator), SMS OTP, Email OTP.' },
      ]}
      tabs={['Enrollment Status', 'Enforcement Rules', 'Allowed Methods', 'Reset 2FA']}
      features={[
        '2FA enrollment status dashboard for all users',
        'Role-level 2FA enforcement',
        'TOTP authenticator app support',
        'SMS and email OTP options',
        '2FA reset for lost authenticator situations',
        'Enrollment rate security metric',
      ]}
      dataDisplayed={[
        'Users with and without 2FA enrolled',
        '2FA method per user',
        'Enforcement rules active',
        'Enrollment % (security KPI)',
        'Users with 2FA enforcement pending enrollment',
      ]}
      userActions={[
        'Enforce 2FA for specific roles',
        'Reset 2FA for a specific user',
        'Configure allowed 2FA methods',
        'View 2FA enrollment rate',
        'Export 2FA status for compliance audit',
      ]}
      relatedPages={[
        { label: 'Security Settings', href: '/settings/security/security-settings' },
        { label: 'Security Log', href: '/settings/security/security-log' },
        { label: 'User Management', href: '/settings/users/user-management' },
      ]}
    />
  )
}

