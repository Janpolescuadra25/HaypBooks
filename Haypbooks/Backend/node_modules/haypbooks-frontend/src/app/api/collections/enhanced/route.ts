import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'
import type { Invoice, Customer, PromiseToPay } from '@/types/domain'

type CollectionsMetrics = {
  totalOutstanding: number
  currentDue: number
  pastDue: number
  over30: number
  over60: number
  over90: number
  daysOfCashRunway: number
  averageCollectionDays: number
}

type CustomerRiskProfile = {
  customerId: string
  customerName: string
  totalOutstanding: number
  oldestInvoiceDays: number
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  creditUtilization: number
  recommendedAction: string
}

type AgingBucket = {
  label: string
  range: string
  amount: number
  count: number
  percentage: number
}

type CollectionActivity = {
  id: string
  customerId: string
  invoiceId: string
  activityType: 'email' | 'call' | 'letter' | 'promise' | 'dispute' | 'legal'
  date: string
  description: string
  outcome?: 'contacted' | 'payment_promised' | 'dispute_raised' | 'no_response'
  nextAction?: string
  nextActionDate?: string
  createdBy?: string
}

/**
 * Calculate comprehensive collections metrics
 */
function calculateCollectionsMetrics(): CollectionsMetrics {
  const invoices = db.invoices || []
  const today = new Date()
  
  const openInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'void' && inv.balance > 0
  )
  
  const totalOutstanding = openInvoices.reduce((sum, inv) => sum + inv.balance, 0)
  
  let currentDue = 0
  let pastDue = 0
  let over30 = 0
  let over60 = 0
  let over90 = 0
  
  openInvoices.forEach(invoice => {
    const dueDate = new Date(invoice.dueDate || invoice.date)
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysOverdue <= 0) {
      currentDue += invoice.balance
    } else if (daysOverdue <= 30) {
      pastDue += invoice.balance
    } else if (daysOverdue <= 60) {
      over30 += invoice.balance
    } else if (daysOverdue <= 90) {
      over60 += invoice.balance
    } else {
      over90 += invoice.balance
    }
  })
  
  // Calculate average collection days from paid invoices
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  let totalCollectionDays = 0
  let validPaidCount = 0
  
  paidInvoices.forEach(invoice => {
    const lastPayment = invoice.payments?.[invoice.payments.length - 1]
    if (lastPayment) {
      const invoiceDate = new Date(invoice.date)
      const paymentDate = new Date(lastPayment.date)
      const collectionDays = Math.floor((paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))
      if (collectionDays >= 0) {
        totalCollectionDays += collectionDays
        validPaidCount++
      }
    }
  })
  
  const averageCollectionDays = validPaidCount > 0 ? Math.round(totalCollectionDays / validPaidCount) : 0
  
  // Calculate days of cash runway (simplified estimate)
  const monthlyRevenue = totalOutstanding / 3 // Rough estimate
  const daysOfCashRunway = monthlyRevenue > 0 ? Math.round((totalOutstanding / monthlyRevenue) * 30) : 0
  
  return {
    totalOutstanding,
    currentDue,
    pastDue,
    over30,
    over60,
    over90,
    daysOfCashRunway,
    averageCollectionDays
  }
}

/**
 * Generate aging analysis buckets
 */
function generateAgingAnalysis(): AgingBucket[] {
  const invoices = db.invoices || []
  const today = new Date()
  
  const buckets = [
    { label: 'Current', range: '0 days', amount: 0, count: 0 },
    { label: '1-30 days', range: '1-30 days', amount: 0, count: 0 },
    { label: '31-60 days', range: '31-60 days', amount: 0, count: 0 },
    { label: '61-90 days', range: '61-90 days', amount: 0, count: 0 },
    { label: '90+ days', range: '90+ days', amount: 0, count: 0 }
  ]
  
  const openInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'void' && inv.balance > 0
  )
  
  openInvoices.forEach(invoice => {
    const dueDate = new Date(invoice.dueDate || invoice.date)
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let bucketIndex = 0
    if (daysOverdue <= 0) bucketIndex = 0
    else if (daysOverdue <= 30) bucketIndex = 1
    else if (daysOverdue <= 60) bucketIndex = 2
    else if (daysOverdue <= 90) bucketIndex = 3
    else bucketIndex = 4
    
    buckets[bucketIndex].amount += invoice.balance
    buckets[bucketIndex].count += 1
  })
  
  const totalAmount = buckets.reduce((sum, bucket) => sum + bucket.amount, 0)
  
  return buckets.map(bucket => ({
    ...bucket,
    percentage: totalAmount > 0 ? Math.round((bucket.amount / totalAmount) * 100) : 0
  }))
}

