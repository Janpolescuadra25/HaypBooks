'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Security Settings"
      module="SETTINGS"
      breadcrumb="Settings / Security / Security Settings"
      purpose="Security Settings configures the organization-wide security policies for Haypbooks — password policies (minimum length, complexity, expiry), session timeout, login attempt lockout, IP allowlisting, two-factor authentication enforcement, and data access logging. These settings are critical for protecting financial data from unauthorized access and ensuring the company meets data governance requirements. Security settings changes are themselves logged in the security audit log."
      components={[
        { name: 'Password Policy', description: 'Minimum password length, required character types (uppercase, number, symbol), maximum age in days, and no-reuse history.' },
        { name: 'Session Settings', description: 'Session timeout (idle time before auto-logout), maximum session duration.' },
        { name: 'Login Security', description: 'Maximum failed login attempts before lockout, lockout duration, and CAPTCHA settings.' },
        { name: 'Two-Factor Authentication (2FA)', description: 'Enforce 2FA for all users, specific roles, or make optional. Support for TOTP authenticator apps.' },
        { name: 'IP Allowlisting', description: 'Restrict access to the application to specific IP addresses or IP ranges.' },
      ]}
      tabs={['Password Policy', 'Session Settings', 'Login Security', '2FA Policy', 'IP Allowlist']}
      features={[
        'Configurable password policy enforcement',
        'Idle session timeout',
        'Login attempt lockout',
        'Organization-wide 2FA enforcement',
        'IP allowlist-based access restriction',
        'Security setting changes logged',
        'SSO integration settings',
      ]}
      dataDisplayed={[
        'Current security policy settings',
        'Users without 2FA enabled (risk report)',
        'Recent failed login attempts',
        'IP allowlist entries',
        'Security setting change history',
      ]}
      userActions={[
        'Update password policy',
        'Configure session timeout',
        'Set login lockout parameters',
        'Enforce 2FA for all or specific roles',
        'Add IP addresses to allowlist',
        'View security change history',
      ]}
      relatedPages={[
        { label: 'Two-Factor Auth', href: '/settings/security/two-factor' },
        { label: 'Security Log', href: '/settings/security/security-log' },
        { label: 'User Management', href: '/settings/users/user-management' },
      ]}
    />
  )
}

