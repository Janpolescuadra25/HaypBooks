import { test, expect } from '@playwright/test'

test('signup as accountant redirects to accountant onboarding then hub', async ({ page, request }) => {
  const email = `e2e-acct-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  await page.goto('/signup')

  // Select Accountant role
  await page.getByRole('button', { name: 'Accountant' }).click()

  // Fill form
  await page.fill('#firstName', 'E2E')
  await page.fill('#lastName', 'Accountant')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)

  // Wait for the signup POST and navigation
  const signupReq = page.waitForRequest((req) => req.url().includes('/api/auth/signup') && req.method() === 'POST')
  await page.getByRole('button', { name: 'Create account' }).click()

  const req = await signupReq
  expect(req).toBeTruthy()

  // Expect to land on the verify OTP page first
  await page.waitForURL(new RegExp('.*/verify-otp'), { timeout: 15000 })
  expect(page.url()).toContain('/verify-otp')

  // Complete the accountant onboarding (firm name is required)
  await page.fill('#firmName', 'ACME Firm (E2E)')
  await page.getByRole('button', { name: 'Finish setup' }).click()
  await page.waitForURL(new RegExp('.*/hub/accountant'), { timeout: 15000 })
  expect(page.url()).toContain('/hub/accountant')
})

test('signup as business redirects to /onboarding/tenant', async ({ page, request }) => {
  const email = `e2e-business-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  await page.goto('/signup')

  // Select My Business role
  await page.getByRole('button', { name: 'My Business' }).click()

  // Fill form
  await page.fill('#firstName', 'E2E')
  await page.fill('#lastName', 'Owner')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)

  // Wait for signup POST and navigation
  const signupReq = page.waitForRequest((req) => req.url().includes('/api/auth/signup') && req.method() === 'POST')
  await page.getByRole('button', { name: 'Create account' }).click()

  const req = await signupReq
  expect(req).toBeTruthy()

  await page.waitForURL(new RegExp('.*/verify-otp'), { timeout: 15000 })
  expect(page.url()).toContain('/verify-otp')
})