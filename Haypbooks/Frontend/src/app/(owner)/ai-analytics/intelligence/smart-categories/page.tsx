'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Smart Categories"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Intelligence / Smart Categories"
      purpose="Smart Categories is the AI auto-categorization engine that automatically assigns GL account codes to bank transactions, expense receipts, and bill line items based on transaction descriptions, vendor names, and amounts. The model learns from historical categorization decisions made by the accounting team. When new transactions arrive, Smart Categories suggests or automatically applies the most likely GL account, dramatically reducing manual coding time for bookkeepers. Unusual or low-confidence transactions are flagged for human review."
      components={[
        { name: 'Auto-Categorization Queue', description: 'Transactions that have been auto-categorized: transaction, suggested category, confidence score, and option to accept or override.' },
        { name: 'Manual Review Queue', description: 'Transactions where AI confidence is below threshold — needs human categorization before posting.' },
        { name: 'Category Learning Engine', description: 'View and manage categorization rules: if transaction contains "MERALCO", categorize to "Utilities Expense".' },
        { name: 'Training History', description: 'Log of accepted and overridden AI suggestions — feeds back into model accuracy.' },
      ]}
      tabs={['Auto-Categorized', 'Needs Review', 'Categorization Rules', 'Training History', 'Accuracy Stats']}
      features={[
        'AI-powered transaction auto-categorization',
        'Confidence score per categorization',
        'Manual rule creation (if-then rules)',
        'Human review queue for low-confidence items',
        'Model learning from user corrections',
        'Accuracy statistics and category hit rate',
        'Vendor-based category memory',
      ]}
      dataDisplayed={[
        'Transactions with AI-assigned categories and confidence',
        'Awaiting review (below confidence threshold)',
        'Categorization rules configured',
        'AI accuracy rate over time',
        'Most common category corrections',
      ]}
      userActions={[
        'Review and accept auto-categorized transactions',
        'Override an incorrect AI categorization',
        'Create manual categorization rules',
        'Train the model by confirming correct categories',
        'View AI categorization accuracy stats',
      ]}
      relatedPages={[
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'Chart of Accounts', href: '/accounting/core-accounting/chart-of-accounts' },
      ]}
    />
  )
}

