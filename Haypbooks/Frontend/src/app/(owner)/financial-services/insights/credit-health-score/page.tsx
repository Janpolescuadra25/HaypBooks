'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Health Score"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Insights / Credit Health Score"
      badge="FS"
      purpose="Monitor your business credit health score powered by financial data in Haypbooks. Understand factors affecting your score, track changes over time, and act on improvement recommendations."
      components={[
        { name: "Score Card", description: "Current credit health score with grade and trend vs. prior month" },
        { name: "Factor Breakdown", description: "Key factors driving your score: cash flow, debt ratio, payment history" },
        { name: "Improvement Recommendations", description: "Specific actionable steps to improve your credit health score" },
        { name: "Score History Chart", description: "Month-by-month score trend over the past 12 months" },
        { name: "Lender Readiness Summary", description: "High-level financial profile prepared for lending decisions" },
      ]}
      tabs={["Score Overview","Factors","History","Recommendations"]}
      features={["Composite credit health scoring","Factor-level visibility","Trend history","Actionable recommendations","Lender readiness profile"]}
      dataDisplayed={["Current credit health score","Score components and weights","Prior month comparison","Top improvement opportunities","Key financial ratios"]}
      userActions={["View score details","Read factor explanations","Follow improvement steps","View score history","Share with lender"]}
    />
  )
}

