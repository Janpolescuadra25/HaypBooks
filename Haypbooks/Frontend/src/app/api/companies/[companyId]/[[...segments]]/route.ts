import { NextResponse } from 'next/server'

interface CompanyState {
  accounts: any[]
  employees: any[]
  vendors: any[]
  bills: any[]
  billPayments: any[]
  purchaseOrders: any[]
  purchaseRequests: any[]
  vendorCredits: any[]
  receipts: any[]
  mileageLogs: any[]
  expenseReports: any[]
  reimbursements: any[]
  rfqs: any[]
  recurringBills: any[]
  paymentRuns: any[]
  perDiem: any[]
}

const companyStore = new Map<string, CompanyState>()
let globalIdCounter = 0

function genId(prefix: string) {
  globalIdCounter += 1
  return `${prefix}-${Date.now()}-${globalIdCounter}`
}

function getCompanyState(companyId: string) {
  if (!companyStore.has(companyId)) {
    companyStore.set(companyId, createCompanyState())
  }
  return companyStore.get(companyId)! 
}

function createCompanyState(): CompanyState {
  return {
    accounts: [
      { id: genId('acc'), code: '1000', name: 'Cash', type: 'Asset', subtype: 'cash', active: true },
      { id: genId('acc'), code: '6000', name: 'Operating Expenses', type: 'Expense', subtype: 'expense', active: true },
      { id: genId('acc'), code: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'payable', active: true },
      { id: genId('acc'), code: '5000', name: 'Cost of Goods Sold', type: 'Expense', subtype: 'cost', active: true },
    ],
    employees: [
      { id: genId('emp'), firstName: 'Alice', lastName: 'Morrison', displayName: 'Alice Morrison', hireDate: '2024-01-15' },
      { id: genId('emp'), firstName: 'Ben', lastName: 'Turner', displayName: 'Ben Turner', hireDate: '2023-10-20' },
    ],
    vendors: [
      { id: genId('ven'), name: 'Acme Supplies', displayName: 'Acme Supplies', status: 'ACTIVE' },
      { id: genId('ven'), name: 'Atlas Freight', displayName: 'Atlas Freight', status: 'ACTIVE' },
    ],
    bills: [],
    billPayments: [],
    purchaseOrders: [],
    purchaseRequests: [],
    vendorCredits: [],
    receipts: [],
    mileageLogs: [],
    expenseReports: [],
    reimbursements: [],
    rfqs: [],
    recurringBills: [],
    paymentRuns: [],
    perDiem: [],
  }
}

function parseQueryParams(url: string) {
  return new URL(url).searchParams
}

function listItems(items: any[], searchParams: URLSearchParams) {
  let result = items

  const search = searchParams.get('search')?.trim().toLowerCase()
  if (search) {
    result = result.filter((item) => {
      return Object.values(item).some((value) => {
        return typeof value === 'string' && value.toLowerCase().includes(search)
      })
    })
  }

  const status = searchParams.get('status')
  if (status) {
    result = result.filter((item) => String(item.status).toLowerCase() === status.toLowerCase())
  }

  const offset = Number(searchParams.get('offset') || 0)
  const limit = Number(searchParams.get('limit') || 0)
  if (limit > 0) {
    result = result.slice(offset, offset + limit)
  }
  return result
}

function findById(items: any[], id: string) {
  return items.find((item) => item.id === id)
}

function removeById(items: any[], id: string) {
  const index = items.findIndex((item) => item.id === id)
  if (index >= 0) items.splice(index, 1)
  return index >= 0
}

