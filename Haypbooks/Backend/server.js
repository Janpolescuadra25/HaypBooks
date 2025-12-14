const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const cors = require('cors')
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())

// In-memory store for stubs
const store = { onboardingDrafts: {}, users: {} }

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })
  // non-secure mock token
  const token = 'backend-mock-token'
  // create minimal user
  const user = { id: 'u_1', email, name: 'Demo User' }
  store.users[user.id] = user
  res.json({ token, user })
})

app.post('/api/onboarding/save', (req, res) => {
  const { userId = 'u_1', step, data } = req.body || {}
  if (!step) return res.status(400).json({ error: 'missing step' })
  store.onboardingDrafts[userId] = { ...(store.onboardingDrafts[userId] || {}), [step]: data }
  res.json({ success: true })
})

app.post('/api/onboarding/complete', (req, res) => {
  const { userId = 'u_1' } = req.body || {}
  // In production this would persist state and possibly send back a refreshed session
  // Set cookie on response to allow frontend to read it in dev when CORS allows credentials
  res.cookie('onboardingComplete', 'true', { path: '/', httpOnly: false })
  res.json({ success: true })
})

// Subscription stub
app.get('/api/subscriptions/plans', (req, res) => {
  res.json({ plans: [
    { id: 'starter', name: 'Starter', priceMonthly: 0 },
    { id: 'essential', name: 'Essential', priceMonthly: 29 },
    { id: 'professional', name: 'Professional', priceMonthly: 79 },
    { id: 'enterprise', name: 'Enterprise', priceMonthly: 199 }
  ]})
})

app.post('/api/subscriptions/create-intent', (req, res) => {
  // stub
  res.json({ success: true, intentId: 'intent_mock' })
})

app.listen(process.env.PORT || 4000, () => console.log('Haypbooks backend scaffold running on port ' + (process.env.PORT || 4000)))
