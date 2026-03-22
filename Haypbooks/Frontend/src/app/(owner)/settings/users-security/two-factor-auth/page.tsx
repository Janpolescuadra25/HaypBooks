'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TwoFactorAuthPage() {
  return (
    <PageDocumentation
      title="Two-Factor Authentication"
      module="SETTINGS"
      breadcrumb="Settings / Users & Security / Two-Factor Authentication"
      purpose="Two-Factor Authentication (2FA) settings allow administrators to enforce an additional verification step for all users or specific roles, significantly reducing the risk of unauthorized access even if a password is compromised. Supported 2FA methods include authenticator app TOTP, SMS OTP, and email OTP. Admins can mandate 2FA company-wide or review which users have enabled it voluntarily."
      components={[
        { name: 'Enforcement Policy Toggle', description: 'Company-wide toggle to require 2FA for all users, enforce for admins only, or leave optional.' },
        { name: 'Allowed Methods Selector', description: 'Checkboxes to enable or restrict which 2FA methods users can choose: TOTP app, SMS, or email.' },
        { name: 'User 2FA Status Table', description: 'Table of all users showing whether 2FA is enabled, which method is active, and last verified date.' },
        { name: 'Grace Period Config', description: 'Setting for how many days new users have to enable 2FA before being locked out after mandate.' },
        { name: 'Reset 2FA Button', description: "Admin action to remove a user's current 2FA device, requiring them to re-enroll on next login." },
      ]}
      tabs={['Policy Settings', 'User Status', 'Method Config']}
      features={[
        'Enforce 2FA company-wide or for specific roles only',
        'Support authenticator app (TOTP), SMS OTP, and email OTP methods',
        'View 2FA enrollment status for every user',
        'Set grace period before mandatory 2FA lock-out',
        "Reset any user's 2FA device for re-enrollment",
        "Receive alerts when a user's 2FA is bypassed or reset",
      ]}
      dataDisplayed={[
        'Company-wide 2FA enforcement status',
        'Per-user 2FA enabled/disabled and active method',
        'Last 2FA verification date per user',
        'Number of users with and without 2FA active',
        'Grace period expiry dates for pending users',
      ]}
      userActions={[
        'Enable or disable company-wide 2FA requirement',
        'Allow or restrict specific 2FA methods',
        "View which users have or haven't enrolled",
        "Reset a user's 2FA device",
        'Set grace period for new mandate rollout',
      ]}
    />
  )
}