/**
 * Calculate customer risk profiles for collections prioritization
 */
function calculateCustomerRiskProfiles(): CustomerRiskProfile[] {
  const customers = db.customers || []
  const invoices = db.invoices || []
  const today = new Date()
  
  return customers.map(customer => {
    const customerInvoices = invoices.filter(inv => 
      inv.customerId === customer.id && 
      inv.status !== 'paid' && 
      inv.status !== 'void' && 
      inv.balance > 0
    )
    
    const totalOutstanding = customerInvoices.reduce((sum, inv) => sum + inv.balance, 0)
    
    if (totalOutstanding === 0) {
      return {
        customerId: customer.id,
        customerName: customer.name,
        totalOutstanding: 0,
        oldestInvoiceDays: 0,
        riskScore: 0,
        riskLevel: 'Low' as const,
        paymentHistory: 'Excellent' as const,
        creditUtilization: 0,
        recommendedAction: 'No action required'
      }
    }
    
    // Calculate oldest invoice days
    let oldestInvoiceDays = 0
    customerInvoices.forEach(invoice => {
      const dueDate = new Date(invoice.dueDate || invoice.date)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysOverdue > oldestInvoiceDays) {
        oldestInvoiceDays = daysOverdue
      }
    })
    
    // Calculate payment history score
    const allCustomerInvoices = invoices.filter(inv => inv.customerId === customer.id)
    const paidOnTime = allCustomerInvoices.filter(inv => {
      if (inv.status !== 'paid') return false
      const lastPayment = inv.payments?.[inv.payments.length - 1]
      if (!lastPayment) return false
      const dueDate = new Date(inv.dueDate || inv.date)
      const paymentDate = new Date(lastPayment.date)
      return paymentDate <= dueDate
    }).length
    
    const paymentHistoryRatio = allCustomerInvoices.length > 0 ? paidOnTime / allCustomerInvoices.length : 1
    let paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor'
    if (paymentHistoryRatio >= 0.95) paymentHistory = 'Excellent'
    else if (paymentHistoryRatio >= 0.8) paymentHistory = 'Good'
    else if (paymentHistoryRatio >= 0.6) paymentHistory = 'Fair'
    else paymentHistory = 'Poor'
    
    // Calculate risk score (0-100)
    let riskScore = 0
    
    // Age factor (0-40 points)
    if (oldestInvoiceDays > 90) riskScore += 40
    else if (oldestInvoiceDays > 60) riskScore += 30
    else if (oldestInvoiceDays > 30) riskScore += 20
    else if (oldestInvoiceDays > 0) riskScore += 10
    
    // Amount factor (0-30 points)
    if (totalOutstanding > 50000) riskScore += 30
    else if (totalOutstanding > 25000) riskScore += 20
    else if (totalOutstanding > 10000) riskScore += 15
    else if (totalOutstanding > 5000) riskScore += 10
    else if (totalOutstanding > 1000) riskScore += 5
    
    // Payment history factor (0-30 points)
    if (paymentHistory === 'Poor') riskScore += 30
    else if (paymentHistory === 'Fair') riskScore += 20
    else if (paymentHistory === 'Good') riskScore += 10
    
    // Credit utilization (simplified)
    const creditLimit = customer.creditLimit || 10000
    const creditUtilization = Math.round((totalOutstanding / creditLimit) * 100)
    
    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
    if (riskScore >= 80) riskLevel = 'Critical'
    else if (riskScore >= 60) riskLevel = 'High'
    else if (riskScore >= 30) riskLevel = 'Medium'
    else riskLevel = 'Low'
    
    // Generate recommended action
    let recommendedAction: string
    if (riskLevel === 'Critical') {
      recommendedAction = 'Immediate escalation - Consider collection agency or legal action'
    } else if (riskLevel === 'High') {
      recommendedAction = 'Urgent follow-up - Schedule payment plan or hold new orders'
    } else if (riskLevel === 'Medium') {
      recommendedAction = 'Regular follow-up - Send reminder and attempt contact'
    } else {
      recommendedAction = 'Standard monitoring - Include in routine collections cycle'
    }
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      totalOutstanding,
      oldestInvoiceDays,
      riskScore,
      riskLevel,
      paymentHistory,
      creditUtilization,
      recommendedAction
    }
  }).filter(profile => profile.totalOutstanding > 0)
   .sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Generate automated collection activities
 */
