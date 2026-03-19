// Central list of public path prefixes. Used by ClientRoot to decide when
// to hide the app chrome (topbar / sidebar) and by tests / docs.
export const PUBLIC_PATH_PREFIXES = [
  '/',
  '/landing',
  '/login',
  '/signup',
  '/pricing',
  '/features',
  '/learn',
  '/learn-and-support',
  '/forgot-password',
  '/verify-otp',
  '/verification',
  '/reset-password',
  '/onboarding',
  // quick business onboarding has been retired; no longer a public path
  '/hub',
  '/accountants',
  '/workspace',
  '/get-started'
]
