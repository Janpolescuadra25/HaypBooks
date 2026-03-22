'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Suggested Integrations"
      module="APPS & INTEGRATIONS"
      breadcrumb="Apps & Integrations / Discover / Suggested Integrations"
      purpose="AI-powered integration recommendations tailored to your business type, industry, transaction patterns, and currently connected apps. Discover integrations you didn't know you needed."
      components={[
        { name: "Recommendation Engine", description: "Personalized suggestions based on your business profile and usage patterns" },
        { name: "Reason Cards", description: "Each suggestion shows why it was recommended with specific data points" },
        { name: "Comparison Panel", description: "Side-by-side comparison of similar integration options" },
        { name: "Install from Suggestion", description: "Direct install flow without navigating to the full marketplace" },
      ]}
      tabs={["Recommended","By Industry","Based on Usage"]}
      features={["AI-driven personalization","Reason transparency for each recommendation","Confidence score per suggestion","Usage-based re-ranking","Dismiss and preference learning"]}
      dataDisplayed={["Recommended integration names","Recommendation reason and confidence","Estimated time to set up","Integration compatibility status","Peer adoption rate by industry"]}
      userActions={["View recommendation details","Install suggested integration","Dismiss suggestion","Give feedback on suggestion quality"]}
    />
  )
}