function generateCollectionActivities(customerId: string): CollectionActivity[] {
  const customer = db.customers?.find(c => c.id === customerId)
  if (!customer) return []
  
  const invoices = (db.invoices || []).filter(inv => 
    inv.customerId === customerId && 
    inv.status !== 'paid' && 
    inv.status !== 'void' && 
    inv.balance > 0
  )
  
  const activities: CollectionActivity[] = []
  const today = new Date()
  
  invoices.forEach(invoice => {
    const dueDate = new Date(invoice.dueDate || invoice.date)
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate activities based on aging
    if (daysOverdue > 0 && daysOverdue <= 30) {
      activities.push({
        id: `act_${Math.random().toString(36).slice(2, 8)}`,
        customerId,
        invoiceId: invoice.id,
        activityType: 'email',
        date: today.toISOString().slice(0, 10),
        description: `First reminder - Invoice ${invoice.number} is ${daysOverdue} days overdue`,
        outcome: 'contacted',
        nextAction: 'Follow up if no payment received',
        nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      })
    } else if (daysOverdue > 30 && daysOverdue <= 60) {
      activities.push({
        id: `act_${Math.random().toString(36).slice(2, 8)}`,
        customerId,
        invoiceId: invoice.id,
        activityType: 'call',
        date: today.toISOString().slice(0, 10),
        description: `Phone follow-up - Invoice ${invoice.number} is ${daysOverdue} days overdue`,
        outcome: 'contacted',
        nextAction: 'Negotiate payment plan',
        nextActionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      })
    } else if (daysOverdue > 60 && daysOverdue <= 90) {
      activities.push({
        id: `act_${Math.random().toString(36).slice(2, 8)}`,
        customerId,
        invoiceId: invoice.id,
        activityType: 'letter',
        date: today.toISOString().slice(0, 10),
        description: `Formal demand letter - Invoice ${invoice.number} is ${daysOverdue} days overdue`,
        outcome: 'contacted',
        nextAction: 'Consider placing account on hold',
        nextActionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      })
    } else if (daysOverdue > 90) {
      activities.push({
        id: `act_${Math.random().toString(36).slice(2, 8)}`,
        customerId,
        invoiceId: invoice.id,
        activityType: 'legal',
        date: today.toISOString().slice(0, 10),
        description: `Legal escalation - Invoice ${invoice.number} is ${daysOverdue} days overdue`,
        outcome: 'contacted',
        nextAction: 'Consider collection agency or legal action',
        nextActionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      })
    }
  })
  
  return activities
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'overview'
  const customerId = url.searchParams.get('customerId')

  switch (action) {
    case 'overview':
      const metrics = calculateCollectionsMetrics()
      const agingAnalysis = generateAgingAnalysis()
      const riskProfiles = calculateCustomerRiskProfiles().slice(0, 10) // Top 10 risky customers
      
      return NextResponse.json({
        metrics,
        agingAnalysis,
        riskProfiles,
        totalCustomersAtRisk: calculateCustomerRiskProfiles().length
      })

    case 'customer_risk':
      const allRiskProfiles = calculateCustomerRiskProfiles()
      return NextResponse.json({ customers: allRiskProfiles })

    case 'aging_detail':
      const agingBuckets = generateAgingAnalysis()
      const invoices = db.invoices || []
      const today = new Date()
      
      const detailedAging = agingBuckets.map(bucket => {
        const bucketInvoices = invoices.filter(inv => {
          if (inv.status === 'paid' || inv.status === 'void' || inv.balance <= 0) return false
          
          const dueDate = new Date(inv.dueDate || inv.date)
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (bucket.label === 'Current') return daysOverdue <= 0
          if (bucket.label === '1-30 days') return daysOverdue > 0 && daysOverdue <= 30
          if (bucket.label === '31-60 days') return daysOverdue > 30 && daysOverdue <= 60
          if (bucket.label === '61-90 days') return daysOverdue > 60 && daysOverdue <= 90
          if (bucket.label === '90+ days') return daysOverdue > 90
          return false
        }).map(inv => {
          const customer = db.customers?.find(c => c.id === inv.customerId)
          const dueDate = new Date(inv.dueDate || inv.date)
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            invoiceId: inv.id,
            invoiceNumber: inv.number,
            customerId: inv.customerId,
            customerName: customer?.name || 'Unknown',
            amount: inv.balance,
            dueDate: inv.dueDate || inv.date,
            daysOverdue: Math.max(0, daysOverdue)
          }
        })
        
        return {
          ...bucket,
          invoices: bucketInvoices
        }
      })
      
      return NextResponse.json({ aging: detailedAging })

    case 'activities':
      if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
      }
      
      const activities = generateCollectionActivities(customerId)
      return NextResponse.json({ activities })

    case 'promises':
      const promises = db.promises || []
      const activePromises = promises.filter(p => p.status === 'open')
      
      return NextResponse.json({ 
        promises: activePromises.map(promise => {
          const customer = db.customers?.find(c => c.id === promise.customerId)
          const invoiceNumbers = promise.invoiceIds.map(invId => {
            const invoice = db.invoices?.find(inv => inv.id === invId)
            return invoice?.number || invId
          })
          
          return {
            ...promise,
            customerName: customer?.name || 'Unknown',
            invoiceNumbers,
            daysUntilDue: Math.ceil((new Date(promise.promisedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          }
        })
      })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 })
  }

  const { action, data } = body

  switch (action) {
    case 'create_promise':
      if (!data.customerId || !data.invoiceIds || !data.promisedDate || !data.amount) {
        return NextResponse.json({ error: 'Customer ID, invoice IDs, promised date, and amount required' }, { status: 400 })
      }
      
      const newPromise: PromiseToPay = {
        id: `ptp_${Math.random().toString(36).slice(2, 8)}`,
        customerId: data.customerId,
        invoiceIds: data.invoiceIds,
        amount: Number(data.amount),
        promisedDate: data.promisedDate,
        status: 'open',
        createdAt: new Date().toISOString(),
        note: data.note || ''
      }
      
      if (!db.promises) db.promises = []
      db.promises.push(newPromise)
      
      return NextResponse.json({
        success: true,
        promise: newPromise,
        message: 'Promise to pay created successfully'
      })

    case 'update_promise_status':
      const { promiseId, status, note } = data
      if (!promiseId || !status) {
        return NextResponse.json({ error: 'Promise ID and status required' }, { status: 400 })
      }
      
      const promise = db.promises?.find(p => p.id === promiseId)
      if (!promise) {
        return NextResponse.json({ error: 'Promise not found' }, { status: 404 })
      }
      
      promise.status = status
      if (note) promise.note = note
      
      if (status === 'kept') {
        promise.keptAt = new Date().toISOString()
      } else if (status === 'broken') {
        promise.brokenAt = new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        promise,
        message: `Promise status updated to ${status}`
      })

    case 'log_activity':
      const { customerId: actCustomerId, invoiceId: actInvoiceId, activityType, description, outcome, nextAction, nextActionDate } = data
      if (!actCustomerId || !activityType || !description) {
        return NextResponse.json({ error: 'Customer ID, activity type, and description required' }, { status: 400 })
      }
      
      const activity: CollectionActivity = {
        id: `act_${Math.random().toString(36).slice(2, 8)}`,
  customerId: actCustomerId,
  invoiceId: actInvoiceId || '',
        activityType,
        date: new Date().toISOString().slice(0, 10),
        description,
        outcome,
        nextAction,
        nextActionDate,
        createdBy: 'current_user' // Would be actual user in real implementation
      }
      
      // Store activity (would need collection activities table in real implementation)
      
      return NextResponse.json({
        success: true,
        activity,
        message: 'Collection activity logged successfully'
      })

    case 'update_dunning_stage':
      const { invoiceId: updInvoiceId, stage } = data
      if (!updInvoiceId || !stage) {
        return NextResponse.json({ error: 'Invoice ID and stage required' }, { status: 400 })
      }
      
  const invoice = db.invoices?.find(inv => inv.id === updInvoiceId)
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      
      invoice.dunningStage = stage
      invoice.lastReminderDate = new Date().toISOString().slice(0, 10)
      invoice.reminderCount = (invoice.reminderCount || 0) + 1
      
      return NextResponse.json({
        success: true,
        invoice,
        message: `Invoice dunning stage updated to ${stage}`
      })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}