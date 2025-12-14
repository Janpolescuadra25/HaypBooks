import { NextResponse } from 'next/server'
import { formatCurrency } from '@/lib/format'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'
import type { Customer, Invoice } from '@/types/domain'

type CreditLimitAnalysis = {
  customerId: string
  customerName: string
  creditLimit: number
  currentBalance: number
  availableCredit: number
  utilizationPercent: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  recommendedAction: string
  lastCreditReview?: string
  paymentHistory: PaymentHistoryScore
}

type PaymentHistoryScore = {
  totalInvoices: number
  onTimePayments: number
  latePayments: number
  averageDaysLate: number
  onTimePercentage: number
  longestDelayDays: number
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

type PaymentTermsAnalysis = {
  termCode: string
  termDescription: string
  customerCount: number
  averageDSO: number
  onTimePaymentRate: number
  averageInvoiceValue: number
  totalOutstanding: number
  recommendedAction?: string
}

type CustomerAgingDetail = {
  customerId: string
  customerName: string
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  days90plus: number
  totalOutstanding: number
  oldestInvoiceDays: number
  riskScore: number
  suggestedFollowUp: string
}

type AROptimizationRecommendations = {
  creditLimitAdjustments: Array<{
    customerId: string
    customerName: string
    currentLimit: number
    recommendedLimit: number
    reason: string
  }>
  paymentTermChanges: Array<{
    customerId: string
    customerName: string
    currentTerms: string
    recommendedTerms: string
    reason: string
  }>
  collectionPriorities: Array<{
    customerId: string
    customerName: string
    amount: number
    priority: 'High' | 'Medium' | 'Low'
    suggestedAction: string
  }>
}

/**
 * Calculate comprehensive payment history score for a customer
 */
function calculatePaymentHistory(customerId: string): PaymentHistoryScore {
  const customerInvoices = (db.invoices || []).filter(inv => inv.customerId === customerId)
  const paidInvoices = customerInvoices.filter(inv => inv.status === 'paid')
  
  if (paidInvoices.length === 0) {
    return {
      totalInvoices: customerInvoices.length,
      onTimePayments: 0,
      latePayments: 0,
      averageDaysLate: 0,
      onTimePercentage: 0,
      longestDelayDays: 0,
      score: 50, // Neutral score for no history
      grade: 'C'
    }
  }
  
  let onTimePayments = 0
  let totalDaysLate = 0
  let latePaymentCount = 0
  let longestDelayDays = 0
  
  paidInvoices.forEach(invoice => {
    const lastPayment = invoice.payments?.[invoice.payments.length - 1]
    if (lastPayment) {
      const dueDate = new Date(invoice.dueDate || invoice.date)
      const paymentDate = new Date(lastPayment.date)
      const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      
      if (daysLate <= 0) {
        onTimePayments++
      } else {
        latePaymentCount++
        totalDaysLate += daysLate
        longestDelayDays = Math.max(longestDelayDays, daysLate)
      }
    }
  })
  
  const onTimePercentage = paidInvoices.length > 0 ? (onTimePayments / paidInvoices.length) * 100 : 0
  const averageDaysLate = latePaymentCount > 0 ? totalDaysLate / latePaymentCount : 0
  
  // Calculate score (0-100)
  let score = 100
  score -= (latePaymentCount / paidInvoices.length) * 40 // Up to 40 points for late payment frequency
  score -= Math.min(averageDaysLate / 30, 1) * 30 // Up to 30 points for average lateness
  score -= Math.min(longestDelayDays / 90, 1) * 30 // Up to 30 points for worst delay
  
  score = Math.max(0, Math.round(score))
  
  // Assign grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (score >= 90) grade = 'A'
  else if (score >= 80) grade = 'B'
  else if (score >= 70) grade = 'C'
  else if (score >= 60) grade = 'D'
  else grade = 'F'
  
  return {
    totalInvoices: customerInvoices.length,
    onTimePayments,
    latePayments: latePaymentCount,
    averageDaysLate: Math.round(averageDaysLate),
    onTimePercentage: Math.round(onTimePercentage),
    longestDelayDays,
    score,
    grade
  }
}

/**
 * Analyze credit limit utilization and risk for all customers
 */
function analyzeCreditLimits(): CreditLimitAnalysis[] {
  const customers = db.customers || []
  const today = new Date()
  
  return customers.map(customer => {
    const outstandingInvoices = (db.invoices || []).filter(inv => 
      inv.customerId === customer.id && 
      inv.status !== 'paid' && 
      inv.status !== 'void' && 
      inv.balance > 0
    )
    
    const currentBalance = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0)
    const creditLimit = customer.creditLimit || 10000 // Default $10k limit
    const availableCredit = Math.max(0, creditLimit - currentBalance)
    const utilizationPercent = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0
    
    const paymentHistory = calculatePaymentHistory(customer.id)
    
    // Determine risk level based on utilization and payment history
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
    if (utilizationPercent >= 95 || paymentHistory.grade === 'F') {
      riskLevel = 'Critical'
    } else if (utilizationPercent >= 80 || paymentHistory.grade === 'D') {
      riskLevel = 'High'
    } else if (utilizationPercent >= 60 || paymentHistory.grade === 'C') {
      riskLevel = 'Medium'
    } else {
      riskLevel = 'Low'
    }
    
    // Generate recommendations
    let recommendedAction: string
    if (riskLevel === 'Critical') {
      recommendedAction = 'Hold new orders - Require payment before shipping'
    } else if (riskLevel === 'High') {
      recommendedAction = 'Require credit application update - Consider reducing limit'
    } else if (riskLevel === 'Medium') {
      recommendedAction = 'Monitor closely - Review payment terms'
    } else {
      recommendedAction = paymentHistory.grade === 'A' && utilizationPercent < 30 ? 'Consider increasing credit limit' : 'Continue standard terms'
    }
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      creditLimit,
      currentBalance,
      availableCredit,
      utilizationPercent: Math.round(utilizationPercent),
      riskLevel,
      recommendedAction,
      paymentHistory
    }
  }).sort((a, b) => b.utilizationPercent - a.utilizationPercent)
}

