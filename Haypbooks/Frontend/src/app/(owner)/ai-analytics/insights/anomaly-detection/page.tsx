'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Anomaly Detection"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Insights / Anomaly Detection"
      purpose="Anomaly Detection uses statistical and machine learning models to identify transactions, patterns, and account movements that are unusual compared to historical norms. Anomalies may indicate errors (data entry mistake, processing error, duplicate), unusual business events (large one-off expense, missed revenue), or potential fraud risks (unauthorized expense, unusual supplier payment). Every flagged anomaly shows why it was flagged, the deviation from the expected range, and options to investigate, confirm as intentional, or escalate."
      components={[
        { name: 'Anomaly List', description: 'All flagged anomalies: transaction, account, date, actual value, expected range, deviation %, and severity (high/medium/low).' },
        { name: 'Transaction Anomaly Detail', description: 'For each flag: the specific transaction, the statistical basis (z-score or percentile), and audit trail.' },
        { name: 'Anomaly Categories', description: 'Amount anomalies (too large/small), timing anomalies (unusual day/time for transaction), frequency anomalies (more/fewer transactions than normal).' },
        { name: 'Resolution Workflow', description: 'Investigate → Confirm as Intentional (dismiss) → Escalate to Review. Resolved anomalies feed back into the model for accuracy improvement.' },
      ]}
      tabs={['Active Anomalies', 'Transaction Anomalies', 'Account Anomalies', 'In Review', 'Resolved']}
      features={[
        'ML-based anomaly detection in financial transactions',
        'Severity classification (high/medium/low)',
        'Statistical deviation explanation per flag',
        'Investigation and resolution workflow',
        'Anomaly categories: amount, timing, frequency',
        'Audit-trail linked investigation',
        'Continuous model improvement from feedback',
      ]}
      dataDisplayed={[
        'All active anomaly flags with severity',
        'Transaction details and deviation metrics',
        'Anomaly categories distribution',
        'Resolution status of flagged items',
        'Historical anomaly rate trend',
      ]}
      userActions={[
        'Review all anomaly flags',
        'Investigate a specific anomaly',
        'Mark anomaly as intentional (dismiss)',
        'Escalate high-severity anomaly',
        'View full audit trail for flagged transaction',
        'Export anomaly report',
      ]}
      relatedPages={[
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'AI Recommendations', href: '/ai-analytics/insights/ai-recommendations' },
        { label: 'Audit Trails', href: '/automation/monitoring/audit-trails' },
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
      ]}
    />
  )
}

