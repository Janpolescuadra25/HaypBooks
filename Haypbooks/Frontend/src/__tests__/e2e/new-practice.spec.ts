import { test, expect } from '@playwright/test'

test('New Practice flow diagnostic', async ({ page }) => {
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`[API] ${response.request().method()} ${response.url()} -> ${response.status()}`)
      if (response.status() >= 400) {
        const text = await response.text().catch(()=>'<unreadable>')
        console.log('[ERROR BODY]', text)
      }
    }
  })

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[PAGE ERROR]', msg.text())
  })
  page.on('pageerror', err => console.log('[PAGE EXCEPTION]', err.message))

  // 1) login user
  const email = process.env.E2E_TEST_EMAIL || 'test@haypbooks.test'
  const password = process.env.E2E_TEST_PASSWORD || 'password'

  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button:has-text("Sign in")')

  await Promise.race([
    page.waitForURL('/workspace', { timeout: 30000 }),
    page.waitForURL('/hub', { timeout: 30000 }),
    page.waitForURL('/get-started', { timeout: 30000 }),
  ])

  // 2) to /workspace
  await page.goto('/workspace')

  // 3) click new practice
  await page.click('button:text("New Practice"), button:has-text("+ NEW PRACTICE"), button:has-text("New Practice")')

  // 4) verify onboarding route
  await expect(page).toHaveURL(/\/onboarding\/practice\?newPractice=true/, { timeout: 30000 })

  // 5) log DOM each step and attempt to fill
  for (let step = 0; step < 6; step++) {
    console.log(`--- STEP ${step + 1} SIMPLE DUMP ---`)
    console.log(await page.content())

    // Try a couple of likely fields:
    await Promise.all([
      page.locator('input[name="name"]').fill('E2E Test Practice ' + Date.now()).catch(()=>{}),
      page.locator('input[name="firmName"]').fill('E2E Test Firm ' + Date.now()).catch(()=>{}),
      page.locator('input[name="practiceName"]').fill('E2E Test Practice ' + Date.now()).catch(()=>{}),
      page.locator('input[type="text"]').first().fill('E2E Test Name').catch(()=>{}),
    ])

    const nextButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Finish")').first()
    if (await nextButton.count() > 0) {
      await nextButton.click().catch(() => {})
      await page.waitForTimeout(1000)
    } else {
      break
    }
  }

  console.log('--- before final submit, capturing all relevant responses ---')

  const [response] = await Promise.all([
    page.waitForResponse(resp => (resp.url().includes('/api/onboarding') || resp.url().includes('/api/practices')) && resp.status() >= 0, { timeout: 60000 }),
    page.click('button:has-text("Finish"), button:has-text("Complete"), button:has-text("Finish Onboarding"), button:has-text("Continue" )').catch(() => {}),
  ])

  console.log('=== ONBOARDING SUBMIT RESPONSE ===')
  console.log('URL:', response.url())
  console.log('Status:', response.status())
  console.log('Status Text:', response.statusText())
  const body = await response.text().catch(() => '<failed to read>')
  console.log('Response Body:', body)
  try {
    console.log('Parsed JSON:', JSON.stringify(JSON.parse(body), null, 2))
  } catch (e) {
    console.log('(Not JSON)')
  }
  console.log('===================================')

  // 8) check redirection
  await page.waitForURL('/workspace', { timeout: 30000 }).catch(() => {})
  console.log('After complete, URL:', page.url())

  // 9) capture /api/users/me practice list
  const meResponse = await page.waitForResponse(resp => resp.url().includes('/api/users/me'), { timeout: 30000 })
  const meData = await meResponse.json().catch(() => null)
  console.log('=== PRACTICES AFTER CREATION ===')
  console.log(JSON.stringify((meData?.practices || meData?.firmList || meData?.firms || []), null, 2))
  console.log('=================================')

  // no assert needed; just log
  expect(true).toBeTruthy()
})