/**
 * Analyze payment terms effectiveness
 */
function analyzePaymentTerms(): PaymentTermsAnalysis[] {
  const customers = db.customers || []
  const invoices = db.invoices || []
  
  // Group customers by payment terms
  const termGroups = new Map<string, Customer[]>()
  customers.forEach(customer => {
    const terms = customer.terms || 'Net 30'
    if (!termGroups.has(terms)) {
      termGroups.set(terms, [])
    }
    termGroups.get(terms)!.push(customer)
  })
  
  return Array.from(termGroups.entries()).map(([termCode, customers]) => {
    const customerIds = customers.map(c => c.id)
    const termInvoices = invoices.filter(inv => customerIds.includes(inv.customerId))
    const paidInvoices = termInvoices.filter(inv => inv.status === 'paid')
    const openInvoices = termInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'void')
    
    // Calculate DSO for this term group
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
    
    const averageDSO = validPaidCount > 0 ? Math.round(totalCollectionDays / validPaidCount) : 0
    
    // Calculate on-time payment rate
    const onTimePayments = paidInvoices.filter(invoice => {
      const lastPayment = invoice.payments?.[invoice.payments.length - 1]
      if (!lastPayment) return false
      
      const dueDate = new Date(invoice.dueDate || invoice.date)
      const paymentDate = new Date(lastPayment.date)
      return paymentDate <= dueDate
    }).length
    
    const onTimePaymentRate = paidInvoices.length > 0 ? (onTimePayments / paidInvoices.length) * 100 : 0
    
    const averageInvoiceValue = termInvoices.length > 0 ? 
      termInvoices.reduce((sum, inv) => sum + inv.total, 0) / termInvoices.length : 0
    
    const totalOutstanding = openInvoices.reduce((sum, inv) => sum + inv.balance, 0)
    
    // Generate recommendations
    let recommendedAction: string | undefined
    if (onTimePaymentRate < 70) {
      recommendedAction = 'Consider tightening payment terms or requiring deposits'
    } else if (averageDSO > 45) {
      recommendedAction = 'Review collection procedures for this term group'
    } else if (onTimePaymentRate > 90 && averageDSO < 30) {
      recommendedAction = 'Consider offering early payment discounts'
    }
    
    return {
      termCode,
      termDescription: getTermDescription(termCode),
      customerCount: customers.length,
      averageDSO,
      onTimePaymentRate: Math.round(onTimePaymentRate),
      averageInvoiceValue: Math.round(averageInvoiceValue),
      totalOutstanding: Math.round(totalOutstanding),
      recommendedAction
    }
  }).sort((a, b) => b.totalOutstanding - a.totalOutstanding)
}

/**
 * Generate detailed customer aging analysis
 */
