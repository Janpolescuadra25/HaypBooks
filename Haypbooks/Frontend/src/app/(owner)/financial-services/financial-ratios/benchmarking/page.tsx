'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Benchmarking"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Financial Ratios / Benchmarking"
      badge="ENT"
      purpose="Benchmarking allows companies to compare their key financial metrics and ratios against industry peers, sector averages, and best-in-class benchmarks. It highlights performance gaps and competitive positioning, showing whether the company's margins, efficiency metrics, and capital efficiency are above or below industry norms. Data is sourced from aggregated anonymized Haypbooks industry data and external benchmark datasets."
      components={[
        { name: 'Industry Selection', description: 'Select industry category (Retail, Manufacturing, Services, Construction, F&B, etc.) and company size range.' },
        { name: 'Benchmark Comparison Grid', description: 'Side-by-side comparison: company value vs. industry 25th percentile, median, 75th percentile, and top quartile.' },
        { name: 'Radar Chart', description: 'Radar/spider chart showing the company\'s overall positioning across 8 key metrics vs. industry average.' },
        { name: 'Gap Analysis', description: 'Highlight which metrics are below industry median with estimated "gap to close" and potential improvement areas.' },
      ]}
      tabs={['Overview', 'Profitability', 'Efficiency', 'Liquidity', 'Growth']}
      features={[
        'Industry and size-segment benchmark comparison',
        'Percentile ranking across key metrics',
        'Radar chart for multi-metric positioning',
        'Gap analysis with improvement potential',
        'Multiple benchmark data sources',
        'Period selection for trend vs. benchmark',
        'Exportable benchmark report',
      ]}
      dataDisplayed={[
        'Company metrics vs. industry percentile bands',
        'Industry median, 25th, 75th, and 90th percentile values',
        'Company percentile ranking for each metric',
        'Gap to industry median per metric',
        'Trend: is the gap widening or closing?',
      ]}
      userActions={[
        'Select industry category and company size',
        'View comparison for specific metric groups',
        'Drill into methodology for any benchmark',
        'Export benchmark comparison report',
        'Set targets based on benchmark data',
      ]}
      relatedPages={[
        { label: 'Ratio Analysis', href: '/financial-services/financial-ratios/ratio-analysis' },
        { label: 'Performance', href: '/home/performance' },
        { label: 'Business Health', href: '/home/business-health' },
        { label: 'AI Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
      ]}
    />
  )
}