async function parseJsonBody(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

function handleNotFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

function handleMethodNotAllowed() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

function buildResponse(data: any) {
  return NextResponse.json(data)
}

function resolveResource(state: CompanyState, namespace: string, resource: string) {
  if (namespace === 'ap' || namespace === 'expenses') {
    switch (resource) {
      case 'vendors': return state.vendors
      case 'bills': return state.bills
      case 'bill-payments': return state.billPayments
      case 'purchase-orders': return state.purchaseOrders
      case 'purchase-requests': return state.purchaseRequests
      case 'vendor-credits': return state.vendorCredits
      case 'receipts': return state.receipts
      case 'mileage': return state.mileageLogs
      case 'rfqs': return state.rfqs
      case 'recurring-bills': return state.recurringBills
      case 'payment-runs': return state.paymentRuns
      case 'per-diem': return state.perDiem
      case 'expenses': return state.expenseReports
      case 'reimbursements': return state.reimbursements
    }
  }
  if (namespace === 'payroll' && resource === 'employees') {
    return state.employees
  }
  if (namespace === 'accounts' && resource === '') {
    return state.accounts
  }
  if (namespace === 'accounts' && resource === 'accounts') {
    return state.accounts
  }
  return null
}

function createBaseItem(resource: string, payload: any) {
  const now = new Date().toISOString()
  switch (resource) {
    case 'vendors':
      return { id: genId('ven'), status: 'ACTIVE', ...payload }
    case 'bills':
      return { id: genId('bill'), status: payload.status || 'OPEN', balance: payload.total ?? 0, billDate: payload.date || now, dueDate: payload.dueAt || payload.dueDate || now, payments: [], ...payload }
    case 'bill-payments':
      return { id: genId('pay'), status: 'COMPLETED', paymentDate: payload.date || now, amount: payload.amount || 0, ...payload }
    case 'purchase-orders':
      return { id: genId('po'), status: payload.status || 'OPEN', date: payload.date || now, lines: payload.lines || [], ...payload }
    case 'purchase-requests':
      return { id: genId('pr'), status: payload.status || 'NEW', requestDate: payload.requestDate || payload.date || now, lines: payload.lines || [], ...payload }
    case 'vendor-credits':
      return { id: genId('vc'), status: payload.status || 'OPEN', date: payload.date || payload.creditDate || now, lines: payload.lines || [], ...payload }
    case 'receipts':
      return { id: genId('rct'), status: payload.status || 'RECEIVED', date: payload.date || payload.receiptDate || now, amount: payload.amount || 0, ...payload }
    case 'mileage':
      return { id: genId('mil'), status: payload.status || 'DRAFT', date: payload.date || payload.logDate || payload.tripDate || now, amount: payload.amount || 0, ...payload }
    case 'rfqs':
      return { id: genId('rfq'), status: payload.status || 'DRAFT', date: payload.date || now, lines: payload.lines || [], ...payload }
    case 'recurring-bills':
      return { id: genId('rb'), status: payload.status || 'ACTIVE', date: payload.date || now, lines: payload.lines || [], ...payload }
    case 'payment-runs':
      return { id: genId('run'), status: payload.status || 'CREATED', date: payload.date || now, bills: payload.bills || [], total: payload.total || 0, ...payload }
    case 'per-diem':
      return { id: genId('pd'), status: payload.status || 'ACTIVE', date: payload.date || payload.logDate || now, ...payload }
    case 'expenses':
      return {
        id: genId('exp'),
        status: payload.status || 'DRAFT',
        employeeId: payload.employeeId || null,
        reimbursable: payload.reimbursable ?? false,
        paymentAccountId: payload.paymentAccountId ?? null,
        description: payload.description ?? null,
        lines: payload.lines || [],
        attachments: payload.attachments || [],
        createdAt: now,
        ...payload,
      }
    case 'reimbursements':
      return {
        id: genId('reim'),
        status: payload.status || 'DRAFT',
        employeeId: payload.employeeId || null,
        paymentMethod: payload.paymentMethod || null,
        description: payload.description || null,
        lines: payload.lines || [],
        createdAt: now,
        ...payload,
      }
    case 'employees':
      return {
        id: genId('emp'),
        firstName: payload.firstName || payload.name || 'Unknown',
        lastName: payload.lastName || '',
        displayName: payload.displayName || `${payload.firstName || 'Unknown'} ${payload.lastName || ''}`.trim(),
        hireDate: payload.hireDate || now,
        ...payload,
      }
    case 'accounts':
      return {
        id: genId('acc'),
        code: payload.code || `ACC-${Math.floor(Math.random() * 9000 + 1000)}`,
        active: payload.active ?? true,
        ...payload,
      }
    default:
      return { id: genId('item'), ...payload }
  }
}

function handleSpecialActions(resource: string, item: any, action: string | undefined, payload: any, state: CompanyState) {
  if (!item) return null

  switch (`${resource}/${action}`) {
    case 'bills/approve':
      item.status = 'APPROVED'; return item
    case 'bills/void':
      item.status = 'VOIDED'; return item
    case 'bills/payments': {
      const payment = createBaseItem('bill-payments', { ...payload, billId: item.id, vendorId: item.vendorId, amount: payload.amount || item.balance || 0 })
      state.billPayments.push(payment)
      item.payments = item.payments || []
      item.payments.push(payment)
      item.balance = Math.max(0, (item.balance || 0) - (payment.amount || 0))
      return payment
    }
    case 'bill-payments/void':
      item.status = 'VOIDED'; return item
    case 'purchase-orders/convert': {
      item.status = 'CONVERTED'
      const bill = createBaseItem('bills', {
        vendorId: item.vendorId,
        total: item.total || 0,
        status: 'OPEN',
        billDate: item.date,
        dueAt: item.expectedAt,
        description: `Converted from PO ${item.id}`,
        lines: item.lines,
      })
      state.bills.push(bill)
      return { id: bill.id }
    }
    case 'vendor-credits/apply':
      item.status = 'APPLIED'; return item
    case 'bills/activity':
      return {
        activity: [
          { id: genId('evt'), type: 'bill', message: `Bill ${item.id} activity fetched`, ts: new Date().toISOString() },
        ],
      }
    case 'vendors/activity':
      return {
        activity: [
          { id: genId('evt'), type: 'vendor', message: `Vendor ${item.id} activity fetched`, ts: new Date().toISOString() },
        ],
      }
    case 'bill-payments/void':
      item.status = 'VOIDED'; return item
    case 'expenses/submit':
      item.status = 'PENDING'; return item
    case 'expenses/approve':
      item.status = 'APPROVED'; return item
    case 'expenses/reimburse':
      item.status = 'REIMBURSED';
      item.paymentMethod = payload?.method || item.paymentMethod || null
      return item
    default:
      return null
  }
}

function routeCollection(method: string, namespace: string, resource: string, id: string | undefined, action: string | undefined, state: CompanyState, req: Request) {
  const items = resolveResource(state, namespace, resource)
  if (!items) return handleNotFound()

  const query = parseQueryParams(req.url)
  const bodyPromise = method === 'GET' || method === 'DELETE' ? Promise.resolve(null) : parseJsonBody(req)

  return bodyPromise.then((body) => {
    if (!id) {
      if (method === 'GET') {
        return buildResponse(listItems(items, query))
      }
      if (method === 'POST') {
        const created = createBaseItem(resource, body || {})
        items.push(created)
        return buildResponse(created)
      }
      return handleMethodNotAllowed()
    }

    const item = findById(items, id)
    if (!item) return handleNotFound()

    if (action) {
      if (method === 'GET') {
        const result = handleSpecialActions(resource, item, action, body, state)
        return result ? buildResponse(result) : handleNotFound()
      }
      if (method !== 'POST' && method !== 'PATCH') return handleMethodNotAllowed()
      const result = handleSpecialActions(resource, item, action, body, state)
      return result ? buildResponse(result) : handleNotFound()
    }

    if (method === 'GET') {
      return buildResponse(item)
    }
    if (method === 'PUT' || method === 'PATCH' || method === 'POST') {
      Object.assign(item, body || {})
      return buildResponse(item)
    }
    if (method === 'DELETE') {
      removeById(items, id)
      return NextResponse.json({ success: true })
    }

    return handleMethodNotAllowed()
  })
}

function routeExpenses(method: string, segments: string[], state: CompanyState, req: Request) {
  const [resource, id, action, extra] = segments
  if (!resource) return handleNotFound()

  // Support both /expenses and nested /expenses/reimbursements
  if (resource === 'expenses' && id === 'reimbursements') {
    return routeCollection(method, 'expenses', 'reimbursements', action, extra, state, req)
  }

  if (resource === 'reimbursements') {
    return routeCollection(method, 'expenses', 'reimbursements', id, action, state, req)
  }

  if (resource === 'expenses') {
    return routeCollection(method, 'expenses', 'expenses', id, action, state, req)
  }

  return handleNotFound()
}

function routePayroll(method: string, segments: string[], state: CompanyState, req: Request) {
  const [resource, id] = segments
  if (resource !== 'employees') return handleNotFound()
  return routeCollection(method, 'payroll', 'employees', id, undefined, state, req)
}

function routeAccounts(method: string, segments: string[], state: CompanyState, req: Request) {
  const [resource, id] = segments
  if (!resource || resource === 'accounts') {
    return routeCollection(method, 'accounts', 'accounts', id, undefined, state, req)
  }
  return handleNotFound()
}

function routeAp(method: string, segments: string[], state: CompanyState, req: Request) {
  const [resource, id, action] = segments
  if (!resource) return handleNotFound()

  if (resource === 'reports' && id === 'aging') {
    if (method !== 'GET') return handleMethodNotAllowed()
    const items = state.bills.concat(state.vendorCredits, state.purchaseOrders, state.receipts)
    const agingData = items.map((item) => ({ id: item.id, status: item.status || 'OPEN', amount: item.total || item.amount || 0 }))
    return buildResponse({ aging: agingData })
  }

  return routeCollection(method, 'ap', resource, id, action, state, req)
}

export async function GET(req: Request, ctx: { params: { companyId: string; segments?: string[] } }) {
  const segments = ctx.params.segments ?? []
  const state = getCompanyState(ctx.params.companyId)

  if (segments[0] === 'ap') return routeAp('GET', segments.slice(1), state, req)
  if (segments[0] === 'expenses') return routeExpenses('GET', segments, state, req)
  if (segments[0] === 'payroll') return routePayroll('GET', segments.slice(1), state, req)
  if (segments[0] === 'accounts') return routeAccounts('GET', segments.slice(1), state, req)
  return handleNotFound()
}

export async function POST(req: Request, ctx: { params: { companyId: string; segments?: string[] } }) {
  const segments = ctx.params.segments ?? []
  const state = getCompanyState(ctx.params.companyId)

  if (segments[0] === 'ap') return routeAp('POST', segments.slice(1), state, req)
  if (segments[0] === 'expenses') return routeExpenses('POST', segments, state, req)
  if (segments[0] === 'payroll') return routePayroll('POST', segments.slice(1), state, req)
  if (segments[0] === 'accounts') return routeAccounts('POST', segments.slice(1), state, req)
  return handleNotFound()
}

export async function PUT(req: Request, ctx: { params: { companyId: string; segments?: string[] } }) {
  const segments = ctx.params.segments ?? []
  const state = getCompanyState(ctx.params.companyId)

  if (segments[0] === 'ap') return routeAp('PUT', segments.slice(1), state, req)
  if (segments[0] === 'expenses') return routeExpenses('PUT', segments, state, req)
  if (segments[0] === 'payroll') return routePayroll('PUT', segments.slice(1), state, req)
  if (segments[0] === 'accounts') return routeAccounts('PUT', segments.slice(1), state, req)
  return handleNotFound()
}

export async function PATCH(req: Request, ctx: { params: { companyId: string; segments?: string[] } }) {
  const segments = ctx.params.segments ?? []
  const state = getCompanyState(ctx.params.companyId)

  if (segments[0] === 'ap') return routeAp('PATCH', segments.slice(1), state, req)
  if (segments[0] === 'expenses') return routeExpenses('PATCH', segments, state, req)
  if (segments[0] === 'payroll') return routePayroll('PATCH', segments.slice(1), state, req)
  if (segments[0] === 'accounts') return routeAccounts('PATCH', segments.slice(1), state, req)
  return handleNotFound()
}

export async function DELETE(req: Request, ctx: { params: { companyId: string; segments?: string[] } }) {
  const segments = ctx.params.segments ?? []
  const state = getCompanyState(ctx.params.companyId)

  if (segments[0] === 'ap') return routeAp('DELETE', segments.slice(1), state, req)
  if (segments[0] === 'expenses') return routeExpenses('DELETE', segments, state, req)
  if (segments[0] === 'payroll') return routePayroll('DELETE', segments.slice(1), state, req)
  if (segments[0] === 'accounts') return routeAccounts('DELETE', segments.slice(1), state, req)
  return handleNotFound()
}