function generateCustomerAging(): CustomerAgingDetail[] {
  const customers = db.customers || []
  const today = new Date()
  
  return customers.map(customer => {
    const openInvoices = (db.invoices || []).filter(inv => 
      inv.customerId === customer.id && 
      inv.status !== 'paid' && 
      inv.status !== 'void' && 
      inv.balance > 0
    )
    
    if (openInvoices.length === 0) {
      return {
        customerId: customer.id,
        customerName: customer.name,
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
        totalOutstanding: 0,
        oldestInvoiceDays: 0,
        riskScore: 0,
        suggestedFollowUp: 'No outstanding invoices'
      }
    }
    
    let current = 0, days1to30 = 0, days31to60 = 0, days61to90 = 0, days90plus = 0
    let oldestInvoiceDays = 0
    
    openInvoices.forEach(invoice => {
      const dueDate = new Date(invoice.dueDate || invoice.date)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      oldestInvoiceDays = Math.max(oldestInvoiceDays, daysOverdue)
      
      if (daysOverdue <= 0) {
        current += invoice.balance
      } else if (daysOverdue <= 30) {
        days1to30 += invoice.balance
      } else if (daysOverdue <= 60) {
        days31to60 += invoice.balance
      } else if (daysOverdue <= 90) {
        days61to90 += invoice.balance
      } else {
        days90plus += invoice.balance
      }
    })
    
    const totalOutstanding = current + days1to30 + days31to60 + days61to90 + days90plus
    
    // Calculate risk score
    let riskScore = 0
    riskScore += (days1to30 / totalOutstanding) * 20
    riskScore += (days31to60 / totalOutstanding) * 40
    riskScore += (days61to90 / totalOutstanding) * 70
    riskScore += (days90plus / totalOutstanding) * 100
    
    // Factor in total amount
    if (totalOutstanding > 50000) riskScore += 20
    else if (totalOutstanding > 25000) riskScore += 10
    else if (totalOutstanding > 10000) riskScore += 5
    
    riskScore = Math.min(100, Math.round(riskScore))
    
    // Generate follow-up suggestion
    let suggestedFollowUp: string
    if (days90plus > 0) {
      suggestedFollowUp = 'Immediate escalation - Consider collection agency'
    } else if (days61to90 > 0) {
      suggestedFollowUp = 'Formal demand letter - Manager follow-up required'
    } else if (days31to60 > 0) {
      suggestedFollowUp = 'Phone call required - Negotiate payment plan'
    } else if (days1to30 > 0) {
      suggestedFollowUp = 'Send reminder email - Standard follow-up'
    } else {
      suggestedFollowUp = 'Monitor - No immediate action required'
    }
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      current: Math.round(current),
      days1to30: Math.round(days1to30),
      days31to60: Math.round(days31to60),
      days61to90: Math.round(days61to90),
      days90plus: Math.round(days90plus),
      totalOutstanding: Math.round(totalOutstanding),
      oldestInvoiceDays,
      riskScore,
      suggestedFollowUp
    }
  }).filter(detail => detail.totalOutstanding > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(): AROptimizationRecommendations {
  const creditAnalysis = analyzeCreditLimits()
  const agingAnalysis = generateCustomerAging()
  
  const creditLimitAdjustments = creditAnalysis
    .filter(analysis => {
      const paymentHistory = analysis.paymentHistory
      return (
        (paymentHistory.grade === 'A' && analysis.utilizationPercent < 30) || // Increase for good customers
        (analysis.riskLevel === 'High' || analysis.riskLevel === 'Critical') // Decrease for risky customers
      )
    })
    .map(analysis => {
      const isIncrease = analysis.paymentHistory.grade === 'A' && analysis.utilizationPercent < 30
      const newLimit = isIncrease ? 
        Math.round(analysis.creditLimit * 1.5) : 
        Math.round(analysis.currentBalance * 1.1) // Slightly above current balance
      
      return {
        customerId: analysis.customerId,
        customerName: analysis.customerName,
        currentLimit: analysis.creditLimit,
        recommendedLimit: newLimit,
        reason: isIncrease ? 
          'Excellent payment history with low utilization' : 
          'High risk due to poor payment history or over-utilization'
      }
    })
  
  const paymentTermChanges = creditAnalysis
    .filter(analysis => analysis.riskLevel === 'High' || analysis.riskLevel === 'Critical')
    .map(analysis => {
      const customer = db.customers?.find(c => c.id === analysis.customerId)
      const currentTerms = customer?.terms || 'Net 30'
      
      return {
        customerId: analysis.customerId,
        customerName: analysis.customerName,
        currentTerms,
        recommendedTerms: 'Net 15',
        reason: 'Reduce risk exposure with shorter payment terms'
      }
    })
  
  const collectionPriorities = agingAnalysis
    .filter(aging => aging.riskScore > 30)
    .slice(0, 10) // Top 10 priorities
    .map(aging => ({
      customerId: aging.customerId,
      customerName: aging.customerName,
      amount: aging.totalOutstanding,
      priority: aging.riskScore >= 70 ? 'High' as const : aging.riskScore >= 50 ? 'Medium' as const : 'Low' as const,
      suggestedAction: aging.suggestedFollowUp
    }))
  
  return {
    creditLimitAdjustments,
    paymentTermChanges,
    collectionPriorities
  }
}

function getTermDescription(termCode: string): string {
  const descriptions: Record<string, string> = {
    'Net 15': 'Payment due within 15 days',
    'Net 30': 'Payment due within 30 days',
    'Net 45': 'Payment due within 45 days',
    'Net 60': 'Payment due within 60 days',
    'Due on receipt': 'Payment due immediately upon receipt',
    '2/10 Net 30': '2% discount if paid within 10 days, otherwise Net 30',
    'COD': 'Cash on delivery'
  }
  return descriptions[termCode] || termCode
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') || 'overview'
  const customerId = url.searchParams.get('customerId')

  switch (action) {
    case 'overview':
      const creditAnalysis = analyzeCreditLimits().slice(0, 20) // Top 20 by utilization
      const paymentTermsAnalysis = analyzePaymentTerms()
      const customerAging = generateCustomerAging().slice(0, 15) // Top 15 by risk
      const recommendations = generateOptimizationRecommendations()
      
      return NextResponse.json({
        creditAnalysis,
        paymentTermsAnalysis,
        customerAging,
        recommendations,
        summary: {
          totalCustomers: db.customers?.length || 0,
          customersAtRisk: creditAnalysis.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length,
          totalCreditExposure: creditAnalysis.reduce((sum, c) => sum + c.currentBalance, 0),
          averageUtilization: creditAnalysis.length > 0 ? 
            Math.round(creditAnalysis.reduce((sum, c) => sum + c.utilizationPercent, 0) / creditAnalysis.length) : 0
        }
      })

    case 'credit_analysis':
      const allCreditAnalysis = analyzeCreditLimits()
      return NextResponse.json({ customers: allCreditAnalysis })

    case 'payment_terms':
      const allPaymentTerms = analyzePaymentTerms()
      return NextResponse.json({ terms: allPaymentTerms })

    case 'customer_aging':
      const allCustomerAging = generateCustomerAging()
      return NextResponse.json({ aging: allCustomerAging })

    case 'customer_detail':
      if (!customerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
      }
      
      const customer = db.customers?.find(c => c.id === customerId)
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      const creditInfo = analyzeCreditLimits().find(c => c.customerId === customerId)
      const agingInfo = generateCustomerAging().find(c => c.customerId === customerId)
      
      return NextResponse.json({
        customer,
        creditAnalysis: creditInfo,
        agingAnalysis: agingInfo,
        paymentHistory: creditInfo?.paymentHistory
      })

    case 'recommendations':
      const allRecommendations = generateOptimizationRecommendations()
      return NextResponse.json(allRecommendations)

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 })
  }

  const { action, data } = body

  switch (action) {
    case 'update_credit_limit':
      const { customerId, newLimit, reason } = data
      if (!customerId || typeof newLimit !== 'number') {
        return NextResponse.json({ error: 'Customer ID and new limit required' }, { status: 400 })
      }
      
      const customer = db.customers?.find(c => c.id === customerId)
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      const oldLimit = customer.creditLimit || 0
      customer.creditLimit = newLimit
      
      // Log the change (would create audit trail in real implementation)
      
      return NextResponse.json({
        success: true,
        message: `Credit limit updated from ${formatCurrency(oldLimit)} to ${formatCurrency(newLimit)}`,
        customer
      })

    case 'update_payment_terms':
      const { customerId: termCustomerId, newTerms, reason: termReason } = data
      if (!termCustomerId || !newTerms) {
        return NextResponse.json({ error: 'Customer ID and new terms required' }, { status: 400 })
      }
      
      const termCustomer = db.customers?.find(c => c.id === termCustomerId)
      if (!termCustomer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      const oldTerms = termCustomer.terms || 'Net 30'
      termCustomer.terms = newTerms
      
      return NextResponse.json({
        success: true,
        message: `Payment terms updated from ${oldTerms} to ${newTerms}`,
        customer: termCustomer
      })

    case 'apply_credit_hold':
      const { customerId: holdCustomerId, reason: holdReason } = data
      if (!holdCustomerId) {
        return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
      }
      
      const holdCustomer = db.customers?.find(c => c.id === holdCustomerId)
      if (!holdCustomer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      // In real implementation, would add credit hold flag to customer record
      
      return NextResponse.json({
        success: true,
        message: `Credit hold applied to ${holdCustomer.name}`,
        reason: holdReason || 'Credit limit exceeded'
      })

    case 'bulk_update_terms':
      const { customerIds, newTerms: bulkTerms } = data
      if (!Array.isArray(customerIds) || !bulkTerms) {
        return NextResponse.json({ error: 'Customer IDs array and new terms required' }, { status: 400 })
      }
      
      let updatedCount = 0
      customerIds.forEach(id => {
        const customer = db.customers?.find(c => c.id === id)
        if (customer) {
          customer.terms = bulkTerms
          updatedCount++
        }
      })
      
      return NextResponse.json({
        success: true,
        message: `Updated payment terms for ${updatedCount} customers to ${bulkTerms}`,
        updatedCount
      })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}