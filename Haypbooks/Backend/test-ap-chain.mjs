import axios from 'axios'

const BASE_URL = (process.env.BASE_URL || 'http://localhost:4000/api').replace(/\/+$/, '')
const COMPANY_ID = process.env.COMPANY_ID
const AUTH_EMAIL = process.env.AUTH_EMAIL
const AUTH_PASSWORD = process.env.AUTH_PASSWORD
const AUTH_TOKEN = process.env.AUTH_TOKEN
const VENDOR_NAME = process.env.APC_TEST_VENDOR_NAME || `AP Test Vendor ${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`

function exit(message) {
  console.error(message)
  process.exit(1)
}

async function getAuthToken() {
  if (AUTH_TOKEN) return AUTH_TOKEN
  if (!AUTH_EMAIL || !AUTH_PASSWORD) {
    exit('Missing AUTH_EMAIL/AUTH_PASSWORD or AUTH_TOKEN environment variables')
  }

  const url = `${BASE_URL}/auth/login`
  const response = await axios.post(url, {
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  })

  if (!response.data || !response.data.token) {
    exit(`Login failed or no token returned from ${url}`)
  }

  return response.data.token
}

async function apiClient(token) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  })
}

function assert(condition, message) {
  if (!condition) exit(message)
}

async function ensureCompanyId() {
  if (!COMPANY_ID) exit('COMPANY_ID is required for this script')
  return COMPANY_ID
}

async function getExpenseAccount(client, companyId) {
  const response = await client.get(`/companies/${companyId}/accounting/accounts`, { params: { includeInactive: true } })
  const accounts = Array.isArray(response.data) ? response.data : response.data?.data ?? []
  const byCode5010 = accounts.find((account) => String(account.code) === '5010')
  if (byCode5010) return byCode5010

  const expenseAccount = accounts.find((account) => String(account.type)?.toUpperCase() === 'EXPENSE' || String(account.code || '').startsWith('5'))
  assert(expenseAccount, 'No expense account found in chart of accounts')
  return expenseAccount
}

async function findVendor(client, companyId, name) {
  const response = await client.get(`/companies/${companyId}/ap/vendors`, {
    params: { search: name, limit: 200 },
  })
  const vendors = Array.isArray(response.data) ? response.data : response.data?.data ?? []
  return vendors.find((vendor) => String(vendor.displayName).toLowerCase() === String(name).toLowerCase())
}

async function createVendor(client, companyId, name) {
  const response = await client.post(`/companies/${companyId}/ap/vendors`, {
    name,
    displayName: name,
    status: 'ACTIVE',
  })
  return response.data
}

async function createBill(client, companyId, vendorId, accountId, amount) {
  const response = await client.post(`/companies/${companyId}/ap/bills`, {
    vendorId,
    description: `AP chain test bill ${Math.random().toString(36).slice(2, 8)}`,
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    paymentTermId: 'Net 30',
    lines: [{
      description: 'Test expense line',
      accountId,
      quantity: 1,
      rate: amount,
      amount,
    }],
  })
  return response.data
}

async function approveBill(client, companyId, billId) {
  const response = await client.post(`/companies/${companyId}/ap/bills/${billId}/approve`)
  return response.data
}

async function getBill(client, companyId, billId) {
  const response = await client.get(`/companies/${companyId}/ap/bills/${billId}`)
  return response.data
}

async function getJournalEntry(client, companyId, journalEntryId) {
  const response = await client.get(`/companies/${companyId}/accounting/journal-entries/${journalEntryId}`)
  return response.data
}

async function run() {
  const companyId = await ensureCompanyId()
  const token = await getAuthToken()
  const client = await apiClient(token)

  console.log('Using companyId:', companyId)
  console.log('Using vendor name:', VENDOR_NAME)

  const expenseAccount = await getExpenseAccount(client, companyId)
  console.log('Using expense account:', expenseAccount.code, expenseAccount.name)

  let vendor = await findVendor(client, companyId, VENDOR_NAME)
  if (!vendor) {
    console.log('Creating vendor:', VENDOR_NAME)
    vendor = await createVendor(client, companyId, VENDOR_NAME)
  }

  assert(vendor?.id, 'Vendor creation failed or missing id')
  console.log('Vendor found/created:', vendor.id, vendor.displayName)

  const vendorList = await client.get(`/companies/${companyId}/ap/vendors`, { params: { limit: 200 } })
  const vendorArray = Array.isArray(vendorList.data) ? vendorList.data : vendorList.data?.data ?? []
  assert(vendorArray.some((item) => String(item.id) === String(vendor.id)), 'New vendor not present in vendor list')
  console.log('Vendor list includes the vendor, vendor selection list check passed')

  const bill1 = await createBill(client, companyId, vendor.id, expenseAccount.id, 150)
  console.log('Created bill 1:', bill1.id)

  await approveBill(client, companyId, bill1.id)
  console.log('Approved bill 1:', bill1.id)

  const bill1Details = await getBill(client, companyId, bill1.id)
  assert(bill1Details?.journalEntry?.id, 'Bill 1 approval did not produce a journal entry')
  console.log('Bill 1 has journal entry:', bill1Details.journalEntry.id)

  const je1 = await getJournalEntry(client, companyId, bill1Details.journalEntry.id)
  assert(je1?.postingStatus === 'POSTED', `Journal entry ${bill1Details.journalEntry.id} is not posted`) 
  console.log('Bill 1 journal entry is POSTED')

  const bill2 = await createBill(client, companyId, vendor.id, expenseAccount.id, 175)
  console.log('Created bill 2:', bill2.id)

  await approveBill(client, companyId, bill2.id)
  console.log('Approved bill 2:', bill2.id)

  const bill2Details = await getBill(client, companyId, bill2.id)
  assert(bill2Details?.journalEntry?.id, 'Bill 2 approval did not produce a journal entry')
  console.log('Bill 2 has journal entry:', bill2Details.journalEntry.id)

  const je2 = await getJournalEntry(client, companyId, bill2Details.journalEntry.id)
  assert(je2?.postingStatus === 'POSTED', `Journal entry ${bill2Details.journalEntry.id} is not posted`)
  console.log('Bill 2 journal entry is POSTED')

  console.log('AP chain end-to-end API test completed successfully.')
}

run().catch((err) => {
  console.error('AP chain test failed:', err?.response?.data ?? err?.message ?? err)
  process.exit(1)
})
